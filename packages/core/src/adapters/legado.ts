/* ==========================================================
 * LegadoAdapter — Legado 书源适配器
 * 将 Legado 书源 JSON 转换为 UnifiedSource IR
 *
 * Legado 书源 JSON 结构（关键字段）:
 * {
 *   bookSourceName, bookSourceUrl, sourceUrl,
 *   searchUrl, ruleSearch: { bookList, name, author, intro, coverUrl, bookUrl },
 *   ruleToc: { chapterList, chapterName, chapterUrl },
 *   ruleContent: { content },
 *   ruleBookInfo: { name, author, intro, coverUrl, tocUrl }
 * }
 * ========================================================== */

import type {
  UnifiedSource,
  RulePipeline,
  RuleSegment,
  RuleStep,
  SourceKind,
  SourceFormat,
} from '@omniflow/shared'

/** Legado 书源 JSON 原始结构 */
export interface LegadoBookSource {
  bookSourceName: string
  bookSourceUrl: string
  sourceUrl?: string
  bookSourceGroup?: string
  loginUrl?: string
  customOrder?: number
  enabled?: boolean
  searchUrl?: string
  ruleSearch?: {
    bookList?: string
    name?: string
    author?: string
    intro?: string
    coverUrl?: string
    bookUrl?: string
    kind?: string
    lastChapter?: string
  }
  ruleBookInfo?: {
    name?: string
    author?: string
    intro?: string
    coverUrl?: string
    tocUrl?: string
    kind?: string
    lastChapter?: string
  }
  ruleToc?: {
    chapterList?: string
    chapterName?: string
    chapterUrl?: string
    isVolume?: string
    isVip?: string
    updateTime?: string
  }
  ruleContent?: {
    content?: string
    replaceRegex?: string
    nextContentUrl?: string
    imageStyle?: string
  }
}

/**
 * Legado 适配器
 */
export class LegadoAdapter {
  /** 解析 Legado 书源 JSON → UnifiedSource */
  parse(json: LegadoBookSource | LegadoBookSource[]): UnifiedSource[] {
    const sources = Array.isArray(json) ? json : [json]
    return sources.map(s => this.parseOne(s)).filter(Boolean) as UnifiedSource[]
  }

  /** 解析单个书源 */
  private parseOne(src: LegadoBookSource): UnifiedSource | null {
    if (!src.bookSourceName || !src.bookSourceUrl) return null

    const baseUrl = src.bookSourceUrl || src.sourceUrl || ''
    const id = `legado:${src.bookSourceUrl}`

    // 构建 5 条管道
    const searchPipeline = this.buildSearchPipeline(src, baseUrl)
    const detailPipeline = this.buildDetailPipeline(src, baseUrl)
    const tocPipeline = this.buildTocPipeline(src, baseUrl)
    const contentPipeline = this.buildContentPipeline(src, baseUrl)

    return {
      id,
      name: src.bookSourceName,
      kind: 'book' as SourceKind,
      format: 'legado3_book' as SourceFormat,
      group: src.bookSourceGroup,
      homeUrl: baseUrl,
      enabled: src.enabled ?? true,
      search: searchPipeline,
      detail: detailPipeline,
      toc: tocPipeline,
      content: contentPipeline,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ['legado'],
    }
  }

  /** 构建搜索管道 */
  private buildSearchPipeline(src: LegadoBookSource, baseUrl: string): RulePipeline {
    const rules = src.ruleSearch ?? {}
    const searchUrl = src.searchUrl || `${baseUrl}/search.php?q={{key}}&page={{page}}`

    const steps: RuleStep[] = []
    if (rules.bookList) {
      steps.push({ action: 'jsoup', expr: rules.bookList, name: 'bookList' })
    }
    if (rules.name) steps.push({ action: 'jsoup', expr: rules.name, name: 'name' })
    if (rules.author) steps.push({ action: 'jsoup', expr: rules.author, name: 'author' })
    if (rules.coverUrl) steps.push({ action: 'jsoup', expr: rules.coverUrl, name: 'coverUrl' })
    if (rules.bookUrl) steps.push({ action: 'jsoup', expr: rules.bookUrl, name: 'bookUrl' })

    return {
      name: 'search',
      segments: [
        {
          id: 'search-main',
          label: '搜索',
          request: { url: searchUrl, method: 'GET' },
          steps,
        },
      ],
      defaults: { url: baseUrl },
    }
  }

  /** 构建详情管道 */
  private buildDetailPipeline(src: LegadoBookSource, baseUrl: string): RulePipeline {
    const rules = src.ruleBookInfo ?? {}
    const detailUrl = `${baseUrl}/book/{{nativeId}}`

    const steps: RuleStep[] = []
    if (rules.name) steps.push({ action: 'jsoup', expr: rules.name, name: 'name' })
    if (rules.author) steps.push({ action: 'jsoup', expr: rules.author, name: 'author' })
    if (rules.intro) steps.push({ action: 'jsoup', expr: rules.intro, name: 'intro' })
    if (rules.coverUrl) steps.push({ action: 'jsoup', expr: rules.coverUrl, name: 'coverUrl' })
    if (rules.tocUrl) steps.push({ action: 'jsoup', expr: rules.tocUrl, name: 'tocUrl' })

    return {
      name: 'detail',
      segments: [
        {
          id: 'detail-main',
          label: '详情',
          request: { url: detailUrl, method: 'GET' },
          steps,
        },
      ],
      defaults: { url: baseUrl },
    }
  }

  /** 构建目录管道 */
  private buildTocPipeline(src: LegadoBookSource, baseUrl: string): RulePipeline {
    const rules = src.ruleToc ?? {}
    const tocUrl = `${baseUrl}/toc/{{nativeId}}`

    const steps: RuleStep[] = []
    if (rules.chapterList) {
      steps.push({ action: 'jsoup', expr: rules.chapterList, name: 'chapterList' })
    }
    if (rules.chapterName) steps.push({ action: 'jsoup', expr: rules.chapterName, name: 'chapterName' })
    if (rules.chapterUrl) steps.push({ action: 'jsoup', expr: rules.chapterUrl, name: 'chapterUrl' })

    return {
      name: 'toc',
      segments: [
        {
          id: 'toc-main',
          label: '目录',
          request: { url: tocUrl, method: 'GET' },
          steps,
        },
      ],
      defaults: { url: baseUrl },
    }
  }

  /** 构建正文管道 */
  private buildContentPipeline(src: LegadoBookSource, baseUrl: string): RulePipeline {
    const rules = src.ruleContent ?? {}
    const contentUrl = `${baseUrl}/content/{{chapterId}}`

    const steps: RuleStep[] = []
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
          request: { url: contentUrl, method: 'GET' },
          steps,
        },
      ],
      defaults: { url: baseUrl },
    }
  }
}
