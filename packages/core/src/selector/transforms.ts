/* ==========================================================
 * 后处理变换（§8.1 L4 段级后处理）
 * 支持: ##regex##replacement / replaceRegex!pattern!replacement
 *       / reverse / format(template) / trim / join
 * ========================================================== */

import type { Transform } from './types'
import { regexReplace } from './regex'

/**
 * 从规则末尾提取后处理变换
 * 格式1: ##pattern##replacement（正则替换）
 * 格式2: rule##pattern##replacement（规则 + 正则替换）
 * 格式3: rule||rule2（在 rule-router 中处理，此处不涉及）
 */
export function extractTransforms(rule: string): { rule: string; transforms: Transform[] } {
  const transforms: Transform[] = []

  // ##pattern##replacement → regexReplace
  const tripleHash = rule.match(/##(.+?)##(.*)$/)
  if (tripleHash) {
    const pattern = tripleHash[1]!
    const replacement = tripleHash[2]!
    transforms.push((input: string) => regexReplace(input, pattern, replacement))
    rule = rule.slice(0, rule.length - tripleHash[0].length)
  }

  // replaceRegex!pattern!replacement
  const replaceRegexMatch = rule.match(/replaceRegex!(.+?)!(.*)$/)
  if (replaceRegexMatch) {
    const pattern = replaceRegexMatch[1]!
    const replacement = replaceRegexMatch[2]!
    transforms.push((input: string) => regexReplace(input, pattern, replacement))
    rule = rule.slice(0, rule.length - replaceRegexMatch[0].length)
  }

  // trim
  if (rule.endsWith('.trim') || rule.endsWith('|trim')) {
    transforms.push((input: string) => input.trim())
    rule = rule.replace(/\.trim$|\|trim$/, '')
  }

  // reverse
  if (rule.endsWith('.reverse') || rule.endsWith('|reverse')) {
    transforms.push((input: string) => input.split('').reverse().join(''))
    rule = rule.replace(/\.reverse$|\|reverse$/, '')
  }

  return { rule, transforms }
}

/**
 * 应用所有变换
 */
export function applyTransforms(input: string, transforms: Transform[]): string {
  return transforms.reduce((acc, fn) => fn(acc), input)
}

/**
 * 创建格式化变换
 * format(template) → 用输入替换 {{result}} 占位
 */
export function createFormatTransform(template: string): Transform {
  return (input: string) => template.replace(/{{result}}/g, input)
}
