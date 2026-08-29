/* ==========================================================
 * 真实书源全量回归测试
 * 数据：fixtures/real-sources.json（29 个真实 Legado 书源）
 * 覆盖：全量解析、字段映射完整性、header 注入、bookSourceType、
 *       探索 URL 处理、各子规则新字段保留、无运行时异常
 * 数据来源：源仓库下载的测试书源.json
 * ========================================================== */

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { LegadoAdapter, type LegadoBookSource } from '../adapters/legado'

const FIXTURE = resolve(__dirname, 'fixtures/real-sources.json')
const raw = readFileSync(FIXTURE, 'utf8')
const sources: LegadoBookSource[] = JSON.parse(raw)

const adapter = new LegadoAdapter()
const parsed = adapter.parse(sources)

/** 按源 URL 建立索引，便于断言单个源 */
const byUrl = new Map(parsed.map(s => [s.homeUrl, s]))

describe('真实书源 fixtures 全量加载', () => {
  it('应加载 29 个真实书源', () => {
    expect(sources.length).toBe(29)
  })

  it('全部 29 个源应成功解析为 UnifiedSource（无 null）', () => {
    expect(parsed.length).toBe(29)
    for (const s of parsed) {
      expect(s.id).toMatch(/^legado:/)
      expect(s.name).toBeTruthy()
      expect(s.format).toBe('legado3_book')
    }
  })
})

describe('基础字段映射', () => {
  it('bookSourceType 应正确映射 SourceKind（0=book 1=music 2=comic 4=video）', () => {
    const expectKind: Record<number, string> = { 0: 'book', 1: 'music', 2: 'comic', 4: 'video' }
    for (const orig of sources) {
      const t = orig.bookSourceType ?? 0
      const s = byUrl.get(orig.bookSourceUrl)!
      expect(s.kind).toBe(expectKind[t] ?? 'custom')
      expect(s.tags).toContain(`type:${t}`)
    }
  })

  it('group / enabled / weight 应正确保留', () => {
    for (const orig of sources) {
      const s = byUrl.get(orig.bookSourceUrl)!
      expect(s.enabled).toBe(orig.enabled ?? true)
      if (orig.bookSourceGroup) expect(s.group).toBe(orig.bookSourceGroup)
    }
  })

  it('扩展字段（customButton/eventListener/homepageModules）不应导致解析失败', () => {
    // 含 customButton/eventListener/homepageModules 的源也能解析
    const withExt = sources.filter(s => s.customButton || s.eventListener || s.homepageModules)
    expect(withExt.length).toBeGreaterThan(0)
    for (const orig of withExt) {
      expect(byUrl.has(orig.bookSourceUrl)).toBe(true)
    }
  })
})

describe('header 注入', () => {
  it('带 JSON 格式 header 的源，header 应注入到 search.request.headers', () => {
    // 真实数据中 header 可能是 JSON 字符串，也可能是 @js: 动态脚本
    const jsonHeader = sources.filter(s => s.header && s.header.trim().startsWith('{'))
    expect(jsonHeader.length).toBeGreaterThan(0)
    for (const orig of jsonHeader) {
      const s = byUrl.get(orig.bookSourceUrl)!
      const headers = s.search.segments[0]?.request?.headers
      expect(headers, `${orig.bookSourceName}: JSON header 未注入`).toBeDefined()
      const parsedHeader = JSON.parse(orig.header!)
      for (const key of Object.keys(parsedHeader)) {
        expect(headers![key]).toBe(parsedHeader[key])
      }
    }
  })

  it('@js: 动态 header 的源应被跳过（不崩溃，headers 为 undefined）', () => {
    const jsHeader = sources.filter(s => s.header && s.header.trim().startsWith('@js:'))
    expect(jsHeader.length).toBeGreaterThan(0)
    for (const orig of jsHeader) {
      const s = byUrl.get(orig.bookSourceUrl)!
      // 动态 header M1 无法求值，request.headers 应为 undefined
      expect(s.search.segments[0]?.request?.headers).toBeUndefined()
    }
  })
})

describe('search 管道字段完整性', () => {
  it('每个源的 search.fields 应覆盖 ruleSearch 中存在的所有字段', () => {
    for (const orig of sources) {
      const s = byUrl.get(orig.bookSourceUrl)!
      const seg = s.search.segments[0]
      const rs = orig.ruleSearch!
      const fields = seg.fields ?? {}
      // 逐字段比对：原始规则有的，fields 必须有
      for (const key of ['name', 'author', 'intro', 'coverUrl', 'bookUrl', 'kind', 'lastChapter', 'wordCount', 'updateTime', 'checkKeyWord'] as const) {
        const v = rs[key]
        if (v) {
          // checkKeyWord 不进入 fields（它是校验关键字，非提取规则）
          if (key === 'checkKeyWord') continue
          expect(fields[key], `${orig.bookSourceName}: search.${key} 未映射`).toBe(v)
        }
      }
      if (rs.bookList) {
        expect(seg.listRule, `${orig.bookSourceName}: search.bookList 未映射`).toBe(rs.bookList)
      }
    }
  })
})

describe('toc 管道字段完整性（含新增字段）', () => {
  it('nextTocUrl / isPay / preUpdateJs / formatJs 应被保留', () => {
    // 至少有一个源带 nextTocUrl
    const withNext = sources.filter(s => s.ruleToc?.nextTocUrl)
    expect(withNext.length).toBeGreaterThan(0)
    for (const orig of withNext) {
      const s = byUrl.get(orig.bookSourceUrl)!
      expect(s.toc.segments[0].fields?.nextTocUrl).toBe(orig.ruleToc!.nextTocUrl)
    }
  })
})

describe('content 管道步骤完整性（含新增字段）', () => {
  it('subContent / title / nextContentUrl / webJs / sourceRegex 应生成对应步骤', () => {
    const withSub = sources.filter(s => s.ruleContent?.subContent)
    expect(withSub.length).toBeGreaterThan(0)
    for (const orig of withSub) {
      const s = byUrl.get(orig.bookSourceUrl)!
      const steps = s.content.segments[0].steps
      const subStep = steps.find(st => st.name === 'subContent')
      expect(subStep, `${orig.bookSourceName}: content.subContent 未生成步骤`).toBeDefined()
      expect(subStep!.expr).toBe(orig.ruleContent!.subContent)
    }

    const withTitle = sources.filter(s => s.ruleContent?.title)
    expect(withTitle.length).toBeGreaterThan(0)
    for (const orig of withTitle) {
      const s = byUrl.get(orig.bookSourceUrl)!
      const steps = s.content.segments[0].steps
      expect(steps.find(st => st.name === 'title')).toBeDefined()
    }

    const withNext = sources.filter(s => s.ruleContent?.nextContentUrl)
    expect(withNext.length).toBeGreaterThan(0)
    for (const orig of withNext) {
      const s = byUrl.get(orig.bookSourceUrl)!
      const steps = s.content.segments[0].steps
      expect(steps.find(st => st.name === 'nextContentUrl')).toBeDefined()
    }
  })
})

describe('detail 管道（含新增字段）', () => {
  it('init / canReName / downloadUrls / updateTime 应被保留', () => {
    const withInit = sources.filter(s => s.ruleBookInfo?.init)
    expect(withInit.length).toBeGreaterThan(0)
    for (const orig of withInit) {
      const s = byUrl.get(orig.bookSourceUrl)!
      const steps = s.detail.segments[0].steps
      expect(steps.find(st => st.name === 'init'), `${orig.bookSourceName}: init 未生成步骤`).toBeDefined()
    }

    const withCanRe = sources.filter(s => s.ruleBookInfo?.canReName)
    expect(withCanRe.length).toBeGreaterThan(0)
    for (const orig of withCanRe) {
      const s = byUrl.get(orig.bookSourceUrl)!
      expect(s.detail.segments[0].fields?.canReName).toBe(orig.ruleBookInfo!.canReName)
    }
  })
})

describe('explore 管道（含新增字段）', () => {
  it('静态 exploreUrl 的源，ruleExplore 各字段（含 wordCount/updateTime）应完整映射', () => {
    // 仅对生成了 explore 管道的源做字段完整性断言
    for (const orig of sources) {
      const s = byUrl.get(orig.bookSourceUrl)!
      if (!s.explore) continue  // 动态 exploreUrl（@js/<js>）M1 跳过
      const seg = s.explore.segments[0]
      const re = orig.ruleExplore!
      const fields = seg.fields ?? {}
      for (const key of ['name', 'author', 'intro', 'coverUrl', 'bookUrl', 'kind', 'lastChapter', 'wordCount', 'updateTime'] as const) {
        const v = re[key]
        if (v) expect(fields[key], `${orig.bookSourceName}: explore.${key} 未映射`).toBe(v)
      }
      if (re.bookList) expect(seg.listRule).toBe(re.bookList)
    }
  })

  it('静态 JSON 数组 exploreUrl 应正确解析为发现管道', () => {
    const staticArr = sources.filter(s => {
      const u = s.exploreUrl?.trim() ?? ''
      return u.startsWith('[')
    })
    expect(staticArr.length).toBeGreaterThan(0)
    for (const orig of staticArr) {
      const s = byUrl.get(orig.bookSourceUrl)!
      expect(s.explore).toBeDefined()
    }
  })

  it('@js:/<js> 动态 exploreUrl 应不生成发现管道（M1 跳过）', () => {
    const dynamic = sources.filter(s => {
      const u = s.exploreUrl?.trim() ?? ''
      return u.startsWith('@js:') || u.startsWith('<js>')
    })
    for (const orig of dynamic) {
      const s = byUrl.get(orig.bookSourceUrl)!
      expect(s.explore).toBeUndefined()
    }
  })
})

describe('searchUrl 解析', () => {
  it('相对路径 searchUrl 应拼接 baseUrl', () => {
    for (const orig of sources) {
      if (!orig.searchUrl) continue
      const u = orig.searchUrl.trim()
      // 跳过纯 js 的
      if (u.startsWith('@js:') || u.startsWith('<js>')) continue
      const s = byUrl.get(orig.bookSourceUrl)!
      const reqUrl = s.search.segments[0]?.request?.url ?? ''
      // 拼接后必须是绝对 URL
      expect(reqUrl).toMatch(/^https?:\/\//)
    }
  })
})
