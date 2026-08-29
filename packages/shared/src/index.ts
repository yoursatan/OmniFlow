/* ==========================================================
 * OmniFlow Shared Index · 统一出口
 * ========================================================== */

// ——— source.ts ———
export {
  type SourceKind,
  type SourceFormat,
  type RuleActionPrefix,
  type RuleStep,
  type RuleSegment,
  type RulePipeline,
  type OmniRequest,
  type OmniResponse,
  type SourceHealth,
  type UnifiedSource,
  type CompiledPipeline,
} from './types/source.js';

// ——— content.ts ———
export {
  type BaseContentItem,
  type BookItem,
  type VideoItem,
  type VideoRegion,
  type ComicItem,
  type MusicItem,
  type RadioChannel,
  type ExploreCategory,
  type ExplorePage,
  type ChapterGroup,
  type Chapter,
  type TableOfContents,
  type TextContent,
  type ImageListContent,
  type PlaySource,
  type MusicSource,
  type AggregatedItem,
} from './types/content.js';

// ——— engine.ts ———
export {
  type OmniRepo,
  type DebugEvent,
  type DebugSession,
  type DebuggerController,
  type OmniEngine,
  type OmniEngineOptions,
  type Pagination,
  ENGINE_NAME,
  ENGINE_VERSION,
  ENGINE_UA,
} from './types/engine.js';
