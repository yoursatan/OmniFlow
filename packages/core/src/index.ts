/* ==========================================================
 * @omniflow/core 顶层入口
 * M1：选择器引擎 + 规则路由 + Pipeline + 内存 Repo + Legado 适配器
 * ========================================================== */

// ——— IR 类型 re-export（消费端直接 import '@omniflow/core' 获取类型）———
export {
  type OmniEngine,
  type OmniEngineOptions,
  type OmniRepo,
  type DebugSession,
  type DebuggerController,
  type DebugEvent,
  type Pagination,
  ENGINE_NAME,
  ENGINE_VERSION,
  ENGINE_UA,
} from '@omniflow/shared';

export {
  type UnifiedSource,
  type SourceKind,
  type SourceFormat,
  type RulePipeline,
  type RuleSegment,
  type RuleStep,
  type RuleActionPrefix,
  type OmniRequest,
  type OmniResponse,
  type SourceHealth,
} from '@omniflow/shared';

export {
  type BaseContentItem,
  type BookItem,
  type VideoItem,
  type ComicItem,
  type MusicItem,
  type RadioChannel,
  type Chapter,
  type ChapterGroup,
  type TableOfContents,
  type TextContent,
  type ImageListContent,
  type PlaySource,
  type MusicSource,
  type AggregatedItem,
} from '@omniflow/shared';

// ——— M1 实现 ———
// 选择器引擎
export { SelectorEngine, compileRule, executeRuleNode } from './selector'
export type {
  AnalyzeResult,
  SelectorChain,
  SelectorStep,
  SelectorStepType,
  SelectorContext,
  CompiledRuleNode,
  CompiledSegment,
  SegmentMode,
} from './selector'
export { cssSelect, jsoupSelect, xpathSelect, jsonPathSelect, regexSelect } from './selector'
export { parseJSoupRule } from './selector'
export { regexReplace, extractTransforms, applyTransforms } from './selector'
export { detectMode, stripModePrefix, extractAction } from './selector'

// 规则路由 + 管道执行
export { RuleRouter } from './engine/rule-router'
export { PipelineExecutor } from './engine/pipeline'
export type { PipelineResult } from './engine/pipeline'
export { createContext, interpolateTemplate } from './engine/context'
export type { RuleContext, RuleEvent } from './engine/context'

// 仓库
export { MemoryRepo } from './repo/memory'

// 适配器
export { LegadoAdapter } from './adapters/legado'
export type { LegadoBookSource } from './adapters/legado'

// ——— M2+ 占位（保持向后兼容）———
// JS 沙箱（M2 实现；QuickJS-WASM）
export const jsRuntime = {
  quickjs: undefined as unknown,
  hostApi: undefined as unknown,
} as const;

// 聚合 + 相似归并（M3/M4 实现）
export const aggregate = {
  search: undefined as unknown,
  switchSource: undefined as unknown,
  dedupe: undefined as unknown,
} as const;

// 协议
export const protocols = undefined as unknown;

// HTTP 客户端（M1 使用 fetch，后续增强缓存 + 代理）
export const http = undefined as unknown;
