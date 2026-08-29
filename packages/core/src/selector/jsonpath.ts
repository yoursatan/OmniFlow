/* ==========================================================
 * JSONPath 选择器（§B.1 `$.` 前缀）
 * 使用 jsonpath-plus 库查询 JSON 数据
 * ========================================================== */

import { JSONPath } from 'jsonpath-plus'
import type { AnalyzeResult } from './types'

/**
 * 执行 JSONPath 查询
 * @param input JSON 对象或 JSON 字符串
 * @param path JSONPath 表达式（如 `$.data.list[*].name`）
 */
export function jsonPathSelect(
  input: object | string,
  path: string
): AnalyzeResult {
  try {
    const data = typeof input === 'string' ? JSON.parse(input) : input
    const result = JSONPath({ path, json: data, wrap: false })
    const list = Array.isArray(result) ? result : result !== undefined ? [result] : []

    return {
      list,
      single: list[0] ?? '',
      text: typeof list[0] === 'string' ? list[0] : JSON.stringify(list[0] ?? ''),
      nodes: list,
    }
  } catch {
    return { list: [], single: '', text: '', nodes: [] }
  }
}
