/* ==========================================================
 * CSS 选择器（§B.1 `@css:` 前缀）
 * 使用 cheerio 解析 HTML 并执行 CSS 选择器
 * ========================================================== */

import * as cheerio from 'cheerio'
import type { AnalyzeResult, ActionExtractor } from './types'

/** 从 cheerio 节点提取动作后缀值 */
export const cssActionExtractor: ActionExtractor = (node: unknown, action: string): string => {
  const $node = node as cheerio.Cheerio<any>
  switch (action) {
    case 'text':
      return $node.text().trim()
    case 'html':
      return $node.html() ?? ''
    case 'textNodes':
      return $node.contents()
        .filter((_, n) => n.type === 'text')
        .map((_, n) => (n as any).data ?? '')
        .get()
        .join('')
        .trim()
    case 'ownText':
      return $node.contents().first().text().trim()
    case 'href':
      return $node.attr('href') ?? ''
    case 'src':
      return $node.attr('src') ?? ''
    case 'data-src':
      return $node.attr('data-src') ?? ''
    case 'all':
      return $node.html() ?? ''
    default:
      return $node.text().trim()
  }
}

/**
 * 执行 CSS 选择器查询
 * @param input HTML 字符串
 * @param selector CSS 选择器表达式
 * @param action 动作后缀 @text/@html/@href 等
 */
export function cssSelect(
  input: string,
  selector: string,
  action?: string
): AnalyzeResult {
  try {
    const $doc = cheerio.load(input)
    const $nodes = $doc(selector)

    const nodes: unknown[] = $nodes.toArray().map(el => $doc(el))
    const extractor = action
      ? (n: unknown) => cssActionExtractor(n, action)
      : (n: unknown) => (n as cheerio.Cheerio<any>).text().trim()

    const list = nodes.map(extractor)

    return {
      list,
      single: list[0] ?? '',
      text: typeof list[0] === 'string' ? list[0] : String(list[0] ?? ''),
      nodes,
    }
  } catch {
    return { list: [], single: '', text: '', nodes: [] }
  }
}

/**
 * 从已有 cheerio 节点执行 CSS 选择器
 * @param $node cheerio 节点
 * @param selector CSS 选择器
 * @param action 动作后缀
 */
export function cssSelectFromNode(
  $node: cheerio.Cheerio<any>,
  selector: string,
  action?: string
): AnalyzeResult {
  try {
    const $matched = $node.find(selector).addBack(selector)
    const nodes: unknown[] = $matched.toArray().map(el => $node)
    const extractor = action
      ? (n: unknown) => cssActionExtractor(n, action)
      : (n: unknown) => (n as cheerio.Cheerio<any>).text().trim()

    const list = nodes.map(extractor)

    return {
      list,
      single: list[0] ?? '',
      text: typeof list[0] === 'string' ? list[0] : String(list[0] ?? ''),
      nodes,
    }
  } catch {
    return { list: [], single: '', text: '', nodes: [] }
  }
}
