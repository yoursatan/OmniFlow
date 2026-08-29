/* ==========================================================
 * OmniFlow Shared Types · source.ts
 * 源格式 IR：统一源描述符 + 规则段-步流水线 + 源元数据
 * 参考：开发规划 §7.1 中间表示设计
 * ========================================================== */

/** 源所属主类型（对应 4 大消费端） */
export type SourceKind = 'book' | 'video' | 'comic' | 'music' | 'radio' | 'rss' | 'custom';

/** 原生格式（对应 §5 兼容性矩阵 11 类） */
export type SourceFormat =
  | 'legado3_book'
  | 'tvbox1_plus_video'
  | 'hiker_eso_video'
  | 'hiker_drpy_video'
  | 'cms_xml'
  | 'cms_json'
  | 'iptv_m3u'
  | 'iptv_txt'
  | 'rss'
  | 'opds'
  | 'custom_rule';

/** 规则步骤动作（来自 §8.2 §8.3 规则前缀 + 动作表） */
export type RuleActionPrefix =
  /** 选择器族 */
  | 'css'
  | 'jsoup'
  | 'xpath'
  | 'jsonPath'
  | 'regex'
  /** 处理器族 */
  | 'replace'
  | 'trim'
  | 'join'
  | 'split'
  | 'parse'
  | 'encode'
  | 'decode'
  | 'base64'
  | 'md5'
  | 'dateFormat'
  /** 结构族 */
  | 'list'
  | 'map'
  | 'head'
  | 'tail'
  | 'slice'
  | 'merge'
  | 'pick'
  /** 控制族 */
  | 'if'
  | 'switch'
  | 'try'
  | 'loop'
  | 'return'
  /** I/O 族 */
  | 'http'
  | 'cacheGet'
  | 'cacheSet'
  | 'cookieGet'
  | 'cookieSet'
  /** JS 沙箱 */
  | 'jsEval'
  | 'pyEval'
  /* 占位：后续扩展 */
  | (string & {});

/** 规则执行步骤（Step = 前缀 + 参数 二元组） */
export interface RuleStep {
  /** 动作前缀（§8 动作词典） */
  action: RuleActionPrefix;
  /** 该动作的表达式/表达式列表（按不同动作语义解析） */
  expr: string | string[];
  /** 可选：命名该步结果，后续可 `$name` 引用 */
  name?: string;
  /** 可选：超时毫秒（仅 I/O 族） */
  timeoutMs?: number;
  /** 可选：出错时的回退默认值（任意 JSON 可表达值） */
  fallback?: unknown;
}

/** 规则段（Segment = 一组 step + 可选的初始化/上下文） */
export interface RuleSegment {
  /** 段 ID；在同一条源内唯一 */
  id: string;
  /** 段名（debugger 展示用） */
  label?: string;
  /** 该段所需 HTTP 请求体（I/O 族的 get/body/cookie 等参数） */
  request?: Partial<OmniRequest>;
  /** 步骤列表；串行执行，前一步的 `data` 是下一步的输入 */
  steps: RuleStep[];
  /** 可选：段失败重试次数（默认 0） */
  retries?: number;
  /** 可选：下一步骤失败是否中止整条 pipeline（默认 true） */
  haltOnError?: boolean;
}

/** 统一规则管道（段-步 v2） */
export interface RulePipeline {
  /** 管道名，如 explore/search/detail/chapter/content */
  name: string;
  /** 段列表，按顺序执行；段间共享 context */
  segments: RuleSegment[];
  /** 可选：共享的 HTTP 配置 */
  defaults?: Partial<OmniRequest>;
}

/** OmniFlow 标准 HTTP 请求 */
export interface OmniRequest {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD' | 'OPTIONS';
  headers?: Record<string, string>;
  query?: Record<string, string | number | boolean | undefined | null>;
  body?: string | URLSearchParams | FormData;
  timeoutMs?: number;
  /** 编码策略（默认 utf-8；Legado 有 gbk 场景） */
  charset?: 'utf-8' | 'gbk' | 'gb2312' | 'big5' | (string & {});
  /** 是否强制走 apps/server 代理（规避 CORS / IP 封禁） */
  useProxy?: boolean;
  /** 保留原始响应字节（二进制/压缩场景）*/
  raw?: boolean;
}

/** OmniFlow 标准 HTTP 响应 */
export interface OmniResponse<T = unknown> {
  ok: boolean;
  status: number;
  statusText: string;
  finalUrl: string;
  headers: Record<string, string>;
  /** 解析后的结构化数据（字符串 / HTML Document 模拟 / JSON / 二进制） */
  body: T;
  rawBody?: ArrayBuffer;
  /** 从请求发出到收到响应头的毫秒数（用于源健康打分） */
  latencyMs?: number;
}

/** 统一源的健康状态（§10.5 健康度） */
export interface SourceHealth {
  /** 近 N 次成功率 0..1 */
  successRate: number;
  /** 平均响应时长 ms */
  avgLatencyMs: number;
  /** 最近一次成功时间 ISO 字符串 */
  lastSuccessAt?: string;
  /** 最近一次失败时间 ISO 字符串 */
  lastFailureAt?: string;
  /** 连续失败次数 */
  consecutiveFailures: number;
  /** 综合健康分 0..100（前端展示用） */
  score: number;
}

/** 统一源（UnifiedSource = 顶层 IR，所有适配器的输出） */
export interface UnifiedSource {
  /** 全局唯一源 ID；格式：`{格式缩写}:{SHA1(关键字段)}` */
  id: string;
  /** 显示名（如"起点中文网-legado"、"爱奇艺 CMS-json"） */
  name: string;
  /** 所属消费端大类 */
  kind: SourceKind;
  /** 原始格式（兼容信息记录） */
  format: SourceFormat;
  /** 源分组（前端导航：阅读/影视/综艺/动漫/电台…） */
  group?: string;
  /** 语言（用于智能匹配） */
  lang?: 'zh-CN' | 'zh-TW' | 'en-US' | 'ja-JP' | (string & {});
  /** 入口页（可能是 baseUrl，也可能是发现页 URL） */
  homeUrl?: string;
  /** Logo / 封面图（可选） */
  logoUrl?: string;
  /** 源作者 / 维护者（Legado/TVBox 生态中常见） */
  author?: string;
  /** 版本号，用于订阅更新去重（兼容升级） */
  version?: number | string;

  /** ============================================================
   *  规则段：每条管道消费端按需调用
   * ============================================================ */
  /** 发现/分类管道（可选；IPTV 等无发现） */
  explore?: RulePipeline;
  /** 搜索管道（必须） */
  search: RulePipeline;
  /** 详情管道（必须；book/video/comic/music 详情结构不同） */
  detail: RulePipeline;
  /** 目录/播放列表管道（阅读/漫画/影视：章节；直播：单条即可）*/
  toc: RulePipeline;
  /** 正文/播放源管道（阅读正文、影视解析接口、漫画图列表）*/
  content: RulePipeline;
  /** 可选：媒体播放源附加嗅探管道（M4 用）*/
  sniff?: RulePipeline;
  /** 可选：RSS/OPDS 订阅刷新管道 */
  feed?: RulePipeline;

  /** ============================================================
   *  运行时字段（不持久化，由 engine 加载时注入）
   * ============================================================ */
  enabled?: boolean;
  health?: SourceHealth;
  /** 订阅源（管理端分类：自建/社区/订阅链接） */
  subscriptionId?: string;
  /** 自定义加载顺序（越小越靠前） */
  sortOrder?: number;
  /** 标签（前端多选筛选） */
  tags?: string[];
  /** 备注（给用户的说明，比如需要登录 / 地区限制）*/
  note?: string;
  /** 创建/更新时间（ISO 字符串） */
  createdAt?: string;
  updatedAt?: string;
}

/** 将 RulePipeline 编译后的可执行句柄（引擎侧使用，shared 仅保留类型） */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CompiledPipeline = (...args: any[]) => Promise<unknown>;
