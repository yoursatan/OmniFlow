/* ==========================================================
 * CLI 端到端演示验证（M1 验收）
 * 复用 cli/demo.ts 的 runSearchDemo，断言 adapter→pipeline→selector 链路
 * ========================================================== */

import { describe, it, expect } from 'vitest'
import { runSearchDemo } from '../../cli/demo'

describe('M1 端到端 search 演示', () => {
  it('应成功解析书源并提取搜索结果', async () => {
    const { books, result, sourceName } = await runSearchDemo()

    // 书源解析正确
    expect(sourceName).toBe('OmniFlow Demo 书源')
    // 管道执行产生 debug 事件
    expect(result.debugEvents.length).toBeGreaterThan(0)
    // 提取出 2 本书
    expect(books.length).toBe(2)
  })

  it('第一本书字段应正确提取（CSS + @text/@href/@src）', async () => {
    const { books } = await runSearchDemo()
    const b1 = books[0]!
    expect(b1.name).toBe('斗破苍穹')
    expect(b1.author).toBe('天蚕土豆')
    expect(b1.bookUrl).toBe('/book/1001')
    expect(b1.coverUrl).toBe('/cover/1001.jpg')
    expect(b1.intro).toContain('第一本书')
  })

  it('第二本书字段应正确提取', async () => {
    const { books } = await runSearchDemo()
    const b2 = books[1]!
    expect(b2.name).toBe('凡人修仙传')
    expect(b2.author).toBe('忘语')
    expect(b2.bookUrl).toBe('/book/1002')
  })

  it('debug 事件应包含 segment:enter 与 list 步骤', async () => {
    const { result } = await runSearchDemo()
    const types = result.debugEvents.map(e => e.type)
    expect(types).toContain('segment:enter')
    expect(types.some(t => t === 'step:enter')).toBe(true)
    // list 步骤产出 list[2] 摘要
    const listExit = result.debugEvents.find(
      e => e.type === 'step:exit' && typeof e.outputSnippet === 'string' && e.outputSnippet.includes('list[2]'),
    )
    expect(listExit, '应产生 list[2] 提取摘要').toBeDefined()
  })
})
