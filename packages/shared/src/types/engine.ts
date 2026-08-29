/* ==========================================================
 * OmniFlow Shared Types · engine.ts
 * 引擎运行时接口：引擎实例、调试会话、仓库、聚合器等对外契约
 * 参考：开发规划 §7 + §10
 * ========================================================== */

import type {
  SourceHealth,
  UnifiedSource,
  OmniRequest,
  OmniResponse,
} from './source.js';
import type {
  AggregatedItem,
  BaseContentItem,
  ExplorePage,
  PlaySource,
  TableOfContents,
  TextContent,
  ImageListContent,
  MusicSource,
} from './content.js';

/** 仓库接口（内存 / IndexedDB / SQLite 可互换实现） */
export interface OmniRepo {
  /* -------- 源管理 -------- */
  listSources(options?: { kind?: string; format?: string; enabledOnly?: boolean }): Promise<UnifiedSource[]>;
  getSource(id: string): Promise<UnifiedSource | undefined>;
  upsertSources(sources: UnifiedSource[]): Promise<void>;
  removeSources(ids: string[]): Promise<void>;
  updateSourceHealth(id: string, health: SourceHealth): Promise<void>;

  /* -------- 收藏/历史（由消费端使用，类型 any 避免 shared 耦合 Vue 组件）-------- */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addFavorite(itemId: string, payload: any): Promise<void>;
  removeFavorite(itemId: string): Promise<void>;
  listFavorites(options?: { kind?: string; groupId?: string }): Promise<Array<{ itemId: string; addedAt: string } & Record<string, unknown>>>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recordHistory(itemId: string, payload: any): Promise<void>;
  listHistory(limit?: number): Promise<Array<{ itemId: string; watchedAt: string } & Record<string, unknown>>>;

  /* -------- 缓存（HTTP / Pipeline 结果） -------- */
  cacheGet<T = unknown>(key: string): Promise<{ value: T; expiresAt?: string } | undefined>;
  cacheSet(key: string, value: unknown, ttlSec?: number): Promise<void>;
  cacheInvalidate(pattern: string): Promise<void>;
}

/** 调试器事件：在分步调试器中作为 timeline 渲染 */
export interface DebugEvent {
  seq: number;
  at: string;                          // ISO
  type: 'segment:enter' | 'segment:exit' | 'step:enter' | 'step:exit' | 'io' | 'error' | 'snapshot';
  segmentId?: string;
  stepIndex?: number;
  action?: string;
  /** 该步骤前后的 data */
  inputSnippet?: unknown;
  outputSnippet?: unknown;
  /** I/O 事件专用 */
  request?: OmniRequest;
  response?: { status: number; latencyMs: number; length: number };
  /** 错误事件专用 */
  error?: { name: string; message: string; stack?: string };
}

/** 调试会话（规则工坊调试器调用） */
export interface DebugSession {
  sessionId: string;
  /** 会话所属源 ID / 管道名 */
  sourceId: string;
  pipelineName: 'explore' | 'search' | 'detail' | 'toc' | 'content' | 'sniff' | 'feed';
  /** 输入参数（如关键词 / 条目 ID / 章节 ID / 页码） */
  input: Record<string, unknown>;
  /** 是否已结束 */
  finished: boolean;
  /** 是否因错误终止 */
  aborted?: boolean;
  /** 时间线（按 seq 顺序） */
  events: DebugEvent[];
  /** 最终 pipeline 输出 */
  result?: unknown;
  /** 未捕获错误（如有） */
  fatalError?: DebugEvent['error'];
}

/** 调试器控制句柄 */
export interface DebuggerController {
  /** 启动会话（若传入 breakpoints 则在指定 segmentId:stepIndex 处暂停） */
  start(params: {
    source: UnifiedSource;
    pipeline: DebugSession['pipelineName'];
    input: Record<string, unknown>;
    breakpoints?: Array<`${string}:${number}`>;
  }): Promise<DebugSession>;
  /** 继续下一个断点 */
  resume(sessionId: string): Promise<DebugSession>;
  /** 单步跳入（下一个 step） */
  stepInto(sessionId: string): Promise<DebugSession>;
  /** 强制中断 */
  abort(sessionId: string): Promise<void>;
  /** 读当前上下文变量（用于 Inspector 面板） */
  inspectVariables(sessionId: string): Record<string, unknown>;
}

/** 引擎对外统一接口（Web / 桌面 / CLI 均共用此契约） */
export interface OmniEngine {
  /** 仓库句柄 */
  repo: OmniRepo;
  /** 调试器句柄 */
  debugger: DebuggerController;

  /* -------- 适配器注册（Legado/TVBox/海阔… 11 种） -------- */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  registerAdapter(format: string, adapter: any): void;

  /* -------- 基础 HTTP（所有管道共享，带缓存 + 代理模式）-------- */
  fetch<T = unknown>(req: OmniRequest): Promise<OmniResponse<T>>;

  /* -------- 统一规则执行入口 -------- */
  /** 执行任意命名管道 */
  runPipeline<T = unknown>(source: UnifiedSource, pipeline: string, input: Record<string, unknown>): Promise<T>;

  /* -------- 消费端语义化接口 -------- */
  search(query: { keyword: string; kind?: string; sourceIds?: string[]; page?: number }): Promise<BaseContentItem[]>;
  explore(query: { sourceId: string; categoryId?: string; page?: number }): Promise<ExplorePage>;
  detail(sourceId: string, nativeId: string): Promise<BaseContentItem>;
  toc(sourceId: string, nativeId: string): Promise<TableOfContents>;
  readText(sourceId: string, chapterId: string): Promise<TextContent>;
  readImages(sourceId: string, chapterId: string): Promise<ImageListContent>;
  resolvePlay(sourceId: string, chapterId: string, lineId?: string): Promise<PlaySource>;
  resolveMusic(sourceId: string, chapterId: string): Promise<MusicSource>;

  /* -------- 聚合层（相似归并 + 换源） -------- */
  searchAggregated(query: { keyword: string; kind?: string; sourceIds?: string[] }): Promise<AggregatedItem[]>;
  /** 快速切换同一内容的其它源 */
  switchSource(aggregatedKey: string, targetSourceId: string): Promise<{
    source: UnifiedSource;
    detail: BaseContentItem;
    toc: TableOfContents;
  }>;
}

/** 引擎配置（传给 `createEngine(opts)`） */
export interface OmniEngineOptions {
  /** HTTP 全局超时，默认 15s */
  globalTimeoutMs?: number;
  /** 缓存 TTL，默认 10min；设置 0 关闭 */
  defaultCacheTtlSec?: number;
  /** CORS 代理（Web 端必配；桌面端可空） */
  proxyBaseUrl?: string;
  /** 并发请求数 */
  concurrency?: number;
  /** 启用 JS 沙箱吗？默认 true；M2 之前可置 false 触发降级警告 */
  enableJsSandbox?: boolean;
  /** 启用 Python 沙箱吗？v1 之前通常 false */
  enablePySandbox?: boolean;
  /** 启用的日志级别 */
  logLevel?: 'trace' | 'debug' | 'info' | 'warn' | 'error';
  /** 仓库实现注入（内存 / Dexie / Better-SQLite） */
  repo?: OmniRepo;
}

/** 聚合搜索/分类的分页参数 */
export interface Pagination {
  page: number;
  pageSize: number;
}

/** 引擎版本常量（注入到 HTTP UA，供排障） */
export const ENGINE_NAME = 'OmniFlow' as const;
export const ENGINE_VERSION = '0.1.0-pre' as const;
export const ENGINE_UA = `Mozilla/5.0 (compatible; ${ENGINE_NAME}/${ENGINE_VERSION})` as const;
