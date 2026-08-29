/* ==========================================================
 * 规则执行上下文
 * 管理 {{baseUrl}} {{key}} {{page}} 等模板变量 + JS 变量
 * 参考：开发规划 §8.1 L5 全局上下文与变量
 * ========================================================== */

export interface RuleContext {
  /** 模板变量（{{baseUrl}} {{key}} {{page}} 等） */
  variables: Record<string, unknown>
  /** JS 变量（@put:{} / @get:{} / java.put / java.get） */
  jsVars: Record<string, unknown>
  /** JS 执行函数（M1: Function 构造 / M2: QuickJS 沙箱） */
  jsEval?: (code: string, input: unknown) => unknown
  /** HTTP fetch 函数（注入用于测试或代理） */
  fetch?: (url: string, options?: RequestInit) => Promise<Response>
  /** 调试事件回调（可选，规则工坊用） */
  onEvent?: (event: RuleEvent) => void
}

export interface RuleEvent {
  seq: number
  type: 'segment:enter' | 'segment:exit' | 'step:enter' | 'step:exit' | 'io' | 'error' | 'snapshot'
  segmentId?: string
  stepIndex?: number
  action?: string
  inputSnippet?: unknown
  outputSnippet?: unknown
  error?: { name: string; message: string }
}

/** 创建默认上下文 */
export function createContext(overrides?: Partial<RuleContext>): RuleContext {
  return {
    variables: overrides?.variables ?? {},
    jsVars: overrides?.jsVars ?? {},
    jsEval: overrides?.jsEval ?? createDefaultJsEval(),
    fetch: overrides?.fetch,
    onEvent: overrides?.onEvent,
  }
}

/**
 * M1 默认 JS 求值器（用 Function 构造，不安全）
 * M2 将替换为 QuickJS-WASM 沙箱
 */
function createDefaultJsEval(): (code: string, input: unknown) => unknown {
  return (code: string, input: unknown) => {
    try {
      // 注入 result / baseUrl / key / page 等常用变量
      const fn = new Function('result', 'baseUrl', 'key', 'page', `"use strict"; ${code}`)
      return fn(input, undefined, undefined, undefined)
    } catch (e) {
      throw new Error(`JS eval failed: ${(e as Error).message}`)
    }
  }
}

/** 模板变量替换 */
export function interpolateTemplate(template: string, ctx: RuleContext): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const v = ctx.variables[key]
    return v !== undefined ? String(v) : `{{${key}}}`
  })
}
