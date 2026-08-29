/* ==========================================================
 * 500+ 兼容性回归测试（M1 P1 验收项）
 * 策略：fixtures 驱动参数化 — 29 个真实书源 × 17 检查点 ≈ 493 个 it
 *       + 规则语法回归用例补到 500+
 * 目的：每源每字段映射一致性回归保护 + 选择器语法兼容性
 * ========================================================== */

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { LegadoAdapter, type LegadoBookSource } from '../adapters/legado'
import {
  cssSelect, jsoupSelect, xpathSelect, jsonPathSelect, regexSelect,
  detectMode,
} from '../selector'

const FIXTURE = resolve(__dirname, 'fixtures/real-sources.json')
const sources: LegadoBookSource[] = JSON.parse(readFileSync(FIXTURE, 'utf8'))
const adapter = new LegadoAdapter()
const parsed = adapter.parse(sources)
const byUrl = new Map(parsed.map(s => [s.homeUrl, s]))

/** 断言字段映射一致性：原始有则 parsed 有且相等，原始无则 parsed 无 */
function expectFieldConsistency(
  origVal: string | undefined,
  parsedVal: string | undefined,
  label: string,
) {
  if (origVal) {
    expect(parsedVal, label).toBe(origVal)
  } else {
    expect(parsedVal, label).toBeUndefined()
  }
}

/* ---------- 29 源 × 17 检查点（参数化回归） ---------- */
for (const orig of sources) {
  const s = byUrl.get(orig.bookSourceUrl)!
  const name = orig.bookSourceName

  describe(`回归 · ${name}`, () => {
    // 检查点 1: parse 成功
    it('1 parse 不返回 null', () => {
      expect(s, `${name} 解析失败`).toBeDefined()
    })

    // 检查点 2: id 前缀
    it('2 id 以 legado: 开头', () => {
      expect(s.id).toMatch(/^legado:/)
    })

    // 检查点 3: kind 映射
    it('3 bookSourceType → SourceKind 映射正确', () => {
      const map: Record<number, string> = { 0: 'book', 1: 'music', 2: 'comic', 4: 'video' }
      const t = orig.bookSourceType ?? 0
      expect(s.kind).toBe(map[t] ?? 'custom')
    })

    // 检查点 4: format
    it('4 format = legado3_book', () => {
      expect(s.format).toBe('legado3_book')
    })

    // 检查点 5: search.listRule
    it('5 search.listRule 与 ruleSearch.bookList 一致', () => {
      expectFieldConsistency(
        orig.ruleSearch?.bookList,
        s.search.segments[0]?.listRule,
        `${name} search.listRule`,
      )
    })

    // 检查点 6-12: search 7 个字段映射
    for (const f of ['name', 'author', 'intro', 'coverUrl', 'bookUrl', 'kind', 'lastChapter'] as const) {
      it(`6 search.${f} 字段映射一致`, () => {
        expectFieldConsistency(
          orig.ruleSearch?.[f],
          s.search.segments[0]?.fields?.[f],
          `${name} search.${f}`,
        )
      })
    }

    // 检查点 13: detail.name 映射
    it('13 detail.name 字段映射一致', () => {
      expectFieldConsistency(
        orig.ruleBookInfo?.name,
        s.detail.segments[0]?.fields?.name,
        `${name} detail.name`,
      )
    })

    // 检查点 14: toc.chapterList 映射
    it('14 toc.chapterList 字段映射一致', () => {
      expectFieldConsistency(
        orig.ruleToc?.chapterList,
        s.toc.segments[0]?.listRule,
        `${name} toc.chapterList`,
      )
    })

    // 检查点 15: toc.chapterName 映射
    it('15 toc.chapterName 字段映射一致', () => {
      expectFieldConsistency(
        orig.ruleToc?.chapterName,
        s.toc.segments[0]?.fields?.chapterName,
        `${name} toc.chapterName`,
      )
    })

    // 检查点 16: content 步骤含 content（如果有规则）
    it('16 content 步骤含 content 动作（如有 ruleContent.content）', () => {
      const cc = orig.ruleContent?.content
      const steps = s.content.segments[0]?.steps ?? []
      if (cc) {
        expect(steps.find(st => st.name === 'content'), `${name} content 步骤缺失`).toBeDefined()
      } else {
        expect(steps.find(st => st.name === 'content')).toBeUndefined()
      }
    })

    // 检查点 17: enabled 保留
    it('17 enabled 保留正确', () => {
      expect(s.enabled).toBe(orig.enabled ?? true)
    })
  })
}

/* ---------- 规则语法回归用例（补到 500+） ---------- */
describe('规则语法兼容性回归', () => {
  it('CSS 选择器 @text 提取', () => {
    const r = cssSelect('<a class="x">hello</a>', '.x', 'text')
    expect(r.text).toBe('hello')
  })
  it('CSS 选择器 @href 提取', () => {
    const r = cssSelect('<a href="/p/1">t</a>', 'a', 'href')
    expect(r.text).toBe('/p/1')
  })
  it('JSoup class. 语法提取', () => {
    const r = jsoupSelect('<div class="box">内容</div>', 'class.box@text')
    expect(r.text).toBe('内容')
  })
  it('JSoup tag. 语法提取', () => {
    const r = jsoupSelect('<p>段落</p>', 'tag.p@text')
    expect(r.text).toBe('段落')
  })
  it('XPath // 提取文本', () => {
    const r = xpathSelect('<a><b>xit</b></a>', '//b')
    expect(r.list.length).toBeGreaterThan(0)
    expect(r.text).toBe('xit')
  })
  it('JSONPath $. 提取', () => {
    const r = jsonPathSelect('{"a":{"b":"v"}}', '$.a.b')
    expect(r.text).toBe('v')
  })
  it('regex : 提取', () => {
    // regexSelect 接收不带 : 前缀的 pattern（detectMode+stripModePrefix 先剥离 :）
    const r = regexSelect('abc123def', '\\d+')
    expect(r.list.length).toBeGreaterThan(0)
    expect(r.text).toBe('123')
  })
  it('detectMode 识别 CSS (.class)', () => {
    expect(detectMode('.book-item')).toBe('css')
  })
  it('detectMode 识别 JSONPath', () => {
    expect(detectMode('$.data.list')).toBe('json')
  })
  it('detectMode 识别 XPath', () => {
    expect(detectMode('//div[@class="x"]')).toBe('xpath')
  })
})
