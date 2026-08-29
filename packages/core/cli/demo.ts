/* ==========================================================
 * OmniFlow Node CLI 端到端演示（M1 验收）
 * 链路：Legado 书源 JSON → LegadoAdapter.parse → PipelineExecutor
 *       → mock HTTP → SelectorEngine extractList → 搜索结果
 *
 * 运行方式：
 *   1) vitest（推荐，可断言）：pnpm --filter @omniflow/core test -- demo
 *   2) Node 22+ 直接跑 TS：node --experimental-strip-typescript packages/core/cli/demo.ts
 *   3) npx tsx packages/core/cli/demo.ts
 *
 * 演示用内联最小书源 + mock HTML，不依赖网络，验证引擎链路可用。
 * ========================================================== */

import { LegadoAdapter, type LegadoBookSource } from '../src/adapters/legado'
import { PipelineExecutor, type PipelineResult } from '../src/engine/pipeline'

/** 演示用 Legado 书源（CSS 选择器，无 @js:，最简形态） */
const demoSource: LegadoBookSource = {
  bookSourceName: 'OmniFlow Demo 书源',
  bookSourceUrl: 'https://demo.omniflow.dev',
  bookSourceGroup: '演示',
  bookSourceType: 0,
  enabled: true,
  searchUrl: 'https://demo.omniflow.dev/search?q={{key}}&page={{page}}',
  ruleSearch: {
    bookList: '.search-result .book-item',
    name: '.book-title@text',
    author: '.book-author@text',
    bookUrl: '.book-link@href',
    coverUrl: '.book-cover@src',
    intro: '.book-intro@text',
  },
}

/** 匹配 bookList 规则的 mock 搜索结果 HTML */
const mockSearchHtml = `
<ul class="search-result">
  <li class="book-item">
    <a class="book-link" href="/book/1001">第一本书</a>
    <img class="book-cover" src="/cover/1001.jpg" alt="">
    <span class="book-title">斗破苍穹</span>
    <span class="book-author">天蚕土豆</span>
    <p class="book-intro">这里是第一本书的简介内容，用于验证字段提取。</p>
  </li>
  <li class="book-item">
    <a class="book-link" href="/book/1002">第二本书</a>
    <img class="book-cover" src="/cover/1002.jpg" alt="">
    <span class="book-title">凡人修仙传</span>
    <span class="book-author">忘语</span>
    <p class="book-intro">这里是第二本书的简介内容，用于验证字段提取。</p>
  </li>
</ul>
`

/** mock fetch：拦截所有请求返回 mock HTML */
const mockFetch = async (_url: string): Promise<Response> =>
  new Response(mockSearchHtml, {
    status: 200,
    headers: { 'content-type': 'text/html; charset=utf-8' },
  })

export interface DemoBook {
  name?: string
  author?: string
  bookUrl?: string
  coverUrl?: string
  intro?: string
}

/**
 * 运行端到端 search 演示
 * @returns 搜索结果书籍数组
 */
export async function runSearchDemo(): Promise<{
  books: DemoBook[]
  result: PipelineResult<DemoBook[]>
  sourceName: string
}> {
  // 1. 适配器解析书源 JSON → UnifiedSource IR
  const adapter = new LegadoAdapter()
  const [source] = adapter.parse([demoSource])

  // 2. 构造管道执行器（注入 mock fetch）
  const executor = new PipelineExecutor({ fetch: mockFetch })

  // 3. 执行 search 管道（key/page 注入变量）
  const result = await executor.execute<DemoBook[]>(
    source.search,
    { key: '斗破', page: 1 },
    { baseUrl: source.homeUrl },
  )

  return {
    books: result.data ?? [],
    result,
    sourceName: source.name,
  }
}

/** CLI 入口：打印演示过程 */
async function main() {
  console.log('═══════════════════════════════════════════════')
  console.log('  OmniFlow M1 端到端演示：搜书链路')
  console.log('═══════════════════════════════════════════════\n')

  console.log('[1] LegadoAdapter.parse(书源 JSON) → UnifiedSource')
  const { books, result, sourceName } = await runSearchDemo()
  console.log(`    书源名: ${sourceName}`)
  console.log(`    管道段数: ${sourceName ? 1 : 0}`)
  console.log(`    debug 事件数: ${result.debugEvents.length}\n`)

  console.log('[2] PipelineExecutor.execute(search) → mock HTTP → extractList')
  console.log(`    提取到 ${books.length} 本书:\n`)
  for (const [i, book] of books.entries()) {
    console.log(`    #${i + 1}`)
    console.log(`      书名:  ${book.name ?? '-'}`)
    console.log(`      作者:  ${book.author ?? '-'}`)
    console.log(`      链接:  ${book.bookUrl ?? '-'}`)
    console.log(`      封面:  ${book.coverUrl ?? '-'}`)
    console.log(`      简介:  ${book.intro?.slice(0, 40) ?? '-'}\n`)
  }

  console.log('═══════════════════════════════════════════════')
  console.log('  演示完成：adapter → pipeline → selector 链路工作正常')
  console.log('═══════════════════════════════════════════════')
}

// 直接运行时执行 main（被 import 时不执行）
const isMain = process.argv[1]?.replace(/\\/g, '/').endsWith('cli/demo.ts')
if (isMain) {
  main().catch(err => {
    console.error('演示失败:', err)
    process.exit(1)
  })
}
