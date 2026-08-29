/* ==========================================================
 * LegadoAdapter — Legado 书源适配器（完整版）
 * 将 Legado BookSource JSON 转换为 UnifiedSource IR
 *
 * 参考来源：
 *   - gedoor/legado BookSource.kt（30 字段实体定义）
 *   - 真实书源 JSON：wenku8 / masiro / rezero（jiwangyihao/source-j-legado）
 *   - any-reader packages/legado（TypeScript 解析参考）
 *
 * Legado 书源 JSON 结构（30 字段）:
 *   基础: bookSourceUrl(PK), bookSourceName, bookSourceGroup, bookSourceType,
 *         bookUrlPattern, customOrder, enabled, enabledExplore, enabledCookieJar,
 *         concurrentRate, header, loginUrl, loginUi, loginCheckJs, coverDecodeJs,
 *         bookSourceComment, variableComment, lastUpdateTime, respondTime, weight,
 *         jsLib
 *   URL:  searchUrl, exploreUrl, loginUrl
 *   规则: ruleSearch, ruleBookInfo, ruleToc, ruleContent, ruleExplore, ruleReview
 * ========================================================== */

import type {
  UnifiedSource,
  RulePipeline,
  RuleSegment,
  SourceKind,
  SourceFormat,
  OmniRequest,
} from '@omniflow/shared'

/* ---------- Legado 原始 JSON 类型定义 ---------- */

/** Legado 搜索规则 */
export interface LegadoSearchRule {
  bookList?: string
  name?: string
  author?: string
  intro?: string
  coverUrl?: string
  bookUrl?: string
  kind?: string
  lastChapter?: string
  wordCount?: string
  checkKeyWord?: string
}

/** Legado 详情页规则 */
export interface LegadoBookInfoRule {
  init?: string
  name?: string
  author?: string
  intro?: string
  coverUrl?: string
  tocUrl?: string
  kind?: string
  lastChapter?: string
  wordCount?: string
  canReName?: string
}

/** Legado 目录规则 */
export interface LegadoTocRule {
  chapterList?: string
  chapterName?: string
  chapterUrl?: string
  isVolume?: string
  isVip?: string
  updateTime?: string
}

/** Legado 正文规则 */
export interface LegadoContentRule {
  content?: string
  replaceRegex?: string
  nextContentUrl?: string
  imageStyle?: string
  payAction?: string
}

/** Legado 发现规则 */
export interface LegadoExploreRule {
  bookList?: string
  name?: string
  author?: string
  intro?: string
  coverUrl?: string
  bookUrl?: string
  kind?: string
  lastChapter?: string
}

/** Legado 书源 JSON 原始结构（对应 BookSource.kt 30 字段） */
export interface LegadoBookSource {
  // ---- 基础信息 ----
  bookSourceUrl: string
  bookSourceName: string
  bookSourceGroup?: string
  /** 0=文本 1=音频 2=图片 3=文件 */
  bookSourceType?: number
  bookUrlPattern?: string
  customOrder?: number
  enabled?: boolean
  enabledExplore?: boolean
  enabledCookieJar?: boolean
  // ---- 请求配置 ----
  concurrentRate?: string
  /** JSON 字符串，如 {"Referer":"https://...","User-Agent":"..."} */
  header?: string
  loginUrl?: string
  loginUi?: string
  loginCheckJs?: string
  coverDecodeJs?: string
  // ---- 元信息 ----
  bookSourceComment?: string
  variableComment?: string
  lastUpdateTime?: number
  respondTime?: number
  weight?: number
  jsLib?: string
  // ---- URL ----
  searchUrl?: string
  exploreUrl?: string
  // ---- 规则 ----
  ruleSearch?: LegadoSearchRule
  ruleBookInfo?: LegadoBookInfoRule
  ruleToc?: LegadoTocRule
  ruleContent?: LegadoContentRule
  ruleExplore?: LegadoExploreRule
}

/** searchUrl 解析结果 */
interface ParsedSearchUrl {
  url: string
  method: 'GET' | 'POST'
  charset?: string
  headers?: Record<string, string>
  body?: string
}

/** exploreUrl 条目 */
export interface ExploreItem {
  title: string
  url: string
}

/**
 * Legado 适配器
 */
export class LegadoAdapter {
  /** 解析 Legado 书源 JSON → UnifiedSource[] */
  parse(json: LegadoBookSource | LegadoBookSource[]): UnifiedSource[] {
    const sources = Array.isArray(json) ? json : [json]
    return sources.map(s => this.parseOne(s)).filter(Boolean) as UnifiedSource[]
  }

  /** 解析单个书源 */
  private parseOne(src: LegadoBookSource): UnifiedSource | null {
    if (!src.bookSourceName || !src.bookSourceUrl) return null

    const baseUrl = src.bookSourceUrl
    const id = `legado:${baseUrl}`
    const kind = this.mapBookType(src.bookSourceType ?? 0)
    const header = this.parseHeader(src.header)

    return {
      id,
      name: src.bookSourceName,
      kind,
      format: 'legado3_book' as SourceFormat,
      group: src.bookSourceGroup,
      homeUrl: baseUrl,
      enabled: src.enabled ?? true,
      explore: this.buildExplorePipeline(src, baseUrl, header),
      search: this.buildSearchPipeline(src, baseUrl, header),
      detail: this.buildDetailPipeline(src, baseUrl, header),
      toc: this.buildTocPipeline(src, baseUrl, header),
      content: this.buildContentPipeline(src, baseUrl, header),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ['legado', `type:${src.bookSourceType ?? 0}`],
    }
  }

  /** bookSourceType → SourceKind */
  private mapBookType(type: number): SourceKind {
    switch (type) {
      case 1: return 'music'    // 音频
      case 2: return 'comic'    // 图片/漫画
      case 3: return 'custom'    // 文件
      default: return 'book'     // 0 = 文本
    }
  }

  /** 解析 header JSON 字符串 → Record<string, string> */
  private parseHeader(header?: string): Record<string, string> | undefined {
    if (!header) return undefined
    try {
      const parsed = JSON.parse(header)
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed as Record<string, string>
      }
    } catch {
      // header 不是合法 JSON，忽略
    }
    return undefined
  }

  /**
   * 解析 searchUrl — 处理相对路径、JSON 选项、@js 后缀
   * 格式举例:
   *   "/search?q={{key}}&page={{page}}"
   *   "/search?q={{key}},{ "charset": "gbk" }"
   *   "https://full.url/search?q={{key}}"
   *   "url@js:..." (JS 部分暂跳过)
   */
  private parseSearchUrl(searchUrl: string | undefined, baseUrl: string): ParsedSearchUrl {
    const fallback: ParsedSearchUrl = {
      url: `${baseUrl}/search?q={{key}}&page={{page}}`,
      method: 'GET',
    }
    if (!searchUrl) return fallback

    let raw = searchUrl.trim()

    // 去除 @js: / <js>...</js> 后缀（M1 暂不支持 JS 求值）
    const jsAt = raw.indexOf('@js:')
    if (jsAt >= 0) raw = raw.slice(0, jsAt).trim()
    raw = raw.replace(/<js>[\s\S]*?<\/js>/gi, '').trim()

    if (!raw) return fallback

    // 分离 URL 和 JSON 选项（以 ,{ 开头的部分）
    let jsonOptions: Record<string, unknown> | undefined
    const optMatch = raw.match(/,\s*(\{[\s\S]*\})\s*$/)
    if (optMatch) {
      raw = raw.slice(0, raw.length - optMatch[0].length).trim()
      try {
        jsonOptions = JSON.parse(optMatch[1]!)
      } catch {
        // JSON 解析失败，保留原始 URL
      }
    }

    // 处理相对 URL
    let url = raw
    if (url.startsWith('/')) {
      url = baseUrl + url
    } else if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = baseUrl + '/' + url
    }

    const method = (jsonOptions?.method as string)?.toUpperCase() === 'POST' ? 'POST' : 'GET'
    const charset = jsonOptions?.charset as string | undefined
    const body = jsonOptions?.body as string | undefined
    let headers = this.parseHeader(jsonOptions?.headers as string | undefined)
    // 合并书源级 header
    if (jsonOptions?.headers) {
      headers = { ...headers }
    }

    const result: ParsedSearchUrl = { url, method }
    if (charset) result.charset = charset as never
    if (headers) result.headers = headers
    if (body) result.body = body
    return result
  }

  /**
   * 解析 exploreUrl — 静态 JSON 数组
   * 格式举例:
   *   '[{"title":"分类","url":"/explore/{{page}}"}]'
   *   "@js:..." (动态生成，M1 暂不支持)
   */
  private parseExploreUrl(exploreUrl: string | undefined): ExploreItem[] {
    if (!exploreUrl) return []
    const raw = exploreUrl.trim()
    // @js: 动态生成 — M1 跳过
    if (raw.startsWith('@js:') || raw.startsWith('<js>')) return []
    // 尝试 JSON 数组解析
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        return parsed
          .filter((item: unknown): item is Record<string, unknown> =>
            typeof item === 'object' && item !== null && 'url' in item && 'title' in item
          )
          .map(item => ({
            title: String(item.title),
            url: String(item.url),
          }))
      }
    } catch {
      // 非 JSON，可能是多行 URL 格式（暂不支持）
    }
    return []
  }

  /** 构建 request 对象 */
  private buildRequest(
    parsed: ParsedSearchUrl,
    baseUrl: string,
    header?: Record<string, string>
  ): Partial<OmniRequest> {
    const req: Partial<OmniRequest> = {
      url: parsed.url,
      method: parsed.method,
    }
    // 合并 header：书源级 > URL 选项级
    const mergedHeaders = { ...header, ...parsed.headers }
    if (Object.keys(mergedHeaders).length > 0) {
      req.headers = mergedHeaders
    }
    if (parsed.charset) req.charset = parsed.charset as never
    if (parsed.body) req.body = parsed.body
    return req
  }

  /** 构建搜索管道 */
  private buildSearchPipeline(
    src: LegadoBookSource,
    baseUrl: string,
    header?: Record<string, string>
  ): RulePipeline {
    const rules = src.ruleSearch ?? {}
    const parsed = this.parseSearchUrl(src.searchUrl, baseUrl)
    const request = this.buildRequest(parsed, baseUrl, header)

    // Legado 搜索规则不是串行步骤，而是 listRule + fields 模式
    const fields: Record<string, string> = {}
    if (rules.name) fields['name'] = rules.name
    if (rules.author) fields['author'] = rules.author
    if (rules.intro) fields['intro'] = rules.intro
    if (rules.coverUrl) fields['coverUrl'] = rules.coverUrl
    if (rules.bookUrl) fields['bookUrl'] = rules.bookUrl
    if (rules.kind) fields['kind'] = rules.kind
    if (rules.lastChapter) fields['lastChapter'] = rules.lastChapter
    if (rules.wordCount) fields['wordCount'] = rules.wordCount

    const segment: RuleSegment = {
      id: 'search-main',
      label: '搜索',
      request,
      steps: [],
    }
    if (rules.bookList) segment.listRule = rules.bookList
    if (Object.keys(fields).length > 0) segment.fields = fields

    return {
      name: 'search',
      segments: [segment],
      defaults: { url: baseUrl },
    }
  }

  /** 构建详情管道 */
  private buildDetailPipeline(
    src: LegadoBookSource,
    baseUrl: string,
    header?: Record<string, string>
  ): RulePipeline {
    const rules = src.ruleBookInfo ?? {}
    const detailUrl = `${baseUrl}/book/{{nativeId}}`

    // 详情页是字段提取模式（无 listRule）
    const fields: Record<string, string> = {}
    if (rules.name) fields['name'] = rules.name
    if (rules.author) fields['author'] = rules.author
    if (rules.intro) fields['intro'] = rules.intro
    if (rules.coverUrl) fields['coverUrl'] = rules.coverUrl
    if (rules.tocUrl) fields['tocUrl'] = rules.tocUrl
    if (rules.kind) fields['kind'] = rules.kind
    if (rules.lastChapter) fields['lastChapter'] = rules.lastChapter
    if (rules.wordCount) fields['wordCount'] = rules.wordCount

    const segment: RuleSegment = {
      id: 'detail-main',
      label: '详情',
      request: { url: detailUrl, method: 'GET', ...(header ? { headers: header } : {}) },
      steps: [],
    }
    if (Object.keys(fields).length > 0) segment.fields = fields

    return {
      name: 'detail',
      segments: [segment],
      defaults: { url: baseUrl },
    }
  }

  /** 构建目录管道 */
  private buildTocPipeline(
    src: LegadoBookSource,
    baseUrl: string,
    header?: Record<string, string>
  ): RulePipeline {
    const rules = src.ruleToc ?? {}
    const tocUrl = `${baseUrl}/toc/{{nativeId}}`

    const fields: Record<string, string> = {}
    if (rules.chapterName) fields['chapterName'] = rules.chapterName
    if (rules.chapterUrl) fields['chapterUrl'] = rules.chapterUrl
    if (rules.isVolume) fields['isVolume'] = rules.isVolume
    if (rules.isVip) fields['isVip'] = rules.isVip
    if (rules.updateTime) fields['updateTime'] = rules.updateTime

    const segment: RuleSegment = {
      id: 'toc-main',
      label: '目录',
      request: { url: tocUrl, method: 'GET', ...(header ? { headers: header } : {}) },
      steps: [],
    }
    if (rules.chapterList) segment.listRule = rules.chapterList
    if (Object.keys(fields).length > 0) segment.fields = fields

    return {
      name: 'toc',
      segments: [segment],
      defaults: { url: baseUrl },
    }
  }

  /** 构建正文管道 */
  private buildContentPipeline(
    src: LegadoBookSource,
    baseUrl: string,
    header?: Record<string, string>
  ): RulePipeline {
    const rules = src.ruleContent ?? {}
    const contentUrl = `${baseUrl}/content/{{chapterId}}`

    // 正文是串行步骤：先提取 content，再执行 replaceRegex
    const steps: RuleSegment['steps'] = []
    if (rules.content) {
      steps.push({ action: 'jsoup', expr: rules.content, name: 'content' })
    }
    if (rules.replaceRegex) {
      steps.push({ action: 'replace', expr: rules.replaceRegex, name: 'replace' })
    }

    return {
      name: 'content',
      segments: [
        {
          id: 'content-main',
          label: '正文',
          request: { url: contentUrl, method: 'GET', ...(header ? { headers: header } : {}) },
          steps,
        },
      ],
      defaults: { url: baseUrl },
    }
  }

  /** 构建发现管道 */
  private buildExplorePipeline(
    src: LegadoBookSource,
    baseUrl: string,
    header?: Record<string, string>
  ): RulePipeline | undefined {
    const rules = src.ruleExplore ?? {}
    const exploreItems = this.parseExploreUrl(src.exploreUrl)

    // exploreUrl 是 @js: 动态生成 → M1 无法确定 URL → 不生成发现管道
    const rawExplore = src.exploreUrl?.trim() ?? ''
    if (rawExplore.startsWith('@js:') || rawExplore.startsWith('<js>')) return undefined

    // 如果没有 exploreUrl 且没有 ruleExplore.bookList → 不生成发现管道
    if (exploreItems.length === 0 && !rules.bookList) return undefined

    // 使用第一个 exploreUrl 条目作为发现页 URL
    const exploreUrl = exploreItems[0]?.url
      ? (exploreItems[0].url.startsWith('/')
          ? baseUrl + exploreItems[0].url
          : exploreItems[0].url)
      : `${baseUrl}/explore/{{page}}`

    const fields: Record<string, string> = {}
    if (rules.name) fields['name'] = rules.name
    if (rules.author) fields['author'] = rules.author
    if (rules.intro) fields['intro'] = rules.intro
    if (rules.coverUrl) fields['coverUrl'] = rules.coverUrl
    if (rules.bookUrl) fields['bookUrl'] = rules.bookUrl
    if (rules.kind) fields['kind'] = rules.kind
    if (rules.lastChapter) fields['lastChapter'] = rules.lastChapter

    const segment: RuleSegment = {
      id: 'explore-main',
      label: '发现',
      request: { url: exploreUrl, method: 'GET', ...(header ? { headers: header } : {}) },
      steps: [],
    }
    if (rules.bookList) segment.listRule = rules.bookList
    if (Object.keys(fields).length > 0) segment.fields = fields

    return {
      name: 'explore',
      segments: [segment],
      defaults: { url: baseUrl },
    }
  }
}
