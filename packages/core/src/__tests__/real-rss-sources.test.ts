/* ==========================================================
 * 真实订阅源 fixtures 验证 + M2 沙箱需求基线
 * 数据：fixtures/real-rss-sources.json（15 个真实 eso/hiker 风格订阅源）
 * 说明：订阅源适配器属 M3，本测试只验证数据完整性 + 统计 JS 依赖
 *       为 M2 沙箱（@js: header / 动态 sortUrl / 规则内 JS）建立需求基线
 * 数据来源：源仓库下载的测试订阅源.json
 * ========================================================== */

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const FIXTURE = resolve(__dirname, 'fixtures/real-rss-sources.json')
const raw = readFileSync(FIXTURE, 'utf8')
const sources: Record<string, unknown>[] = JSON.parse(raw)

/** 判断字符串字段是否含 JS 片段（@js: / <js> / {{}}） */
const hasJs = (v: unknown): boolean =>
  typeof v === 'string' && /@js:|<js>|\{\{/.test(v)

/** 规则字段集合 */
const RULE_KEYS = [
  'ruleArticles', 'ruleContent', 'ruleImage',
  'ruleLink', 'ruleNextPage', 'ruleTitle', 'rulePubDate', 'ruleDescription',
] as const

describe('真实订阅源 fixtures 加载', () => {
  it('应加载 15 个订阅源', () => {
    expect(sources.length).toBe(15)
  })

  it('每个源必含 sourceName + sourceUrl', () => {
    for (const s of sources) {
      expect(s.sourceName, JSON.stringify(s)).toBeTruthy()
      expect(s.sourceUrl).toBeTruthy()
    }
  })

  it('enableJs 全部为 true（订阅源重度依赖 JS）', () => {
    for (const s of sources) {
      expect(s.enableJs).toBe(true)
    }
  })
})

describe('M2 沙箱 JS 依赖基线（卡点 #22/#25 的量化证据）', () => {
  it('header 字段含 @js: 动态脚本的源应被记录', () => {
    const jsHeader = sources.filter(s => hasJs(s.header))
    // 真实数据：2/15 的 header 是 @js: 脚本（非 JSON）
    expect(jsHeader.length).toBeGreaterThan(0)
  })

  it('sortUrl 含 @js:/<js> 动态生成的源应被记录', () => {
    const jsSort = sources.filter(s => hasJs(s.sortUrl))
    // 真实数据：3/15 的 sortUrl 是动态 JS 生成
    expect(jsSort.length).toBeGreaterThan(0)
  })

  it('rule* 字段含 @js:/<js>/{{}} 的源占比应 >= 60%', () => {
    const jsRule = sources.filter(s =>
      RULE_KEYS.some(k => hasJs(s[k]))
    )
    const ratio = jsRule.length / sources.length
    // 真实数据：10/15 ≈ 67% 规则需 JS 求值 → M2 沙箱是刚需
    expect(ratio).toBeGreaterThanOrEqual(0.6)
  })

  it('含 injectJs / preloadJs / jsLib 的源应被记录（沙箱需预加载）', () => {
    const withInject = sources.filter(s => s.injectJs || s.preloadJs || s.jsLib)
    expect(withInject.length).toBeGreaterThan(0)
  })
})

describe('订阅源字段清单（为 M3 适配器接口设计提供依据）', () => {
  it('应记录全部字段名快照', () => {
    const fields = new Set<string>()
    for (const s of sources) {
      for (const k of Object.keys(s)) fields.add(k)
    }
    // 关键字段必须存在
    for (const key of [
      'sourceName', 'sourceUrl', 'header', 'sortUrl', 'ruleArticles',
      'ruleContent', 'ruleLink', 'ruleTitle', 'enableJs', 'enabled',
    ]) {
      expect(fields.has(key), `缺失字段: ${key}`).toBe(true)
    }
  })
})
