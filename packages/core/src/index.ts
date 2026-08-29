/* ==========================================================
 * @omniflow/core 顶层入口
 * M0：占位导出；M1 将在此导出 createEngine / OmniEngine 具体实现
 * ========================================================== */

// 目前先 re-export shared 的类型，确保消费端 import '@omniflow/core' 时
// 可以直接用核心类型（避免双端重复依赖 @omniflow/shared）。
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

// ——— M1 起的实现占位（按规划 §15 目录结构，先导出 undefined 占位）———
// 适配器（11 类源，M1/M2 分阶段实现）
export const adapters = {
  legado: undefined as unknown,
  tvbox: undefined as unknown,
  hikerEso: undefined as unknown,
  hikerDrpy: undefined as unknown,
  cmsXml: undefined as unknown,
  cmsJson: undefined as unknown,
  iptvM3u: undefined as unknown,
  iptvTxt: undefined as unknown,
  rss: undefined as unknown,
  opds: undefined as unknown,
  custom: undefined as unknown,
} as const;

// 规则引擎（核心 ★）
export const engine = {
  ruleRouter: undefined as unknown,  // §8.1 段-步 v2 编译执行器
  pipeline: undefined as unknown,    // §8 Pipeline 5 级
  selectors: undefined as unknown,   // §8 jsoup-sim / css / xpath / jsonPath / regex
} as const;

// JS 沙箱（M2 实现；QuickJS-WASM）
export const jsRuntime = {
  quickjs: undefined as unknown,
  hostApi: undefined as unknown,     // §9.2 hiker.* 兼容层
} as const;

// 聚合 + 相似归并（M3/M4 实现）
export const aggregate = {
  search: undefined as unknown,
  switchSource: undefined as unknown,
  dedupe: undefined as unknown,
} as const;

// 协议（CMS / IPTV / RSS / OPDS 等的原生客户端）
export const protocols = undefined as unknown;

// HTTP 客户端（带缓存 + 代理 + UA 伪装）
export const http = undefined as unknown;

// 仓库实现（内存 + Dexie + Better-SQLite 三种）
export const repo = {
  memory: undefined as unknown,       // 测试 / Web 无持久化场景
  dexie: undefined as unknown,        // Web 端 IndexedDB
  sqlite: undefined as unknown,       // 桌面端 Tauri + better-sqlite3
} as const;
