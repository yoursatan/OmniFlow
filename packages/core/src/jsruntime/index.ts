/* ==========================================================
 * JSRuntime — M2 JS 沙箱运行时（接口契约 + 实现方案）
 * 参考：开发规划 §9 JS 沙箱运行时
 *
 * 【背景 · 为什么需要 M2 沙箱】
 * 真实书源/订阅源数据量化证据（fixtures/real-sources.json + real-rss-sources.json）：
 *   - Legado 书源：header 字段 2/29 是 @js: 动态脚本（非 JSON）；exploreUrl 大量 @js:/<js> 动态生成
 *   - 订阅源：enableJs 全 true；sortUrl 3/15 含 @js:/<js>；rule* 含 JS 占比 67%（10/15）
 *   → 卡点 #22（@js: header）、#25（动态 exploreUrl）在 M1 被跳过，导致这些源功能残缺
 *   → M2 沙箱是刚需，目标是让 @js:/<js>/{{}} 规则可求值
 *
 * 【实现路线 · 分阶段】
 *   M1（当前）：本文件仅导出类型与占位，不提供实现。LegadoAdapter 不持有 jsRuntime，
 *               parseHeader/parseExploreUrl 遇 @js: 直接返回 undefined/[]（跳过）。
 *   M2a：实现 QuickJSRuntime（quickjs-emscripten WASM），在 packages/engine-js 包。
 *        本文件导出 createJsRuntime() 工厂，双端同构（Web Worker / Tauri 侧车）。
 *   M2b：补同步阻塞桥（Atomics.wait + Worker）+ java.* 兼容层 + PDFA/PDFH 型片。
 *
 * 【安全限制】（开发规划 §9.1）
 *   单源独立 QuickJS 实例；5s CPU 限时；64MB 内存上限；
 *   无 DOM/BOM 全局；禁止 process/window/document；网络请求统一走宿主 Fetcher。
 * ========================================================== */

/** 沙箱求值选项 */
export interface EvalOptions {
  /** CPU 限时（毫秒），默认 5000 */
  timeoutMs?: number
  /** 内存上限（MB），默认 64 */
  memoryLimitMB?: number
  /** 注入的源上下文变量（source.* / java.get/put 共享） */
  variables?: Record<string, unknown>
  /** 输入数据，作为 result 变量注入沙箱 */
  input?: unknown
}

/** HTTP 请求选项（注入沙箱的 http.* 用） */
export interface SandboxRequestOptions {
  method?: 'GET' | 'POST'
  headers?: Record<string, string>
  body?: string
  charset?: string
  timeoutMs?: number
}

/** 沙箱内可用的 HTTP API（统一走 core Fetcher，禁止沙箱直连网络） */
export interface SandboxHttp {
  get(url: string, options?: SandboxRequestOptions): Promise<unknown>
  post(url: string, data: unknown, options?: SandboxRequestOptions): Promise<unknown>
  /** 同步风格包装（M2b 同步桥实现，hiker/drpy req() 依赖） */
  ajax(url: string, options?: SandboxRequestOptions): unknown
}

/** 沙箱内可用的 Cookie/存储 API */
export interface SandboxStorage {
  get(url: string): string
  set(url: string, cookie: string): void
}

/** 沙箱注入 API 清单（开发规划 §9.2） */
export interface JSRuntimeAPI {
  http: SandboxHttp
  /** DOM 操作（cheerio 包装） */
  dom: {
    parse(html: string): unknown
    select(el: unknown, selector: string): unknown
  }
  /** 加密工具 */
  crypto: {
    md5(s: string): string
    sha1(s: string): string
    sha256(s: string): string
    base64: { encode(s: string): string; decode(s: string): string }
  }
  /** 源上下文变量（跨规则段持久） */
  source: { get(key: string): unknown; set(key: string, value: unknown): void }
  /** Legado java.* 兼容层（put/get 同 source） */
  java: { put(key: string, value: unknown): void; get(key: string): unknown }
  cookieJar: SandboxStorage
  localStorage: { get(key: string): string | null; set(key: string, value: string): void }
  log: { debug(...args: unknown[]): void; info(...args: unknown[]): void; error(...args: unknown[]): void }
  /** Hiker/DRPy 快捷函数 */
  pdfh(html: string, rule: string): string
  pdfa(html: string, rule: string): unknown[]
  pdfs(html: string, rule: string): string
}

/**
 * JS 沙箱运行时接口（M2 实现）
 *
 * 集成点（M2 在 LegadoAdapter 注入）：
 *   - LegadoAdapter 构造函数接收 `jsRuntime?: JSRuntime`
 *   - parseHeader：检测 header 以 `@js:` 开头时，调 jsRuntime.evalSync 求值返回 JSON 字符串再解析
 *   - parseExploreUrl：检测 exploreUrl 以 `@js:`/`<js>` 开头时，调 jsRuntime.evalSync 求值返回数组
 *   - parseSearchUrl：@js: 后缀部分调 jsRuntime.evalSync 求值生成 URL
 *   - 规则执行：RuleSegment 含 jsEval action 的步骤，调 jsRuntime.evalSync 求值
 *
 * 同步语义：Legado 规则期望同步返回（header/sortUrl/bookList），故核心用 evalSync。
 * M2b 同步桥用 Atomics.wait + Worker 实现「同步外观、异步实现」。
 */
export interface JSRuntime {
  /** 异步求值（Web 端主路径，返回 Promise） */
  eval(code: string, options?: EvalOptions): Promise<unknown>
  /** 同步求值（桌面端 / 同步桥场景；Web 端经同步桥模拟） */
  evalSync(code: string, options?: EvalOptions): unknown
  /** 预加载 JS 库（jsLib / injectJs / preloadJs），后续 eval 可复用 */
  preloadLib(code: string): void
  /** 释放沙箱实例（单源用完即毁，防泄漏） */
  dispose(): void
}

/* ---------- 派生工具：针对 @js: 卡点的求值器（M2 实现） ---------- */

/**
 * 求值 @js: header → 返回 header 对象
 * 形如 `@js: JSON.stringify({Referer:..., User-Agent:...})` 的脚本，求值后 JSON.parse
 * 集成点：LegadoAdapter.parseHeader（卡点 #22）
 */
export function evalHeader(
  jsRuntime: JSRuntime,
  headerScript: string,
  options?: EvalOptions
): Record<string, string> | undefined {
  // 剥离 @js: 前缀
  const code = headerScript.replace(/^@js:/, '').trim()
  const result = jsRuntime.evalSync(code, options)
  if (typeof result !== 'string') return undefined
  try {
    const parsed = JSON.parse(result)
    return typeof parsed === 'object' && parsed !== null
      ? (parsed as Record<string, string>)
      : undefined
  } catch {
    return undefined
  }
}

/**
 * 求值动态 exploreUrl → 返回发现条目数组
 * 形如 `@js: [{title:'..',url:'..'}, ...]` 或 `<js>...</js>` 的脚本
 * 集成点：LegadoAdapter.parseExploreUrl（卡点 #25）
 */
export function evalExploreUrl(
  jsRuntime: JSRuntime,
  exploreScript: string,
  options?: EvalOptions
): Array<{ title: string; url: string }> {
  const code = exploreScript.replace(/^@js:/, '').replace(/^<js>/, '').replace(/<\/js>$/, '').trim()
  if (!code) return []
  const result = jsRuntime.evalSync(code, options)
  if (!Array.isArray(result)) return []
  return result
    .filter((item): item is Record<string, unknown> =>
      typeof item === 'object' && item !== null && 'url' in item && 'title' in item)
    .map(item => ({ title: String(item.title), url: String(item.url) }))
}

/**
 * 求值 searchUrl 的 @js: 后缀 → 返回最终 URL
 * 集成点：LegadoAdapter.parseSearchUrl
 */
export function evalSearchUrl(
  jsRuntime: JSRuntime,
  searchScript: string,
  options?: EvalOptions
): string | undefined {
  const code = searchScript.replace(/^@js:/, '').replace(/^<js>/, '').replace(/<\/js>$/, '').trim()
  if (!code) return undefined
  const result = jsRuntime.evalSync(code, options)
  return typeof result === 'string' ? result : undefined
}

// M1 占位：不导出运行时实现，仅类型。
// M2a 将在 packages/engine-js 实现 QuickJSRuntime 并通过工厂 createJsRuntime() 导出。
export {};
