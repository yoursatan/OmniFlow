/* ==========================================================
 * 选择器引擎共享类型
 * 参考：开发规划 §8.2 选择器引擎 + §B.1 选择器类型速查
 * ========================================================== */

/** 选择器步骤类型（对应 §8.2 executeChain 的 step.type） */
export type SelectorStepType =
  | 'css'       // @css: 前缀
  | 'jsoup'     // 无前缀（Legado 原生 JSoup 语法）
  | 'xpath'     // // 前缀
  | 'jsonpath'  // $. 前缀
  | 'regex'     // : 前缀
  | 'text'      // 纯文本提取
  | 'js'        // @js: / <js> 块（M2 沙箱前由 Function 构造执行）
  | 'match'     // 正则匹配
  | 'replace'   // 正则替换

/** 选择器步骤定义 */
export interface SelectorStep {
  type: SelectorStepType
  /** 选择器表达式 / 正则 / JS 代码 */
  selector: string
  /** 正则替换的目标（仅 replace 类型） */
  replacement?: string
  /** 动作后缀：@text / @html / @href / @src 等 */
  action?: string
}

/** 选择器执行链 */
export interface SelectorChain {
  steps: SelectorStep[]
}

/** 选择器执行结果（统一输出） */
export interface AnalyzeResult {
  /** 匹配到的节点列表（cheerio Element / DOM Node / JSON 值） */
  list: unknown[]
  /** 第一个匹配（便捷访问） */
  single: unknown
  /** 提取的文本（如果有 @text/@href 等动作） */
  text: string
  /** 原始节点（供下一步消费） */
  nodes: unknown[]
}

/** 执行上下文（变量 + JS 沙箱接口） */
export interface SelectorContext {
  /** 模板变量 {{baseUrl}} {{key}} {{page}} 等 */
  variables: Record<string, unknown>
  /** JS 执行函数（M1 用 Function 构造，M2 换 QuickJS） */
  jsEval?: (code: string, input: unknown) => unknown
}

/** 从选择器结果中提取动作后缀值 */
export type ActionExtractor = (node: unknown, action: string) => string

/** 选择器引擎接口 */
export interface ISelectorEngine {
  /** 执行选择器链 */
  executeChain(
    input: string | object,
    chain: SelectorChain,
    ctx?: SelectorContext
  ): AnalyzeResult
  /** 编译原始规则字符串为选择器链 */
  compileRule(rule: string, ctx?: SelectorContext): SelectorChain
}

/** 后处理变换函数类型 */
export type Transform = (input: string) => string

/** 规则段模式（对应 §8.1 L2 段首 mode 判定） */
export type SegmentMode = 'jsoup' | 'css' | 'xpath' | 'json' | 'regex' | 'js'

/** 编译后的规则段 */
export interface CompiledSegment {
  mode: SegmentMode
  steps: SelectorStep[]
  transforms: Transform[]
}

/** 编译后的规则节点（对应 §7.2 RuleNode） */
export interface CompiledRuleNode {
  segments: CompiledSegment[]
  join: 'or' | 'and'
}

/** 判断规则字符串的模式（§8.1 L2） */
export function detectMode(rule: string): SegmentMode {
  if (rule.startsWith('$.') || rule.startsWith('$[')) return 'json'
  if (rule.startsWith('//') || rule.startsWith('@XPath:')) return 'xpath'
  if (rule.startsWith('@js:') || rule.startsWith('<js>')) return 'js'
  if (rule.startsWith(':')) return 'regex'
  if (rule.startsWith('@css:')) return 'css'
  return 'jsoup'
}

/** 从规则中去除模式前缀 */
export function stripModePrefix(rule: string, mode: SegmentMode): string {
  switch (mode) {
    case 'css':
      return rule.startsWith('@css:') ? rule.slice(5) : rule
    case 'xpath':
      return rule.startsWith('@XPath:') ? rule.slice(7) : rule
    case 'js':
      if (rule.startsWith('@js:')) return rule.slice(4)
      if (rule.startsWith('<js>') && rule.endsWith('</js>'))
        return rule.slice(4, -5)
      return rule
    case 'regex':
      return rule.startsWith(':') ? rule.slice(1) : rule
    default:
      return rule
  }
}

/** 从规则末尾提取动作后缀 @text/@html/@href 等 */
export function extractAction(rule: string): { rule: string; action?: string } {
  const match = rule.match(/@(text|html|textNodes|ownText|href|src|data-src|all)$/)
  if (!match) return { rule, action: undefined }
  return {
    rule: rule.slice(0, rule.length - match[0].length),
    action: match[1],
  }
}
