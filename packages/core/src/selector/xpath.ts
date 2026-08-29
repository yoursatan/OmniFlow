/* ==========================================================
 * XPath 选择器（§B.1 `//` 前缀）
 * 使用 @xmldom/xmldom + xpath 库
 * ========================================================== */

import { DOMParser } from '@xmldom/xmldom'
import xpath from 'xpath'
import type { AnalyzeResult } from './types'

/**
 * 执行 XPath 查询
 * @param input HTML/XML 字符串
 * @param expression XPath 表达式
 */
export function xpathSelect(
  input: string,
  expression: string
): AnalyzeResult {
  try {
    // xmldom 是 XML 解析器；需用 text/xml mime 才能让 xpath.select 正常工作
    // HTML 片段通常多根节点，需包裹以确保 XML 合法；XPath // 会递归，包裹不影响结果
    const trimmed = input.trim()
    const stripped = trimmed.startsWith('<?xml') ? trimmed.replace(/^<\?xml[^>]*\?>/, '').trim() : trimmed
    const wrapped = `<root>${stripped}</root>`
    const doc = new DOMParser({
      errorHandler: () => {},
    }).parseFromString(wrapped, 'text/xml')

    const nodes = xpath.select(expression, doc as unknown as Node)
    const list = Array.isArray(nodes) ? nodes : [nodes]

    const textList = list.map((n: unknown) => {
      if (typeof n === 'string' || typeof n === 'number') return String(n)
      if (n && typeof n === 'object' && 'nodeValue' in n) {
        return String((n as { nodeValue: string }).nodeValue)
      }
      if (n && typeof n === 'object' && 'textContent' in n) {
        return String((n as { textContent: string }).textContent)
      }
      return String(n ?? '')
    })

    return {
      list: textList,
      single: textList[0] ?? '',
      text: textList[0] ?? '',
      nodes: list,
    }
  } catch {
    return { list: [], single: '', text: '', nodes: [] }
  }
}
