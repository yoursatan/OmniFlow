/* ==========================================================
 * Legado 适配器测试 — 使用真实书源 JSON
 * 覆盖：字段映射、URL 解析、header、bookSourceType、管道结构、端到端执行
 * ========================================================== */

import { describe, it, expect } from 'vitest'
import { LegadoAdapter, type LegadoBookSource } from '../adapters/legado'
import { PipelineExecutor } from '../engine/pipeline'

/* ---------- 真实书源 JSON（简化版，保留关键字段） ---------- */

/** rezero 书源 — 最简洁的真实书源 */
const rezeroSource: LegadoBookSource = {
  bookSourceName: 'rezero',
  bookSourceUrl: 'https://re0zero.top',
  bookSourceGroup: '轻小说',
  bookSourceType: 0,
  enabled: true,
  enabledExplore: true,
  enabledCookieJar: true,
  customOrder: 0,
  weight: 0,
  respondTime: 180000,
  lastUpdateTime: 1783391702084,
  exploreUrl: '[{"title":"Re:从零开始的异世界生活","url":"/mdbook/book/index.html","style":{"layout_flexBasisPercent":1,"layout_flexGrow":1}}]',
  searchUrl: 'https://baidu.com?key={{java.put(\'key\',key)}}',
  ruleBookInfo: {
    author: '<js>\nr="长月达平"\n</js>',
    coverUrl: '@js:\nsource.bookSourceUrl + \'/mdbook/book/res/imgs/article/chapter010/00-a.jpg\'',
    intro: '<js>\nr=`走出便利商店要回家的高中生...`\n</js>',
    name: '<js>\njava.get(\'is\')==1?"Re:从零开始的异世界生活":""\n</js>',
  },
  ruleContent: {
    content: '#content@html##<h1.*?<\\/h1>',
    imageStyle: 'FULL',
  },
  ruleExplore: {
    author: '<js>\n"长月达平"\n</js>',
    bookList: 'h1',
    coverUrl: '@js:\nsource.bookSourceUrl + \'/mdbook/book/res/imgs/article/chapter010/00-a.jpg\'',
    intro: '<js>\nr=`走出便利商店...`\n</js>',
    name: 'text',
  },
  ruleSearch: {
    author: '<js>\n"长月达平"\n</js>',
    bookList: '<js>\nname=\'Re:从零开始的异世界生活长月达平RE0\'\nif (name.match(java.get(\'key\'))) {\n    java.put(\'is\',1)\n    r=[""]\n} else {\n    java.put(\'is\',0)\n    r=[]\n}\nr\n</js>',
    bookUrl: '@js:\nsource.bookSourceUrl + "/mdbook/book/index.html"',
    checkKeyWord: 'Re:从零开始的异世界生活',
    coverUrl: '@js:\nsource.bookSourceUrl + \'/mdbook/book/res/imgs/article/chapter010/00-a.jpg\'',
    intro: '<js>\n`走出便利商店...`\n</js>',
    name: '<js>\n"Re:从零开始的异世界生活"\n</js>',
  },
  ruleToc: {
    chapterList: 'a[href^="markdown/ch/"]',
    chapterName: 'text',
    chapterUrl: 'href##.*index.*',
    isVolume: '@js:result.attr(\'href\').endsWith(\'index.html\');',
  },
}

/** masiro 书源 — 带 header JSON + JSONPath 搜索规则 + 相对 searchUrl */
const masiroSource: LegadoBookSource = {
  bookSourceName: '真白萌',
  bookSourceUrl: 'https://masiro.me',
  bookSourceGroup: '轻小说',
  bookSourceType: 0,
  enabled: true,
  enabledExplore: true,
  enabledCookieJar: true,
  customOrder: 253,
  weight: 0,
  respondTime: 180000,
  header: '{"Referer":"https://masiro.me/","User-Agent":""}',
  loginUrl: '/admin/auth/login',
  searchUrl: '/admin/loadMoreNovels?page={{page}}&keyword={{key}}',
  ruleSearch: {
    author: '$.author',
    bookList: '$.novels',
    bookUrl: 'https://masiro.me/admin/novelView?novel_id={{$.id}}',
    coverUrl: '$.cover_img',
    intro: '$.brief',
    kind: '{{$.hs}}话\n{{$.translators..name}}',
    lastChapter: '$.new_up_content',
    name: '$.title',
    wordCount: '$.words',
  },
  ruleBookInfo: {
    author: 'class.author@tag.a@text',
    canReName: 'true',
    intro: '{{@@.brief@html##简介：}}',
    kind: '{{@@.tags@tag.a@text}}',
    lastChapter: 'class.n-update@text##更新 : ',
    name: 'class.novel-title@text',
    wordCount: 'class.n-chapters@text##字数 : |共.+话|字',
    coverUrl: '',
    tocUrl: '',
  },
  ruleContent: {
    content: '<js>\nString(java.getElement(\'.nvl-content\').html())\n</js>',
    imageStyle: 'FULL',
    replaceRegex: '@js:result.replace(/(?:\\nㅤ){2,}/g, \'\\nㅤ\');',
  },
  ruleExplore: {},
  ruleToc: {
    chapterList: '@js:\nresult=[]',
    chapterName: '@js:\n$=JSON.parse(result);\n$.title',
    chapterUrl: '@js:\n$=JSON.parse(result)\n!!$.children ? \'\' : `/admin/novelReading?cid=${$.id}`',
    isVip: '@js:\nJSON.parse(result).cost > 0',
    isVolume: '@js:\n!!JSON.parse(result).children',
  },
}

/** wenku8 书源 — 带 searchUrl JSON 选项 (charset: gbk) + header */
const wenku8Source: LegadoBookSource = {
  bookSourceName: '轻小说文库',
  bookSourceUrl: 'https://www.wenku8.cc',
  bookSourceGroup: '轻小说',
  bookSourceType: 0,
  enabled: true,
  enabledCookieJar: true,
  enabledExplore: true,
  customOrder: 292,
  weight: 0,
  respondTime: 180000,
  loginUrl: '/login.php',
  searchUrl: '/modules/article/search.php?searchtype=articlename&searchkey={{key}}&page={{page}},{\n    "charset": "gbk"\n}\n@js:\nif(new Date().getTime()<6000){}\nresult',
  ruleSearch: {
    author: '//div[2]/p[1]##(.+作者:)|(/分类:.+)',
    bookList: '@css:#content>table td>div',
    bookUrl: '//div[2]/b/a/@href',
    coverUrl: 'img@src',
    intro: '//p[4]##.+简介:',
    kind: '//p[3]/span/text()',
    name: '//div[2]/b/a/@title',
  },
  ruleBookInfo: {
    author: 'id.content@tag.tbody.0@tag.tr.-1@tag.td.1@text##小说作者：',
    coverUrl: 'id.content@.0@.3@.0@.0@tag.img@src',
    intro: '//span[6]',
    name: 'id.content@tag.td.0@tag.td.0@tag.b@text',
    tocUrl: 'text.小说目录@href',
    wordCount: 'id.content@tag.tbody.0@tag.tr.-1@tag.td.4@text##全文长度：',
    lastChapter: '//td[2]/span[4]/a/text()',
    kind: 'id.content@.0@.3@.0@.0@.1@tag.span.0@text##作品Tags：',
  },
  ruleToc: {
    chapterList: 'class.css@tag.td',
    chapterName: 'text',
    chapterUrl: 'tag.a@href',
    isVolume: '<js>java.getString("tag.a@text")==""?true:false</js>',
  },
  ruleContent: {
    content: 'id.content@html##本文来自.*',
    replaceRegex: '',
  },
  ruleExplore: {
    author: '//div[2]/p[1]/text()##/分类.*',
    bookList: "//div[@id='content']//td/div",
    bookUrl: '//div[2]/b/a/@href',
    coverUrl: 'img@src',
    intro: '//p[4]##.+简介:',
    name: '//div[2]/b/a/@title',
  },
  exploreUrl: '@js:\nres=[]\ncontent=java.ajax(source.bookSourceUrl+\"/modules/article/articlelist.php?class=\")\nJSON.stringify(res)',
}

/* ---------- 测试 ---------- */

describe('LegadoAdapter — 字段映射', () => {
  const adapter = new LegadoAdapter()

  it('解析 rezero 书源 → UnifiedSource', () => {
    const sources = adapter.parse(rezeroSource)
    expect(sources).toHaveLength(1)
    const src = sources[0]!

    expect(src.id).toBe('legado:https://re0zero.top')
    expect(src.name).toBe('rezero')
    expect(src.kind).toBe('book')
    expect(src.format).toBe('legado3_book')
    expect(src.group).toBe('轻小说')
    expect(src.homeUrl).toBe('https://re0zero.top')
    expect(src.enabled).toBe(true)
    expect(src.tags).toContain('legado')
    expect(src.tags).toContain('type:0')
  })

  it('bookSourceType 映射：0=book, 1=music, 2=comic, 3=custom', () => {
    const types: Array<[number, string]> = [
      [0, 'book'],
      [1, 'music'],
      [2, 'comic'],
      [3, 'custom'],
    ]
    for (const [type, expected] of types) {
      const src = adapter.parse({ ...rezeroSource, bookSourceType: type })[0]!
      expect(src.kind, `type ${type}`).toBe(expected)
    }
  })

  it('header JSON 解析', () => {
    const src = adapter.parse(masiroSource)[0]!
    // header 应被解析并注入到 search 管道的 request 中
    const searchReq = src.search.segments[0]!.request
    expect(searchReq?.headers?.['Referer']).toBe('https://masiro.me/')
  })

  it('header 为空或非法时不崩溃', () => {
    const src = adapter.parse({ ...rezeroSource, header: 'not json' })[0]!
    expect(src.search.segments[0]!.request?.headers).toBeUndefined()
  })
})

describe('LegadoAdapter — URL 解析', () => {
  const adapter = new LegadoAdapter()

  it('searchUrl 相对路径 → 拼接 baseUrl', () => {
    const src = adapter.parse(masiroSource)[0]!
    const searchUrl = src.search.segments[0]!.request!.url!
    expect(searchUrl).toBe('https://masiro.me/admin/loadMoreNovels?page={{page}}&keyword={{key}}')
  })

  it('searchUrl 带 JSON 选项 → 提取 charset + 去除 @js 后缀', () => {
    const src = adapter.parse(wenku8Source)[0]!
    const req = src.search.segments[0]!.request!
    expect(req.url).toContain('searchkey={{key}}')
    expect(req.url).not.toContain('@js:')
    expect(req.url).not.toContain('charset')
    expect(req.charset).toBe('gbk' as never)
  })

  it('searchUrl 绝对路径 → 原样保留', () => {
    const src = adapter.parse(rezeroSource)[0]!
    const searchUrl = src.search.segments[0]!.request!.url!
    expect(searchUrl).toContain('https://baidu.com')
  })

  it('exploreUrl JSON 数组 → 解析为 explore 管道', () => {
    const src = adapter.parse(rezeroSource)[0]!
    expect(src.explore).toBeDefined()
    const exploreReq = src.explore!.segments[0]!.request!
    // rezero exploreUrl 是 JSON 数组，第一个条目 url=/mdbook/book/index.html
    expect(exploreReq.url).toBe('https://re0zero.top/mdbook/book/index.html')
  })

  it('exploreUrl @js: 动态 → 不生成 explore 管道（M1 限制）', () => {
    const src = adapter.parse(wenku8Source)[0]!
    // wenku8 exploreUrl 是 @js: 动态生成 → M1 不支持 → explore 为 undefined
    expect(src.explore).toBeUndefined()
  })

  it('searchUrl 缺失 → 使用默认 URL', () => {
    const noSearch = { ...rezeroSource, searchUrl: undefined }
    const src = adapter.parse(noSearch)[0]!
    const url = src.search.segments[0]!.request!.url!
    expect(url).toContain('/search?')
    expect(url).toContain('{{key}}')
    expect(url).toContain('{{page}}')
  })
})

describe('LegadoAdapter — 管道结构', () => {
  const adapter = new LegadoAdapter()

  it('search 管道使用 listRule + fields 模式', () => {
    const src = adapter.parse(wenku8Source)[0]!
    const seg = src.search.segments[0]!
    expect(seg.listRule).toBe('@css:#content>table td>div')
    expect(seg.fields).toBeDefined()
    expect(seg.fields!['name']).toBe('//div[2]/b/a/@title')
    expect(seg.fields!['author']).toBe('//div[2]/p[1]##(.+作者:)|(/分类:.+)')
    expect(seg.fields!['coverUrl']).toBe('img@src')
    expect(seg.fields!['bookUrl']).toBe('//div[2]/b/a/@href')
  })

  it('detail 管道使用 fields 模式（无 listRule）', () => {
    const src = adapter.parse(wenku8Source)[0]!
    const seg = src.detail.segments[0]!
    expect(seg.listRule).toBeUndefined()
    expect(seg.fields).toBeDefined()
    expect(seg.fields!['name']).toContain('id.content')
    expect(seg.fields!['tocUrl']).toBe('text.小说目录@href')
    expect(seg.fields!['wordCount']).toContain('全文长度')
  })

  it('toc 管道使用 listRule + fields', () => {
    const src = adapter.parse(rezeroSource)[0]!
    const seg = src.toc.segments[0]!
    expect(seg.listRule).toBe('a[href^="markdown/ch/"]')
    expect(seg.fields).toBeDefined()
    expect(seg.fields!['chapterName']).toBe('text')
    expect(seg.fields!['chapterUrl']).toBe('href##.*index.*')
  })

  it('content 管道使用串行 steps（非 fields 模式）', () => {
    const src = adapter.parse(rezeroSource)[0]!
    const seg = src.content.segments[0]!
    expect(seg.listRule).toBeUndefined()
    expect(seg.fields).toBeUndefined()
    expect(seg.steps).toHaveLength(1)
    expect(seg.steps[0]!.action).toBe('jsoup')
    expect(seg.steps[0]!.expr).toBe('#content@html##<h1.*?<\\/h1>')
  })

  it('explore 管道使用 listRule + fields', () => {
    const src = adapter.parse(rezeroSource)[0]!
    const seg = src.explore!.segments[0]!
    expect(seg.listRule).toBe('h1')
    expect(seg.fields).toBeDefined()
    expect(seg.fields!['name']).toBe('text')
  })
})

describe('LegadoAdapter — 端到端管道执行', () => {
  it('search 管道 listRule+fields 执行 → 返回结构化列表', async () => {
    // 构造一个简单的书源用于端到端测试
    const simpleSource: LegadoBookSource = {
      bookSourceName: '测试书源',
      bookSourceUrl: 'https://test.example.com',
      bookSourceType: 0,
      enabled: true,
      searchUrl: '/search?q={{key}}&p={{page}}',
      ruleSearch: {
        bookList: '.book-item',
        name: '.title@text',
        author: '.author@text',
        bookUrl: '.title@href',
      },
    }

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

    const adapter = new LegadoAdapter()
    const source = adapter.parse(simpleSource)[0]!
    const executor = new PipelineExecutor()

    const result = await executor.execute(
      source.search,
      { key: '斗破', page: 1 },
      {
        fetch: (async (url: string | URL) => {
          const u = String(url)
          expect(u).toBe('https://test.example.com/search?q=斗破&p=1')
          return {
            ok: true,
            status: 200,
            statusText: 'OK',
            url: u,
            headers: new Map(),
            text: async () => HTML,
          } as unknown as Response
        }) as never,
      }
    )

    // 返回应该是结构化列表
    expect(Array.isArray(result.data)).toBe(true)
    const list = result.data as Record<string, string>[]
    expect(list).toHaveLength(2)
    expect(list[0]!['name']).toBe('斗破苍穹')
    expect(list[0]!['author']).toBe('天蚕土豆')
    expect(list[0]!['bookUrl']).toBe('/book/1')
    expect(list[1]!['name']).toBe('凡人修仙传')
  })

  it('detail 管道 fields 执行 → 返回字段映射', async () => {
    const simpleSource: LegadoBookSource = {
      bookSourceName: '测试书源',
      bookSourceUrl: 'https://test.example.com',
      bookSourceType: 0,
      enabled: true,
      ruleBookInfo: {
        name: '.book-name@text',
        author: '.book-author@text',
        intro: '.book-intro@text',
      },
    }

    const HTML = `
      <div class="book-detail">
        <h1 class="book-name">斗破苍穹</h1>
        <p class="book-author">天蚕土豆</p>
        <p class="book-intro">少年萧炎...</p>
      </div>
    `

    const adapter = new LegadoAdapter()
    const source = adapter.parse(simpleSource)[0]!
    const executor = new PipelineExecutor()

    const result = await executor.execute(
      source.detail,
      { nativeId: '1' },
      {
        fetch: (async () => ({
          ok: true,
          status: 200,
          statusText: 'OK',
          url: '',
          headers: new Map(),
          text: async () => HTML,
        }) as unknown as Response) as never,
      }
    )

    // 返回应该是字段映射
    const fields = result.data as Record<string, string>
    expect(fields['name']).toBe('斗破苍穹')
    expect(fields['author']).toBe('天蚕土豆')
    expect(fields['intro']).toContain('少年萧炎')
  })
})

describe('LegadoAdapter — 批量解析', () => {
  it('解析多个书源 → 返回数组', () => {
    const adapter = new LegadoAdapter()
    const sources = adapter.parse([rezeroSource, masiroSource, wenku8Source])
    expect(sources).toHaveLength(3)
    expect(sources[0]!.name).toBe('rezero')
    expect(sources[1]!.name).toBe('真白萌')
    expect(sources[2]!.name).toBe('轻小说文库')
  })

  it('过滤无效书源（缺少 bookSourceName 或 bookSourceUrl）', () => {
    const adapter = new LegadoAdapter()
    const invalid: LegadoBookSource = {
      bookSourceName: '',
      bookSourceUrl: '',
    }
    const sources = adapter.parse([rezeroSource, invalid])
    expect(sources).toHaveLength(1)
  })
})
