import { describe, it, expect } from 'vitest'
import {
  SelectorEngine,
  cssSelect,
  jsoupSelect,
  xpathSelect,
  jsonPathSelect,
  regexSelect,
  regexReplace,
  parseJSoupRule,
  detectMode,
  extractTransforms,
  applyTransforms,
} from '../selector'

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
<div id="content"><p>正文内容</p></div>
`

describe('SelectorEngine', () => {
  const engine = new SelectorEngine()

  describe('CSS 选择器', () => {
    it('@css: 前缀选择文本', () => {
      const result = engine.execute(HTML, '@css:.book-item .title@text')
      expect(result.text).toBe('斗破苍穹')
    })

    it('CSS 选择 href', () => {
      const result = engine.execute(HTML, '@css:.book-item a@href')
      expect(result.text).toBe('/book/1')
    })

    it('CSS 选择所有匹配', () => {
      const result = cssSelect(HTML, '.book-item .title', 'text')
      expect(result.list).toHaveLength(2)
      expect(result.list[0]).toBe('斗破苍穹')
      expect(result.list[1]).toBe('凡人修仙传')
    })
  })

  describe('JSoup 模拟器', () => {
    it('class.book-item 选择 + @tag.a@text', () => {
      const result = jsoupSelect(HTML, 'class.book-item.0@tag.a@text')
      expect(result.text).toBe('斗破苍穹')
    })

    it('id.content@text 提取文本', () => {
      const result = jsoupSelect(HTML, 'id.content@text')
      expect(result.text).toContain('正文内容')
    })

    it('parseJSoupRule 解析步骤', () => {
      const steps = parseJSoupRule('class.book-item.0@tag.a@text')
      expect(steps.length).toBeGreaterThanOrEqual(2)
      expect(steps[0].type).toBe('class')
      expect(steps[0].value).toBe('book-item')
    })

    it('负索引从后往前', () => {
      const result = jsoupSelect(HTML, 'class.book-item.-1@tag.a@text')
      expect(result.text).toBe('凡人修仙传')
    })
  })

  describe('JSONPath 选择器', () => {
    const data = { data: { list: [{ name: 'A' }, { name: 'B' }] } }

    it('$. 查询单值', () => {
      const result = jsonPathSelect(data, '$.data.list[0].name')
      expect(result.text).toBe('A')
    })

    it('$. [*] 查询所有', () => {
      const result = jsonPathSelect(data, '$.data.list[*].name')
      expect(result.list).toEqual(['A', 'B'])
    })
  })

  describe('XPath 选择器', () => {
    it('// 选择节点', () => {
      const result = xpathSelect(HTML, '//a[@class="title"]/text()')
      expect(result.list.length).toBeGreaterThanOrEqual(1)
      expect(result.text).toContain('斗破苍穹')
    })
  })

  describe('Regex 选择器', () => {
    it(': 正则捕获第一组', () => {
      const result = regexSelect('url=https://example.com&page=2', 'url=([^&]+)')
      expect(result.text).toBe('https://example.com')
    })

    it('regexReplace 正则替换', () => {
      const result = regexReplace('hello   world', '\\s+', ' ')
      expect(result).toBe('hello world')
    })
  })

  describe('后处理变换', () => {
    it('##regex##replacement 提取', () => {
      const { rule, transforms } = extractTransforms('text##\\s+##_')
      expect(rule).toBe('text')
      expect(transforms.length).toBe(1)
      const applied = applyTransforms('hello world', transforms)
      expect(applied).toBe('hello_world')
    })

    it('trim 后缀', () => {
      const { rule, transforms } = extractTransforms('text.trim')
      expect(rule).toBe('text')
      expect(transforms.length).toBe(1)
      const applied = applyTransforms('  hello  ', transforms)
      expect(applied).toBe('hello')
    })
  })

  describe('模式检测', () => {
    it('detectMode 各前缀', () => {
      expect(detectMode('@css:.item')).toBe('css')
      expect(detectMode('class.item@text')).toBe('jsoup')
      expect(detectMode('//div/a')).toBe('xpath')
      expect(detectMode('$.data.list')).toBe('json')
      expect(detectMode(':pattern')).toBe('regex')
      expect(detectMode('@js:result')).toBe('js')
    })
  })
})
