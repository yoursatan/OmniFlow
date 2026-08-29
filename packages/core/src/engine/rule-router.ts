/* ==========================================================
 * RuleRouter — 段-步 v2 规则编译执行器
 * 参考：开发规划 §8.1 规则执行模型 v2
 *
 * L1: 段级切分（&& / ||，不切 {{}} 和 <js>）
 * L2: 段首 mode 判定（jsoup/css/xpath/json/regex/js）
 * L3: 段内步骤流水线
 * L4: 段级后处理（##regex## / replaceRegex / trim / reverse）
 * L5: 全局上下文（{{...}} 模板变量）
 * ========================================================== */

import type { RuleContext, RuleEvent } from './context'
import type { AnalyzeResult, CompiledRuleNode, CompiledSegment } from '../selector/types'
import { detectMode, stripModePrefix, extractAction, type SelectorStep } from '../selector/types'
import { extractTransforms, applyTransforms } from '../selector/transforms'
import { compileRule, executeRuleNode } from '../selector'
import { SelectorEngine } from '../selector'

const EMPTY: AnalyzeResult = { list: [], single: '', text: '', nodes: [] }

/**
 * RuleRouter — 将原始 Legado 规则字符串编译为可执行函数
 */
export class RuleRouter {
  private engine: SelectorEngine

  constructor() {
    this.engine = new SelectorEngine()
  }

  /**
   * 编译规则字符串 → CompiledRuleNode
   * 处理 L1-L4
   */
  compile(rule: string, ctx?: RuleContext): CompiledRuleNode {
    return compileRule(rule, ctx as never)
  }

  /**
   * 执行规则字符串，返回结果
   */
  execute(
    input: string | object,
    rule: string,
    ctx?: RuleContext
  ): AnalyzeResult {
    return this.engine.execute(input, rule, ctx as never)
  }

  /**
   * 执行编译后的规则节点
   */
  executeCompiled(
    input: string | object,
    node: CompiledRuleNode,
    ctx?: RuleContext
  ): AnalyzeResult {
    return executeRuleNode(input, node, ctx as never)
  }

  /**
   * 批量执行字段规则
   * 用于 Stage 级别：request → HTML → fields 映射
   * @param input HTTP 响应体
   * @param fieldRules 字段名 → 规则字符串映射
   * @param ctx 执行上下文
   * @returns 字段名 → 提取值
   */
  extractFields(
    input: string | object,
    fieldRules: Record<string, string>,
    ctx?: RuleContext
  ): Record<string, string> {
    const result: Record<string, string> = {}

    for (const [field, rule] of Object.entries(fieldRules)) {
      try {
        const analyzed = this.execute(input, rule, ctx)
        result[field] = analyzed.text
      } catch {
        result[field] = ''
      }
    }

    return result
  }

  /**
   * 执行列表规则 + 每行字段提取
   * 用于 search/explore/toc 等"列表 + 字段"管道
   * @param input HTTP 响应体
   * @param listRule 列表选择规则
   * @param fieldRules 每个列表项的字段规则
   * @param ctx 执行上下文
   * @returns 字段对象数组
   */
  extractList(
    input: string,
    listRule: string,
    fieldRules: Record<string, string>,
    ctx?: RuleContext
  ): Record<string, string>[] {
    try {
      // 1. 用列表规则获取节点列表
      const listResult = this.execute(input, listRule, ctx)
      if (!listResult.nodes || listResult.nodes.length === 0) {
        return []
      }

      // 2. 对每个节点执行字段提取
      const items: Record<string, string>[] = []
      for (const node of listResult.nodes) {
        const item: Record<string, string> = {}
        for (const [field, rule] of Object.entries(fieldRules)) {
          try {
            // 字段规则在节点上下文中执行
            // cheerio 节点需转为 HTML 字符串，字符串直接使用
            const nodeHtml = typeof node === 'string'
              ? node
              : String((node as { toString?: () => string })?.toString?.() ?? '')
            const fieldResult = this.execute(nodeHtml, rule, ctx)
            item[field] = fieldResult.text
          } catch {
            item[field] = ''
          }
        }
        items.push(item)
      }

      return items
    } catch {
      return []
    }
  }

  /** 获取选择器引擎实例（测试用） */
  getEngine(): SelectorEngine {
    return this.engine
  }
}
