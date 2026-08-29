/* ==========================================================
 * JSoup 模拟器（§8.3 Legado 原生语法）
 * 格式: 类型.值.索引@动作 → 链式伪选择步骤
 *
 * 示例:
 *   class.book-item.0@tag.a@text
 *   id.content@textNodes
 *   tag.div.-1@html
 * ========================================================== */

import * as cheerio from 'cheerio'
import type { AnalyzeResult } from './types'

/** JSoup 伪选择步骤 */
interface JSoupStep {
  /** 类型: class / id / tag / text / children */
  type: string
  /** 值: 类名 / ID / 标签名 / 文本内容 */
  value: string
  /** 索引: 第几个匹配（负数从后往前） */
  index?: number
  /** 动作后缀: @text / @html / @href 等 */
  action?: string
}

/**
 * 解析 JSoup 规则字符串为步骤列表
 * 格式: class.book-item.0@tag.a@text
 * 按 @ 切分，每段再按 . 切分
 */
export function parseJSoupRule(rule: string): JSoupStep[] {
  const parts = rule.split('@')
  const steps: JSoupStep[] = []

  for (const part of parts) {
    const tokens = part.split('.')
    // 纯动作后缀（如 text/html/href）→ 归属上一步
    if (tokens.length === 1 && isAction(tokens[0]!)) {
      if (steps.length > 0) {
        steps[steps.length - 1]!.action = tokens[0]!
      }
      continue
    }

    const step: JSoupStep = {
      type: tokens[0]!,
      value: tokens[1] ?? '',
    }

    // 第三个 token 是索引（数字）
    if (tokens.length >= 3) {
      const idx = parseInt(tokens[2]!, 10)
      if (!isNaN(idx)) step.index = idx
    }

    // 如果最后一个 token 是动作
    const lastToken = tokens[tokens.length - 1]!
    if (tokens.length >= 2 && isAction(lastToken)) {
      step.action = lastToken
      // 索引可能是倒数第二个
      if (tokens.length >= 4) {
        const idx = parseInt(tokens[tokens.length - 2]!, 10)
        if (!isNaN(idx)) step.index = idx
      }
    }

    steps.push(step)
  }

  return steps
}

function isAction(token: string): boolean {
  return ['text', 'html', 'textNodes', 'ownText', 'href', 'src', 'data-src', 'all'].includes(token)
}

/** 从 cheerio 节点提取动作值 */
function extractAction($node: cheerio.Cheerio<any>, action?: string): string {
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
      return $node.first().contents().filter((_, n) => n.type === 'text').text().trim()
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

/** 按类型查找节点 */
function findByType(
  $ctx: cheerio.Cheerio<any>,
  type: string,
  value: string
): cheerio.Cheerio<any> {
  switch (type) {
    case 'class':
      return $ctx.find(`.${value}`).addBack(`.${value}`)
    case 'id':
      return $ctx.find(`#${value}`).addBack(`#${value}`)
    case 'tag':
      return $ctx.find(value).addBack(value)
    case 'text':
      return $ctx.find(`*:contains("${value}")`).addBack(`:contains("${value}")`)
    case 'children':
      return $ctx.children()
    default:
      return $ctx.find(value).addBack(value)
  }
}

/** 按索引取节点 */
function selectIndex(
  $nodes: cheerio.Cheerio<any>,
  index?: number
): cheerio.Cheerio<any> {
  if (index === undefined) return $nodes
  const arr = $nodes.toArray()
  if (index >= 0 && index < arr.length) {
    return $nodes.eq(index)
  }
  if (index < 0 && Math.abs(index) <= arr.length) {
    return $nodes.eq(arr.length + index)
  }
  return $nodes
}

/**
 * 执行 JSoup 选择器链
 * @param input HTML 字符串
 * @param rule JSoup 规则字符串（如 `class.book-item.0@tag.a@text`）
 */
export function jsoupSelect(input: string, rule: string): AnalyzeResult {
  try {
    const steps = parseJSoupRule(rule)
    if (steps.length === 0) {
      return { list: [], single: '', text: '', nodes: [] }
    }

    const $doc = cheerio.load(input)
    let current: cheerio.Cheerio<any> = $doc.root()

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i]!
      const isLast = i === steps.length - 1

      if (step.type === 'css') {
        // 支持 @css: 步骤穿插
        current = current.find(step.value).addBack(step.value)
      } else {
        let $found = findByType(current, step.type, step.value)
        $found = selectIndex($found, step.index)
        current = $found
      }

      if (isLast && step.action) {
        const text = extractAction(current, step.action)
        return {
          list: [text],
          single: text,
          text,
          nodes: current.toArray(),
        }
      }
    }

    // 无动作后缀 → 返回文本
    const text = current.text().trim()
    const nodes = current.toArray()
    return {
      list: [text],
      single: text,
      text,
      nodes,
    }
  } catch {
    return { list: [], single: '', text: '', nodes: [] }
  }
}

/**
 * 从已有 cheerio 节点执行 JSoup 规则
 */
export function jsoupSelectFromNode(
  $node: cheerio.Cheerio<any>,
  rule: string
): AnalyzeResult {
  try {
    const steps = parseJSoupRule(rule)
    if (steps.length === 0) {
      return { list: [], single: '', text: '', nodes: [] }
    }

    let current = $node

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i]!
      const isLast = i === steps.length - 1

      let $found = findByType(current, step.type, step.value)
      $found = selectIndex($found, step.index)
      current = $found

      if (isLast && step.action) {
        const text = extractAction(current, step.action)
        return { list: [text], single: text, text, nodes: current.toArray() }
      }
    }

    const text = current.text().trim()
    return { list: [text], single: text, text, nodes: current.toArray() }
  } catch {
    return { list: [], single: '', text: '', nodes: [] }
  }
}
