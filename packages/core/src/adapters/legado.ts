/* ==========================================================
 * LegadoAdapter — Legado 书源适配器（完整版）
 * 将 Legado BookSource JSON 转换为 UnifiedSource IR
 *
 * 参考来源：
 *   - LegadoTeam/legado app/src/main/java/io/legado/app/data/entities/BookSource.kt
 *   - LegadoTeam/legado .../entities/rule/{Search,BookInfo,Toc,Content,Explore,Review}Rule.kt
 *   - 真实书源 JSON：测试书源.json（29 个真实书源，含微博/废文网/书荒网等）
 *   - any-reader packages/legado（TypeScript 解析参考）
 *
 * Legado 书源 JSON 结构（与 BookSource.kt 实体对齐）:
 *   基础: bookSourceUrl(PK), bookSourceName, bookSourceGroup, bookSourceType(0-4),
 *         bookUrlPattern, customOrder, enabled, enabledExplore, enabledCookieJar,
 *         jsLib, concurrentRate, header, loginUrl, loginUi, loginCheckJs,
 *         coverDecodeJs, bookSourceComment, variableComment, lastUpdateTime,
 *         respondTime, weight
 *   URL:  exploreUrl, exploreScreen, searchUrl
 *   规则: ruleExplore, ruleSearch, ruleBookInfo, ruleToc, ruleContent, ruleReview
 *   脚本: mainJs, eventListener, customButton, (扩展) homepageModules
 * ========================================================== */

import type {
  UnifiedSource,
  RulePipeline,
  RuleSegment,
  SourceKind,
  SourceFormat,
  OmniRequest,
} from '@omniflow/shared'

/* ---------- Legado 原始 JSON 类型定义 ----------
 * 字段来源：LegadoTeam/legado
 *   - app/src/main/java/io/legado/app/data/entities/BookSource.kt
 *   - app/src/main/java/io/legado/app/data/entities/rule/{Search,BookInfo,Toc,Content,Explore,Review}Rule.kt
 * 字段命名与 Kotlin data class 完全一致（驼峰），便于 JSON 直解。
 * ----------------------------------------- */

/** Legado 搜索规则（对应 SearchRule.kt，实现 BookListRule 接口） */
export interface LegadoSearchRule {
  /** 校验关键字 */
  checkKeyWord?: string
  bookList?: string
  name?: string
  author?: string
  intro?: string
  kind?: string
  lastChapter?: string
  updateTime?: string
  bookUrl?: string
  coverUrl?: string
  wordCount?: string
}

/** Legado 详情页规则（对应 BookInfoRule.kt） */
export interface LegadoBookInfoRule {
  /** 进入详情页后执行的初始化 JS */
  init?: string
  name?: string
  author?: string
  intro?: string
  kind?: string
  lastChapter?: string
  updateTime?: string
  coverUrl?: string
  /** 目录页 URL（可与详情页不同） */
  tocUrl?: string
  wordCount?: string
  /** 是否允许重命名 */
  canReName?: string
  /** 下载地址（文件型书源） */
  downloadUrls?: string
}

/** Legado 目录规则（对应 TocRule.kt） */
export interface LegadoTocRule {
  /** 更新前执行的 JS */
  preUpdateJs?: string
  chapterList?: string
  chapterName?: string
  chapterUrl?: string
  /** 格式化 JS */
  formatJs?: string
  /** 是否分卷 */
  isVolume?: string
  /** 是否 VIP */
  isVip?: string
  /** 是否付费 */
  isPay?: string
  updateTime?: string
  /** 下一页目录 URL（分页目录） */
  nextTocUrl?: string
}

/** Legado 正文规则（对应 ContentRule.kt） */
export interface LegadoContentRule {
  content?: string
  /** 副文规则，拼接在正文后面或获取歌词等 */
  subContent?: string
  /** 有些网站只能在正文中获取标题 */
  title?: string
  nextContentUrl?: string
  /** 正文页注入执行的 JS */
  webJs?: string
  /** 源文本正则（用于网页正文定位） */
  sourceRegex?: string
  /** 替换规则 */
  replaceRegex?: string
  /** 图片样式：默认大小居中，FULL 最大宽度 */
  imageStyle?: string
  /** 图片 bytes 二次解密 js，返回解密后的 bytes */
  imageDecode?: string
  /** 购买操作：js 或包含 {{js}} 的 url */
  payAction?: string
  /** 监听到事件后执行的回调 js 代码 */
  callBackJs?: string
}

/** Legado 发现规则（对应 ExploreRule.kt，实现 BookListRule 接口） */
export interface LegadoExploreRule {
  bookList?: string
  name?: string
  author?: string
  intro?: string
  kind?: string
  lastChapter?: string
  updateTime?: string
  bookUrl?: string
  coverUrl?: string
  wordCount?: string
}

/** Legado 段评规则（对应 ReviewRule.kt，M1 不深度使用，仅保留字段） */
export interface LegadoReviewRule {
  reviewUrl?: string
  avatar?: string
  content?: string
  updateTime?: string
  author?: string
  postUrl?: string
  nextUrl?: string
  star?: string
  /** 点赞数规则 */
  upvote?: string
  /** 点踩数规则 */
  downvote?: string
}

/**
 * Legado 书源 JSON 原始结构（对应 BookSource.kt 实体定义）
 * 注：真实导出的书源 JSON 可能携带官方实体未声明的扩展字段
 *     （如 homepageModules），此类字段以可选形式保留以避免解析失败。
 */
export interface LegadoBookSource {
  // ---- 基础信息 ----
  /** 地址（主键），包括 http/https */
  bookSourceUrl: string
  /** 名称 */
  bookSourceName: string
  /** 分组 */
  bookSourceGroup?: string
  /** 0=文本 1=音频 2=图片 3=文件 4=视频 */
  bookSourceType?: number
  /** 详情页 url 正则 */
  bookUrlPattern?: string
  /** 手动排序编号 */
  customOrder?: number
  /** 是否启用 */
  enabled?: boolean
  /** 启用发现 */
  enabledExplore?: boolean
  /** js 库 */
  jsLib?: string
  /** 启用 okhttp CookieJar 自动保存每次请求的 cookie */
  enabledCookieJar?: boolean
  // ---- 请求配置 ----
  /** 并发率 */
  concurrentRate?: string
  /** 请求头 JSON 字符串，如 {"Referer":"https://...","User-Agent":"..."} */
  header?: string
  /** 登录地址 */
  loginUrl?: string
  /** 登录 UI */
  loginUi?: string
  /** 登录检测 js */
  loginCheckJs?: string
  /** 封面解密 js */
  coverDecodeJs?: string
  // ---- 元信息 ----
  /** 注释 */
  bookSourceComment?: string
  /** 自定义变量说明 */
  variableComment?: string
  /** 最后更新时间，用于排序（毫秒） */
  lastUpdateTime?: number
  /** 响应时间，用于排序（毫秒） */
  respondTime?: number
  /** 智能排序的权重 */
  weight?: number
  // ---- URL ----
  /** 发现 url */
  exploreUrl?: string
  /** 发现筛选规则（部分版本） */
  exploreScreen?: string
  /** 搜索 url */
  searchUrl?: string
  // ---- 规则 ----
  /** 发现规则 */
  ruleExplore?: LegadoExploreRule
  /** 搜索规则 */
  ruleSearch?: LegadoSearchRule
  /** 书籍信息页规则 */
  ruleBookInfo?: LegadoBookInfoRule
  /** 目录页规则 */
  ruleToc?: LegadoTocRule
  /** 正文页规则 */
  ruleContent?: LegadoContentRule
  /** 段评规则 */
  ruleReview?: LegadoReviewRule
  /** 纯 JavaScript 单文件书源主脚本；非空时优先使用脚本抓取流程 */
  mainJs?: string
  /** 是否监听事件来执行回调规则 */
  eventListener?: boolean
  /** 由书源控制的自定义按钮 */
  customButton?: boolean
  /** 扩展字段（非官方实体，真实书源 JSON 可能携带） */
  homepageModules?: unknown
  [key: string]: unknown
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

  /** bookSourceType → SourceKind（0=文本 1=音频 2=图片 3=文件 4=视频） */
  private mapBookType(type: number): SourceKind {
    switch (type) {
      case 1: return 'music'    // 音频
      case 2: return 'comic'    // 图片/漫画
      case 3: return 'custom'    // 文件
      case 4: return 'video'    // 视频
      default: return 'book'    // 0 = 文本
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
    if (rules.updateTime) fields['updateTime'] = rules.updateTime

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
    if (rules.updateTime) fields['updateTime'] = rules.updateTime
    if (rules.canReName) fields['canReName'] = rules.canReName
    if (rules.downloadUrls) fields['downloadUrls'] = rules.downloadUrls

    // init: 详情页加载后执行的初始化 JS（M1 占位，M2 沙箱求值）
    const steps: RuleSegment['steps'] = []
    if (rules.init) {
      steps.push({ action: 'jsEval', expr: rules.init, name: 'init' })
    }

    const segment: RuleSegment = {
      id: 'detail-main',
      label: '详情',
      request: { url: detailUrl, method: 'GET', ...(header ? { headers: header } : {}) },
      steps,
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
    if (rules.isPay) fields['isPay'] = rules.isPay
    if (rules.updateTime) fields['updateTime'] = rules.updateTime
    if (rules.nextTocUrl) fields['nextTocUrl'] = rules.nextTocUrl

    // preUpdateJs: 更新目录前执行的 JS；formatJs: 章节格式化 JS（M1 占位，M2 沙箱求值）
    const steps: RuleSegment['steps'] = []
    if (rules.preUpdateJs) {
      steps.push({ action: 'jsEval', expr: rules.preUpdateJs, name: 'preUpdate' })
    }
    if (rules.formatJs) {
      steps.push({ action: 'jsEval', expr: rules.formatJs, name: 'format' })
    }

    const segment: RuleSegment = {
      id: 'toc-main',
      label: '目录',
      request: { url: tocUrl, method: 'GET', ...(header ? { headers: header } : {}) },
      steps,
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

    // 正文是串行步骤：webJs 注入 → content 提取 → subContent 副文 → title 标题
    //   → sourceRegex 定位 → replaceRegex 替换 → imageDecode 解密 → payAction 购买
    //   → nextContentUrl 下一页 → callBackJs 回调
    // 注：webJs/imageDecode/payAction/callBackJs 依赖 M2 JS 沙箱，M1 仅占位
    const steps: RuleSegment['steps'] = []
    if (rules.webJs) {
      steps.push({ action: 'jsEval', expr: rules.webJs, name: 'webJs' })
    }
    if (rules.content) {
      steps.push({ action: 'jsoup', expr: rules.content, name: 'content' })
    }
    if (rules.subContent) {
      steps.push({ action: 'jsoup', expr: rules.subContent, name: 'subContent' })
    }
    if (rules.title) {
      steps.push({ action: 'jsoup', expr: rules.title, name: 'title' })
    }
    if (rules.sourceRegex) {
      steps.push({ action: 'regex', expr: rules.sourceRegex, name: 'source' })
    }
    if (rules.replaceRegex) {
      steps.push({ action: 'replace', expr: rules.replaceRegex, name: 'replace' })
    }
    if (rules.imageDecode) {
      steps.push({ action: 'jsEval', expr: rules.imageDecode, name: 'imageDecode' })
    }
    if (rules.payAction) {
      steps.push({ action: 'jsEval', expr: rules.payAction, name: 'payAction' })
    }
    if (rules.nextContentUrl) {
      steps.push({ action: 'jsoup', expr: rules.nextContentUrl, name: 'nextContentUrl' })
    }
    if (rules.callBackJs) {
      steps.push({ action: 'jsEval', expr: rules.callBackJs, name: 'callBack' })
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
    if (rules.wordCount) fields['wordCount'] = rules.wordCount
    if (rules.updateTime) fields['updateTime'] = rules.updateTime

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
