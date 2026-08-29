/* ==========================================================
 * 正则选择器（§B.1 `:` 前缀）
 * 格式: `:pattern` → 正则捕获，默认返回第一捕获组
 * ========================================================== */

import type { AnalyzeResult } from './types'

/**
 * 执行正则选择
 * @param input 输入字符串
 * @param pattern 正则表达式（不带前导 `:`）
 * @param flags 正则标志（默认 'g'）
 */
export function regexSelect(
  input: string,
  pattern: string,
  flags = 'g'
): AnalyzeResult {
  try {
    const re = new RegExp(pattern, flags)
    const matches: string[] = []
    let m: RegExpExecArray | null

    if (flags.includes('g')) {
      while ((m = re.exec(input)) !== null) {
        matches.push(m[1] ?? m[0])
      }
    } else {
      m = re.exec(input)
      if (m) matches.push(m[1] ?? m[0])
    }

    return {
      list: matches,
      single: matches[0] ?? '',
      text: matches[0] ?? '',
      nodes: matches,
    }
  } catch {
    return { list: [], single: '', text: '', nodes: [] }
  }
}

/**
 * 正则替换
 * @param input 输入字符串
 * @param pattern 正则
 * @param replacement 替换字符串
 */
export function regexReplace(
  input: string,
  pattern: string,
  replacement: string
): string {
  try {
    return input.replace(new RegExp(pattern, 'g'), replacement)
  } catch {
    return input
  }
}
