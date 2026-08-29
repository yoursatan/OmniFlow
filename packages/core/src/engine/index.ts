/* ==========================================================
 * @omniflow/core/engine — 引擎入口
 * 导出 RuleRouter + PipelineExecutor + Context
 * ========================================================== */

export { RuleRouter } from './rule-router'
export { PipelineExecutor } from './pipeline'
export type { PipelineResult } from './pipeline'
export { createContext, interpolateTemplate } from './context'
export type { RuleContext, RuleEvent } from './context'
