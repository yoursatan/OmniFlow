/* ==========================================================
 * OmniFlow Shared Types · content.ts
 * 消费端 IR：书籍/影视/漫画/音乐/直播频道/章节/正文 等
 * 参考：开发规划 §7.2 消费端 IR 类型蓝图
 * ========================================================== */

import type { SourceKind } from './source.js';

/** 聚合条目通用字段（所有搜索/发现结果的公共部分） */
export interface BaseContentItem {
  /** 条目全局唯一 ID：`{源ID}:{nativeId}` */
  id: string;
  /** 条目原生 ID（源内唯一） */
  nativeId: string;
  /** 来自哪个源（对应 UnifiedSource.id） */
  sourceId: string;
  /** 所属消费端类型（聚合时过滤用） */
  kind: SourceKind;
  /** 标题 */
  title: string;
  /** 副标题 / 原文标题 / 日文名等（可选） */
  subtitle?: string;
  /** 封面图 URL（可选，IPTV/电台可能没有） */
  coverUrl?: string;
  /** 作者 / 主演 / 主播 / 艺术家 */
  authors?: string[];
  /** 标签 / 分类 / 流派 */
  categories?: string[];
  /** 简介 */
  summary?: string;
  /** 语言 */
  lang?: string;
  /** 源内评分 0..10（若有） */
  rating?: number;
  /** 最近更新时间 ISO 字符串 */
  updatedAt?: string;
  /** 完成状态 */
  status?: 'ongoing' | 'completed' | 'hiatus' | 'unknown';
}

/* -------- 书籍 -------- */
export interface BookItem extends BaseContentItem {
  kind: 'book';
  /** 字数（若源提供） */
  wordCount?: number;
  /** 卷数（可选） */
  volumes?: number;
  /** 最近更新的章节名 */
  latestChapterName?: string;
}

/* -------- 影视 -------- */
export type VideoRegion = 'mainland' | 'hongkong' | 'taiwan' | 'us' | 'eu' | 'jp' | 'kr' | 'other';
export interface VideoItem extends BaseContentItem {
  kind: 'video';
  /** 年份 */
  year?: number;
  /** 地区 */
  region?: VideoRegion | (string & {});
  /** 导演 */
  directors?: string[];
  /** 演员 */
  actors?: string[];
  /** 总集数 / 已更新集数 */
  totalEpisodes?: number;
  latestEpisode?: number;
  /** 备注，如"1080P 高清/粤语/4K" */
  qualityNote?: string;
}

/* -------- 漫画 -------- */
export interface ComicItem extends BaseContentItem {
  kind: 'comic';
  /** 话数 */
  totalChapters?: number;
  latestChapterName?: string;
}

/* -------- 音乐 -------- */
export interface MusicItem extends BaseContentItem {
  kind: 'music';
  /** 专辑名 */
  album?: string;
  /** 时长秒 */
  durationSec?: number;
}

/* -------- 电台 / 直播频道 -------- */
export interface RadioChannel extends BaseContentItem {
  kind: 'radio';
  /** 直播源（m3u8 或 ts 直链） */
  directUrls?: string[];
  /** 频道呼号 */
  callSign?: string;
  /** 所属台组（CCTV、卫视、地方台…） */
  genre?: string;
  /** EPG（电子节目单）URL（xmltv 等格式） */
  epgUrl?: string;
}

/** 发现页聚合结果的分类 */
export interface ExploreCategory {
  /** 分类 ID（源内唯一） */
  id: string;
  /** 展示名 */
  label: string;
  /** 父分类（树形结构） */
  parentId?: string;
  /** 是否可选（多选 / 单选）*/
  selectable?: boolean;
}

/** 发现页的一页结果 */
export interface ExplorePage {
  category: ExploreCategory;
  items: Array<BaseContentItem>;
  /** 下一页锚点（字符串 ID / 数字页码）；undefined 代表最后一页 */
  nextPageCursor?: string | number;
}

/* -------- 目录 -------- */
/** 一个分组（"第 1 卷"、"高清线路"、"粤语区"…）*/
export interface ChapterGroup {
  id: string;
  name: string;
  /** 该分组下的章节（或视频的线路下的剧集） */
  chapters: Chapter[];
  /** 视频场景：本分组所属线路 ID（与解析接口 1:1） */
  lineId?: string;
  /** 视频场景：线路解析接口标识（json:///jiexi:///drpy:///…）*/
  resolver?: string;
}

/** 一个章节 / 一集 */
export interface Chapter {
  /** 全局唯一 ID */
  id: string;
  /** 原生 ID（源内） */
  nativeId: string;
  /** 显示名（第 108 章 / E24） */
  name: string;
  /** 序号（用于排序/跳过；可选，源没有时用数组下标） */
  index?: number;
  /** 可选：封面 / 预览图（视频/漫画常见）*/
  thumbnailUrl?: string;
  /** 可选：章节更新时间 */
  updatedAt?: string;
  /** 可选：锁定状态 / VIP 付费 */
  locked?: boolean;
  paywall?: boolean;
  /** 可选：时长秒（视频） */
  durationSec?: number;
}

/** 目录 TOC 顶层 */
export interface TableOfContents {
  itemId: string;       // 所属内容条目 ID
  sourceId: string;     // 所属源 ID
  groups: ChapterGroup[];
  /** 总计章节数（聚合时显示） */
  totalChapters: number;
  /** 总集数（视频可选） */
  totalEpisodes?: number;
}

/* -------- 正文 / 播放源 / 图列表 -------- */
/** 正文（阅读）*/
export interface TextContent {
  chapterId: string;
  sourceId: string;
  /** 章节标题（渲染时可覆盖 TOC 里的名） */
  title: string;
  /** 纯正文段落（不含标题） */
  paragraphs: string[];
  /** 下一章锚点；undefined=最后一章 */
  nextChapterId?: string;
  /** 上一章锚点 */
  prevChapterId?: string;
  /** 正文抓取耗时（换源参考） */
  fetchMs?: number;
}

/** 漫画图列 */
export interface ImageListContent {
  chapterId: string;
  sourceId: string;
  title?: string;
  images: Array<{
    /** 原图 URL（高清） */
    url: string;
    /** 可选：备用镜像 URL */
    mirrors?: string[];
    /** 可选：字节长度（用于进度条） */
    sizeBytes?: number;
  }>;
  nextChapterId?: string;
  prevChapterId?: string;
}

/** 视频播放源 */
export interface PlaySource {
  /** 线路 ID（影视线路 1/2/3…）*/
  lineId: string;
  lineName?: string;
  /** 解析接口类型；前端播放器据此选择 ArtPlayer/hls/dash/原生 */
  type: 'hls' | 'dash' | 'mp4' | 'm3u8' | 'flv' | 'torrent' | 'iframe' | 'drpy' | 'custom';
  /** 最终直链 URL；若 type=drpy/custom 可能是脚本片段，交给 engine-js */
  url: string;
  /** 可选：嗅探日志（Web 端调试点） */
  sniffLog?: string[];
  /** 可选：附加的 headers（防盗链场景） */
  headers?: Record<string, string>;
}

/** 音乐播放源 */
export interface MusicSource {
  type: 'flac' | 'ape' | 'mp3' | 'aac' | 'ogg' | 'wav' | 'm4a';
  url: string;
  bitrateKbps?: number;
  sizeBytes?: number;
  lyricsLrc?: string;
}

/** 聚合后的条目（多个源的同一本书/剧，靠「相似归并算法」合在一起） */
export interface AggregatedItem {
  /** 聚合主键（标题+作者模糊后的 hash）*/
  key: string;
  /** 主条目展示字段（取最优源的最佳值） */
  display: BaseContentItem;
  /** 各源具体条目（同一内容在不同源中的版本） */
  variants: Array<{
    sourceId: string;
    sourceName: string;
    item: BaseContentItem;
    healthScore: number;
  }>;
  /** 源的个数（前端展示"10 个源"角标） */
  variantCount: number;
  /** 推荐源 ID（健康分 + 延迟排序后取第一） */
  recommendedSourceId?: string;
}
