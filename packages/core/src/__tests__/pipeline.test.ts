/* ==========================================================
 * Pipeline 端到端测试
 * 验证：HTTP 请求 → 选择器执行 → 字段提取 → 段间数据传递
 * ========================================================== */

import { describe, it, expect, vi } from 'vitest'
import { PipelineExecutor } from '../engine/pipeline'
import type { RulePipeline } from '@omniflow/shared'

const HTML = `
<ul class="book-list">
  <li class="book-item">
    <a href="/book/1" class="title">斗破苍穹</a>
    <span class="author">天蚕土豆</span>
  </li>
  <li class="book-item">
    <a href="/book/2" class="title">凡人修仙传</a>
    <span class="author">忘语</span>
  </li>
</ul>
`

/** 构造 mock fetch：匹配 url 返回对应 HTML */
function mockFetch(htmlMap: Record<string, string>) {
  return async (url: string | URL) => {
    const u = String(url)
    const body = htmlMap[u] ?? htmlMap['*'] ?? ''
    return {
      ok: true,
      status: 200,
      statusText: 'OK',
      url: u,
      headers: new Map(),
      text: async () => body,
    } as unknown as Response
  }
}

describe('PipelineExecutor', () => {
  it('单段管道：HTTP → CSS 提取 → 输出', async () => {
    const pipeline: RulePipeline = {
      name: 'search',
      segments: [
        {
          id: 'seg1',
          steps: [
            { action: 'css', expr: '.book-item .title@text' },
          ],
          request: { url: 'https://test.example.com/search?q={{key}}', method: 'GET' },
        },
      ],
    }

    const executor = new PipelineExecutor()
    const result = await executor.execute(
      pipeline,
      { key: '斗破' },
      { fetch: mockFetch({ 'https://test.example.com/search?q=斗破': HTML }) as never }
    )

    expect(result.data).toBe('斗破苍穹')
    // 验证调试事件：segment:enter → step:enter → step:exit → segment:exit
    const types = result.debugEvents.map(e => e.type)
    expect(types).toContain('segment:enter')
    expect(types).toContain('step:enter')
    expect(types).toContain('step:exit')
    expect(types).toContain('segment:exit')
  })

  it('多步管道：步骤串行，前步输出作后步输入', async () => {
    const pipeline: RulePipeline = {
      name: 'multi-step',
      segments: [
        {
          id: 'seg1',
          steps: [
            { action: 'css', expr: '.book-item@html' },
            { action: 'css', expr: '.title@text' },
          ],
          request: { url: 'https://test.example.com/page', method: 'GET' },
        },
      ],
    }

    const executor = new PipelineExecutor()
    const result = await executor.execute(
      pipeline,
      {},
      { fetch: mockFetch({ 'https://test.example.com/page': HTML }) as never }
    )

    // 第二步在第一步输出的 HTML 片段上执行
    expect(result.data).toBe('斗破苍穹')
  })

  it('haltOnError=false 时段失败不中止', async () => {
    const pipeline: RulePipeline = {
      name: 'failover',
      segments: [
        {
          id: 'seg-fail',
          haltOnError: false,
          // HTTP 请求失败触发 error 事件，但因 haltOnError=false 不中止
          request: { url: 'https://test.example.com/fail', method: 'GET' },
          steps: [
            { action: 'css', expr: '.book-item .title@text' },
          ],
        },
        {
          id: 'seg-ok',
          steps: [
            { action: 'css', expr: '.book-item .title@text' },
          ],
          request: { url: 'https://test.example.com/ok', method: 'GET' },
        },
      ],
    }

    const failFetch = async (url: string | URL) => {
      const u = String(url)
      if (u.includes('/fail')) throw new Error('network error')
      return {
        ok: true,
        status: 200,
        statusText: 'OK',
        url: u,
        headers: new Map(),
        text: async () => HTML,
      } as unknown as Response
    }

    const executor = new PipelineExecutor()
    const result = await executor.execute(
      pipeline,
      {},
      { fetch: failFetch as never }
    )

    // 第一段 HTTP 失败 → error 事件，但 haltOnError=false → 第二段仍执行
    expect(result.debugEvents.some(e => e.type === 'error')).toBe(true)
    expect(result.data).toBe('斗破苍穹')
  })

  it('search 便捷方法注入 key/page 变量', async () => {
    const pipeline: RulePipeline = {
      name: 'search',
      segments: [
        {
          id: 'seg1',
          steps: [
            { action: 'css', expr: '.book-item .title@text' },
          ],
          request: { url: 'https://test.example.com/s?q={{key}}&p={{page}}', method: 'GET' },
        },
      ],
    }

    const fetchFn = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      url: '',
      headers: new Map(),
      text: async () => HTML,
    } as unknown as Response)

    const executor = new PipelineExecutor()
    await executor.search(pipeline, '仙逆', 1, { fetch: fetchFn as never })

    expect(fetchFn).toHaveBeenCalledTimes(1)
    const calledUrl = String(fetchFn.mock.calls[0]?.[0])
    expect(calledUrl).toContain('q=仙逆')
    expect(calledUrl).toContain('p=1')
  })

  it('段失败默认中止后续段', async () => {
    const pipeline: RulePipeline = {
      name: 'abort',
      segments: [
        {
          id: 'seg-err',
          // HTTP 请求失败 → 默认 haltOnError=true → 后续段不执行
          request: { url: 'https://test.example.com/err', method: 'GET' },
          steps: [
            { action: 'css', expr: '.book-item .title@text' },
          ],
        },
        {
          id: 'seg-after',
          steps: [
            { action: 'css', expr: '.book-item .title@text' },
          ],
          request: { url: 'https://test.example.com/after', method: 'GET' },
        },
      ],
    }

    const errFetch = async (url: string | URL) => {
      const u = String(url)
      if (u.includes('/err')) throw new Error('connection refused')
      return {
        ok: true,
        status: 200,
        statusText: 'OK',
        url: u,
        headers: new Map(),
        text: async () => HTML,
      } as unknown as Response
    }

    const executor = new PipelineExecutor()
    const result = await executor.execute(
      pipeline,
      {},
      { fetch: errFetch as never }
    )

    // 第一段 HTTP 失败 → error 事件，默认 haltOnError=true，第二段不应执行
    expect(result.debugEvents.some(e => e.type === 'error')).toBe(true)
    const afterEnter = result.debugEvents.find(
      e => e.type === 'segment:enter' && e.segmentId === 'seg-after'
    )
    expect(afterEnter).toBeUndefined()
  })
})
