/* ==========================================================
 * SelectorEngine — 选择器引擎统一入口
 * 参考：开发规划 §8.2 选择器引擎
 *
 * 职责：将原始规则字符串编译为选择器链，执行后返回 AnalyzeResult
 * 支持 5 大选择器 + 后处理变换 + 段间 && / || 逻辑
 * ========================================================== */

import * as cheerio from 'cheerio'
import type {
  AnalyzeResult,
  SelectorChain,
  SelectorContext,
  SelectorStep,
  CompiledRuleNode,
  CompiledSegment,
  SegmentMode,
} from './types'
import { detectMode, stripModePrefix, extractAction } from './types'
import { extractTransforms, applyTransforms } from './transforms'
import { cssSelect, cssSelectFromNode } from './css'
import { jsoupSelect, jsoupSelectFromNode } from './jsoup-sim'
import { xpathSelect } from './xpath'
import { jsonPathSelect } from './jsonpath'
import { regexSelect } from './regex'

// ——— 空结果 ———
const EMPTY: AnalyzeResult = { list: [], single: '', text: '', nodes: [] }

// ——— 模板变量替换 {{...}} ———
function interpolate(rule: string, ctx?: SelectorContext): string {
  if (!ctx?.variables) return rule
  return rule.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const v = ctx.variables[key]
    return v !== undefined ? String(v) : `{{${key}}}`
  })
}

// ——— 段级编译：规则字符串 → CompiledSegment ———
function compileSegment(rawRule: string, ctx?: SelectorContext): CompiledSegment {
  // 1. 模板变量替换
  let rule = interpolate(rawRule, ctx)

  // 2. 提取后处理变换
  const extracted = extractTransforms(rule)
  rule = extracted.rule
  const transforms = extracted.transforms

  // 3. 检测模式
  const mode = detectMode(rule)

  // 4. 去除模式前缀
  rule = stripModePrefix(rule, mode)

  // 5. 提取动作后缀
  const { rule: pureRule, action } = extractAction(rule)

  // 6. 构建步骤
  const steps: SelectorStep[] = []

  if (mode === 'jsoup') {
    // JSoup 段：按 @ 切分为多步
    // 但这里我们简化为一步（jsoupSelect 内部已处理 @ 切分）
    steps.push({ type: 'jsoup', selector: pureRule, action })
  } else if (mode === 'css') {
    steps.push({ type: 'css', selector: pureRule, action })
  } else if (mode === 'xpath') {
    steps.push({ type: 'xpath', selector: pureRule })
  } else if (mode === 'json') {
    steps.push({ type: 'jsonpath', selector: pureRule })
  } else if (mode === 'regex') {
    steps.push({ type: 'regex', selector: pureRule })
  } else if (mode === 'js') {
    steps.push({ type: 'js', selector: pureRule })
  }

  return { mode, steps, transforms }
}

/**
 * 编译原始规则字符串为 CompiledRuleNode
 * 处理 && (AND 串联) 和 || (OR 回退) 逻辑
 */
export function compileRule(
  rule: string,
  ctx?: SelectorContext
): CompiledRuleNode {
  // 1. 按 || 切分（OR 回退）
  const orParts = splitOnOperator(rule, '||')
  const join = orParts.length > 1 ? 'or' : 'and'

  // 2. 如果有 ||，每段独立编译，取第一个有结果的
  if (orParts.length > 1) {
    const segments = orParts.map(part => compileSegment(part.trim(), ctx))
    return { segments, join: 'or' }
  }

  // 3. 按 && 切分（AND 串联）
  const andParts = splitOnOperator(rule, '&&')
  const segments = andParts.map(part => compileSegment(part.trim(), ctx))

  return { segments, join: 'and' }
}

/**
 * 按操作符切分，但不切分 {{}} 和 <js></js> 内的内容
 */
function splitOnOperator(rule: string, op: string): string[] {
  const parts: string[] = []
  let current = ''
  let inJs = false
  let inTemplate = false

  for (let i = 0; i < rule.length; i++) {
    // 检测 <js> 块开始/结束
    if (rule.slice(i, i + 4) === '<js>') inJs = true
    else if (rule.slice(i, i + 5) === '</js>') inJs = false

    // 检测 {{ 模板开始/结束
    if (rule.slice(i, i + 2) === '{{') inTemplate = true
    else if (rule.slice(i, i + 2) === '}}') inTemplate = false

    // 检测操作符（不在 js 块或模板内时切分）
    if (!inJs && !inTemplate && rule.slice(i, i + op.length) === op) {
      parts.push(current)
      current = ''
      i += op.length - 1
    } else {
      current += rule[i]
    }
  }
  parts.push(current)
  return parts
}

/**
 * 执行编译后的规则节点
 */
export function executeRuleNode(
  input: string | object,
  node: CompiledRuleNode,
  ctx?: SelectorContext
): AnalyzeResult {
  if (node.join === 'or') {
    // OR 回退：依次尝试每段，取第一个有结果的
    for (const seg of node.segments) {
      const result = executeSegment(input, seg, ctx)
      if (result.text || result.list.length > 0) {
        return result
      }
    }
    return EMPTY
  } else {
    // AND 串联：前段输出 = 后段输入
    let current: AnalyzeResult = { list: [input], single: input, text: '', nodes: [input] }
    for (const seg of node.segments) {
      const nextInput = typeof current.single === 'string'
        ? current.single as string
        : current.text || String(current.single ?? '')
      current = executeSegment(nextInput, seg, ctx)
    }
    return current
  }
}

/**
 * 执行单个编译段
 */
function executeSegment(
  input: string | object,
  seg: CompiledSegment,
  ctx?: SelectorContext
): AnalyzeResult {
  let result: AnalyzeResult = EMPTY

  for (const step of seg.steps) {
    result = executeStep(input, step, ctx)
    // 更新输入为步骤输出（如果下一步需要）
    // 对于 HTML 类选择器，需要传入上一步的节点
  }

  // 应用后处理变换
  if (seg.transforms.length > 0 && result.text) {
    const transformed = applyTransforms(result.text, seg.transforms)
    result = { ...result, text: transformed, single: transformed }
  }

  return result
}

/**
 * 执行单个选择器步骤
 */
function executeStep(
  input: string | object,
  step: SelectorStep,
  ctx?: SelectorContext
): AnalyzeResult {
  const strInput = typeof input === 'string' ? input : JSON.stringify(input)

  switch (step.type) {
    case 'css':
      return cssSelect(strInput, step.selector, step.action)

    case 'jsoup':
      return jsoupSelect(strInput, step.selector)

    case 'xpath':
      return xpathSelect(strInput, step.selector)

    case 'jsonpath':
      return jsonPathSelect(input, step.selector)

    case 'regex':
      return regexSelect(strInput, step.selector)

    case 'js':
      // M1: 用 Function 构造执行（M2 换 QuickJS 沙箱）
      if (ctx?.jsEval) {
        try {
          const jsResult = ctx.jsEval(step.selector, input)
          const text = String(jsResult ?? '')
          return { list: [text], single: text, text, nodes: [jsResult] }
        } catch {
          return EMPTY
        }
      }
      return EMPTY

    case 'replace':
      return {
        list: [],
        single: strInput,
        text: strInput,
        nodes: [],
      }

    default:
      return EMPTY
  }
}

/**
 * SelectorEngine 类（面向消费端的高级 API）
 */
export class SelectorEngine {
  /** 编译原始规则字符串 */
  compile(rule: string, ctx?: SelectorContext): CompiledRuleNode {
    return compileRule(rule, ctx)
  }

  /** 执行原始规则字符串（编译 + 执行一步到位） */
  execute(
    input: string | object,
    rule: string,
    ctx?: SelectorContext
  ): AnalyzeResult {
    const node = this.compile(rule, ctx)
    return executeRuleNode(input, node, ctx)
  }

  /** 执行编译后的规则节点 */
  executeCompiled(
    input: string | object,
    node: CompiledRuleNode,
    ctx?: SelectorContext
  ): AnalyzeResult {
    return executeRuleNode(input, node, ctx)
  }
}

// ——— 导出子模块 ———
export { cssSelect, cssSelectFromNode } from './css'
export { jsoupSelect, jsoupSelectFromNode, parseJSoupRule } from './jsoup-sim'
export { xpathSelect } from './xpath'
export { jsonPathSelect } from './jsonpath'
export { regexSelect, regexReplace } from './regex'
export { extractTransforms, applyTransforms } from './transforms'
export type {
  AnalyzeResult,
  SelectorChain,
  SelectorStep,
  SelectorStepType,
  SelectorContext,
  CompiledRuleNode,
  CompiledSegment,
  SegmentMode,
} from './types'
export { detectMode, stripModePrefix, extractAction } from './types'
