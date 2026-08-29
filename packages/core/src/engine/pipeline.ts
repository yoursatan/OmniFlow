/* ==========================================================
 * Pipeline — 段-步 v2 管道执行引擎
 * 参考：开发规划 §8.1 + §8.2 + §8.4
 *
 * 职责：执行 RulePipeline（search/detail/toc/content）
 * 流程：HTTP 请求 → 选择器执行 → 字段提取 → 后处理 → 输出
 * ========================================================== */

import type { RulePipeline, RuleSegment, RuleStep, OmniRequest, OmniResponse } from '@omniflow/shared'
import type { RuleContext, RuleEvent } from './context'
import { createContext, interpolateTemplate } from './context'
import { RuleRouter } from './rule-router'

/** 管道执行结果 */
export interface PipelineResult<T = unknown> {
  data: T
  debugEvents: RuleEvent[]
}

/**
 * Pipeline 执行器
 */
export class PipelineExecutor {
  private router: RuleRouter
  private defaultFetch?: (url: string, options?: RequestInit) => Promise<Response>

  constructor(options?: {
    fetch?: (url: string, options?: RequestInit) => Promise<Response>
    jsEval?: (code: string, input: unknown) => unknown
  }) {
    this.router = new RuleRouter()
    this.defaultFetch = options?.fetch
    if (options?.jsEval) {
      // 注入自定义 JS 求值器
    }
  }

  /**
   * 执行一条完整管道
   * @param pipeline 管道定义
   * @param input 输入参数（{ key, page, nativeId, chapterId, ... }）
   * @param overrides 覆盖选项（fetch 函数、变量等）
   */
  async execute<T = unknown>(
    pipeline: RulePipeline,
    input: Record<string, unknown>,
    overrides?: { fetch?: typeof fetch; baseUrl?: string }
  ): Promise<PipelineResult<T>> {
    const ctx = createContext({
      variables: { ...input },
      jsEval: undefined, // M1 暂不启用 JS 求值
    })

    if (overrides?.baseUrl) {
      ctx.variables['baseUrl'] = overrides.baseUrl
    }

    const events: RuleEvent[] = []
    let currentInput: string | object = ''
    let pipelineResult: unknown = ''

    // 按段顺序执行
    for (const seg of pipeline.segments) {
      const segEvent: RuleEvent = {
        seq: events.length,
        type: 'segment:enter',
        segmentId: seg.id,
      }
      events.push(segEvent)

      try {
        // 1. 如果段有 HTTP 请求，执行请求
        if (seg.request) {
          const response = await this.executeRequest(seg.request, ctx, overrides)
          currentInput = response.body as string
        }

        // 2. 执行段内步骤
        for (let i = 0; i < seg.steps.length; i++) {
          const step = seg.steps[i]
          if (!step) continue
          events.push({
            seq: events.length,
            type: 'step:enter',
            segmentId: seg.id,
            stepIndex: i,
            action: step.action,
            inputSnippet: typeof currentInput === 'string'
              ? currentInput.slice(0, 200)
              : undefined,
          })

          // 执行步骤（使用 RuleRouter）
          const ruleStr = this.stepToRuleString(step)
          const result = this.router.execute(currentInput, ruleStr, ctx)
          currentInput = result.text || result.single || ''

          events.push({
            seq: events.length,
            type: 'step:exit',
            segmentId: seg.id,
            stepIndex: i,
            outputSnippet: typeof currentInput === 'string'
              ? (currentInput as string).slice(0, 200)
              : undefined,
          })

        }

        // 3. 如果段有 listRule + fields，执行列表+字段提取
        if (seg.listRule && seg.fields) {
          events.push({
            seq: events.length,
            type: 'step:enter',
            segmentId: seg.id,
            stepIndex: seg.steps.length,
            action: 'list' as never,
            inputSnippet: typeof currentInput === 'string'
              ? (currentInput as string).slice(0, 200)
              : undefined,
          })
          const listResult = this.router.extractList(
            typeof currentInput === 'string' ? currentInput : JSON.stringify(currentInput),
            seg.listRule,
            seg.fields,
            ctx
          )
          pipelineResult = listResult
          events.push({
            seq: events.length,
            type: 'step:exit',
            segmentId: seg.id,
            stepIndex: seg.steps.length,
            outputSnippet: `list[${listResult.length}]`,
          })
        } else if (seg.fields) {
          // 仅字段提取（详情页模式）
          const fieldResult = this.router.extractFields(
            typeof currentInput === 'string' ? currentInput : JSON.stringify(currentInput),
            seg.fields,
            ctx
          )
          pipelineResult = fieldResult
          events.push({
            seq: events.length,
            type: 'step:exit',
            segmentId: seg.id,
            stepIndex: seg.steps.length,
            outputSnippet: JSON.stringify(fieldResult).slice(0, 200),
          })
        }

        events.push({ seq: events.length, type: 'segment:exit', segmentId: seg.id })
      } catch (e) {
        const error = e as Error
        events.push({
          seq: events.length,
          type: 'error',
          segmentId: seg.id,
          error: { name: error.name, message: error.message },
        })
        if (seg.haltOnError !== false) break
      }
    }

    // 优先返回结构化结果（list/fields），否则返回最后一步的文本输出
    const finalData = pipelineResult !== '' ? pipelineResult : currentInput
    return {
      data: finalData as T,
      debugEvents: events,
    }
  }

  /**
   * 执行搜索管道
   */
  async search(
    pipeline: RulePipeline,
    keyword: string,
    page: number,
    overrides?: { fetch?: typeof fetch; baseUrl?: string }
  ): Promise<PipelineResult<unknown>> {
    return this.execute(pipeline, { key: keyword, page }, overrides)
  }

  /**
   * 执行详情管道
   */
  async detail(
    pipeline: RulePipeline,
    nativeId: string,
    overrides?: { fetch?: typeof fetch; baseUrl?: string }
  ): Promise<PipelineResult<unknown>> {
    return this.execute(pipeline, { nativeId }, overrides)
  }

  /**
   * 执行目录管道
   */
  async toc(
    pipeline: RulePipeline,
    nativeId: string,
    overrides?: { fetch?: typeof fetch; baseUrl?: string }
  ): Promise<PipelineResult<unknown>> {
    return this.execute(pipeline, { nativeId }, overrides)
  }

  /**
   * 执行正文管道
   */
  async content(
    pipeline: RulePipeline,
    chapterId: string,
    overrides?: { fetch?: typeof fetch; baseUrl?: string }
  ): Promise<PipelineResult<unknown>> {
    return this.execute(pipeline, { chapterId }, overrides)
  }

  // ——— 内部方法 ———

  /**
   * 执行 HTTP 请求
   */
  private async executeRequest(
    req: Partial<OmniRequest>,
    ctx: RuleContext,
    overrides?: { fetch?: typeof fetch }
  ): Promise<OmniResponse> {
    const url = interpolateTemplate(req.url ?? '', ctx)

    const fetchFn = overrides?.fetch ?? this.defaultFetch ?? fetch
    const response = await fetchFn(url, {
      method: req.method ?? 'GET',
      headers: req.headers,
    })

    const body = await response.text()
    const latencyMs = 0 // 无法从 fetch API 获取

    return {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      finalUrl: response.url,
      headers: Object.fromEntries(response.headers.entries()),
      body,
      latencyMs,
    }
  }

  /**
   * 将 RuleStep 转换为规则字符串
   * 根据 action 添加选择器模式前缀（若 expr 未自带前缀）
   * expr 已含完整规则（含 @action 后缀），name 仅供 debugger 引用，不拼入规则
   */
  private stepToRuleString(step: RuleStep): string {
    const expr = Array.isArray(step.expr) ? step.expr.join('&&') : step.expr
    switch (step.action) {
      case 'css':
        return expr.startsWith('@css:') ? expr : `@css:${expr}`
      case 'xpath':
        return expr.startsWith('//') || expr.startsWith('@XPath:') ? expr : `//${expr}`
      case 'jsonPath':
        return expr.startsWith('$.') || expr.startsWith('$[') ? expr : `$.${expr}`
      case 'regex':
        return expr.startsWith(':') ? expr : `:${expr}`
      default:
        // jsoup / replace / trim 等无需前缀
        return expr
    }
  }

  /** 获取路由器（测试用） */
  getRouter(): RuleRouter {
    return this.router
  }
}
