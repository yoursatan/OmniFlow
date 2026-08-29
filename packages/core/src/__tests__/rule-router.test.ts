import { describe, it, expect } from 'vitest'
import { RuleRouter } from '../engine/rule-router'
import { MemoryRepo } from '../repo/memory'
import { LegadoAdapter } from '../adapters/legado'
import type { LegadoBookSource } from '../adapters/legado'

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

describe('RuleRouter', () => {
  const router = new RuleRouter()

  it('编译 + 执行 CSS 规则', () => {
    const result = router.execute(HTML, '@css:.book-item .title@text')
    expect(result.text).toBe('斗破苍穹')
  })

  it('编译 + 执行 JSoup 规则', () => {
    const result = router.execute(HTML, 'class.book-item.0@tag.a@text')
    expect(result.text).toBe('斗破苍穹')
  })

  it('|| OR 回退：第一个规则有效', () => {
    const rule = '@css:.book-item .title@text||@css:.nonexistent@text'
    const result = router.execute(HTML, rule)
    expect(result.text).toBe('斗破苍穹')
  })

  it('|| OR 回退：第一个无效回退到第二个', () => {
    const rule = '@css:.nonexistent@text||@css:.book-item .title@text'
    const result = router.execute(HTML, rule)
    expect(result.text).toBe('斗破苍穹')
  })

  it('extractFields 批量字段提取', () => {
    const fields = {
      title: '@css:.book-item .title@text',
      author: '@css:.book-item .author@text',
      url: '@css:.book-item a@href',
    }
    const result = router.extractFields(HTML, fields)
    expect(result.title).toBe('斗破苍穹')
    expect(result.author).toBe('天蚕土豆')
    expect(result.url).toBe('/book/1')
  })
})

describe('MemoryRepo', () => {
  it('源 CRUD', async () => {
    const repo = new MemoryRepo()
    const source = {
      id: 'test:1',
      name: 'Test',
      kind: 'book' as const,
      format: 'legado3_book' as const,
      search: { name: 'search', segments: [] },
      detail: { name: 'detail', segments: [] },
      toc: { name: 'toc', segments: [] },
      content: { name: 'content', segments: [] },
    }
    await repo.upsertSources([source])
    expect((await repo.listSources()).length).toBe(1)

    const got = await repo.getSource('test:1')
    expect(got?.name).toBe('Test')

    await repo.removeSources(['test:1'])
    expect((await repo.listSources()).length).toBe(0)
  })

  it('缓存 set/get/expire', async () => {
    const repo = new MemoryRepo()
    await repo.cacheSet('key1', 'value1', 0)
    const result = await repo.cacheGet<string>('key1')
    expect(result?.value).toBe('value1')
  })

  it('收藏 + 历史', async () => {
    const repo = new MemoryRepo()
    await repo.addFavorite('item1', { title: 'Test' })
    const favs = await repo.listFavorites()
    expect(favs.length).toBe(1)
    expect(favs[0].itemId).toBe('item1')

    await repo.recordHistory('item1', { progress: 0.5 })
    const hist = await repo.listHistory()
    expect(hist.length).toBe(1)
  })
})

describe('LegadoAdapter', () => {
  it('解析 Legado 书源 JSON → UnifiedSource', () => {
    const legadoSource: LegadoBookSource = {
      bookSourceName: '测试书源',
      bookSourceUrl: 'https://test.example.com',
      bookSourceGroup: '测试',
      searchUrl: 'https://test.example.com/search?q={{key}}&page={{page}}',
      ruleSearch: {
        bookList: 'class.book-list@tag.li',
        name: 'class.title@text',
        author: 'class.author@text',
        bookUrl: 'tag.a@href',
        coverUrl: 'tag.img@src',
      },
      ruleBookInfo: {
        name: 'class.info h1@text',
        author: 'class.info .author@text',
        intro: 'class.intro@text',
        coverUrl: 'class.cover img@src',
        tocUrl: 'class.chapter-link@href',
      },
      ruleToc: {
        chapterList: 'class.chapter-list@tag.li',
        chapterName: 'tag.a@text',
        chapterUrl: 'tag.a@href',
      },
      ruleContent: {
        content: 'id.content@textNodes',
        replaceRegex: '\\s+##_',
      },
    }

    const adapter = new LegadoAdapter()
    const sources = adapter.parse(legadoSource)
    expect(sources.length).toBe(1)

    const src = sources[0]
    expect(src.name).toBe('测试书源')
    expect(src.kind).toBe('book')
    expect(src.format).toBe('legado3_book')
    expect(src.homeUrl).toBe('https://test.example.com')
    expect(src.search.segments.length).toBeGreaterThan(0)
    expect(src.detail.segments.length).toBeGreaterThan(0)
    expect(src.toc.segments.length).toBeGreaterThan(0)
    expect(src.content.segments.length).toBeGreaterThan(0)
  })
})
