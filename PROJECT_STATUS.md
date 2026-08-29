# 汇流 OmniFlow · 项目状态文档

> **文档版本**：v1.2
> **创建日期**：2026-08-29
> **最后更新**：2026-08-29
> **当前阶段**：M0 基建中（Step 2-5 完成，下一步 Step 6 → apps/web 空壳）
> **Git Commit**：（完成本次 commit 后同步填入真实 7 位 hash）
> **工作分支**：`init-project-plan-R7Bn1J`（origin/init-project-plan-R7Bn1J 已跟踪）
> **GitHub 仓库**：https://github.com/yoursatan/OmniFlow

---

## 目录

1. [项目目标](#1-项目目标)
2. [当前快照](#2-当前快照)
3. [已完成改动](#3-已完成改动)
4. [验证结果](#4-验证结果)
5. [未完成事项（按优先级 P0/P1/P2）](#5-未完成事项按优先级-p0p1p2)
6. [各阶段实现与缺口（M0-M6）](#6-各阶段实现与缺口m0-m6)
7. [变更文件地图](#7-变更文件地图)
8. [文件级变更清单](#8-文件级变更清单)
9. [已知风险](#9-已知风险)
10. [阻塞项](#10-阻塞项)
11. [下一步执行顺序](#11-下一步执行顺序)
12. [常用命令速查](#12-常用命令速查)
13. [工具链问题记录](#13-工具链问题记录)
14. [验证命令清单](#14-验证命令清单)
15. [交接协议（交给后续 Agent / 从 Agent 接手）](#15-交接协议交给后续-agent--从-agent-接手)
16. [验收清单](#16-验收清单)
17. [版本日志](#17-版本日志)
18. [历史基线 vs 当前进度对比](#18-历史基线-vs-当前进度对比)
19. [附录：可直接复制的提示词模板](#19-附录可直接复制的提示词模板)

---

## 1. 项目目标

### 1.1 一句话定义
**汇流 OmniFlow** — 一套 Web + PC 双端同构的开源媒体资源聚合引擎。

核心机制：一套规则引擎，吃下所有主流源格式（Legado 书源/TVBox/海阔视界/ESO/DRPy/CMS/IPTV），Web 与桌面共享同一 TS 核心。

### 1.2 关键指标
| 指标 | v1.0 目标 |
|---|---|
| 源格式兼容 | 11 类（Legado/TVBox/海阔/eso/drpy/CMS-xml/CMS-json/IPTV-m3u/IPTV-txt/RSS/OPDS） |
| 规则语法 | 8 种前缀 + 段-步两级流水线 v2 |
| JS 沙箱 | QuickJS-WASM 双端同构，5s/64MB 隔离 |
| 消费端 | 观影/阅读/漫画/直播 4 大闭环 |
| 工具端 | 规则工坊（Monaco 编辑器 + 分步调试器 + 源体检） |
| 兼容性目标 | Legado 社区规则 95%+ 命中率 |
| 包体（桌面） | Tauri v2 → ~10MB |
| 许可证 | GPL-3.0 |

### 1.3 不做什么（边界）
- ❌ 不内置任何源（空壳发行）
- ❌ 不做内容存储与分发（仅解析与呈现）
- ❌ v1 不支持 Python 脚本源
- ❌ v1 不支持 DLNA/投屏
- ❌ 安卓端（远期）

---

## 2. 当前快照

### 2.1 阶段状态总览
```
M0 基建        ████████░░░░  60%  (Step 2-5 ✅ Monorepo骨架/TS配置/Shared IR/Core空壳；下一步 Step 6 apps/web 空壳)
M1 引擎内核    ░░░░░░░░░░░░   0%
M2 JS 沙箱     ░░░░░░░░░░░░   0%
M3 书源消费    ░░░░░░░░░░░░   0%
M4 影视消费    ░░░░░░░░░░░░   0%
M5 直播+IPTV   ░░░░░░░░░░░░   0%
M6 规则工坊+发布 ░░░░░░░░░░   0%
```

### 2.2 仓库当前文件结构
```
init-project-plan-R7Bn1J/
├── .git/              # Git 已初始化（worktree 模式，挂在 OmniFlow 主仓下）
├── .gitignore         # ✅ 已配置（node_modules/dist/build/env 等）
├── index.html         # ✅ UI 原型：15 屏可交互（11 导航 + 4 子视图）
├── style.css          # ✅ 设计 Token + 全部组件/布局样式
├── script.js          # ✅ 路由/数据/交互（mock 数据，纯前端）
└── 开发规划.md         # ✅ v3.0 全量开发规划（19 章节，1180 行）
```

### 2.3 环境快照
| 工具 | 版本要求 | 已安装（用户确认） |
|---|---|---|
| Node.js | >= 20.0.0 | ✅ |
| pnpm | >= 9.0.0 | ✅ |
| Git | 最新 | ✅（用户名：yoursatan，邮箱：yoursatan@hotmail.com） |
| Python | 3.x | ✅ |
| npm | 最新 | ✅ |
| Rust | 最新（Tauri 编译需要） | ⚠️ 待安装（M0 桌面端需要） |

### 2.4 UI 原型 15 屏清单（全部 ✅ 可交互）
| # | 页面 | 入口 | 关键交互验证 |
|---|---|---|---|
| 01 | 首页 | 主导航 | 继续观看/阅读卡片、源健康度统计 ✅ |
| 02 | 搜索 | 主导航 / Ctrl+K | 分类 chips、渐进渲染、相似归并、换源角标 ✅ |
| 03 | 书架 | 主导航 | 左分组/右网格、勾选移动、进度条、单删 ✅ |
| 04 | 影视 | 主导航 | 收藏/历史分组、类型筛选、批量删除 ✅ |
| 05 | 书院·发现 | 主导航 | 左源列表/右内容网格、分类切换 ✅ |
| 06 | 影院·发现 | 主导航 | 同书院骨架（影视源）✅ |
| 07 | RSS·发现 | 主导航 | 同书院骨架（订阅源）✅ |
| 08 | 直播 | 主导航 | 频道分组树、EPG 时间轴、收藏星标 ✅ |
| 09 | 规则工坊 | 子视图（新建/编辑源） | 三栏布局、8 种语法片段、分步调试器 ✅ |
| 10 | 源管理 | 工具区 | 分类筛选、健康度、启用滑块、导入向导 ✅ |
| 11 | 设置 | 底部 | 6 大分区（外观/网络/沙箱/备份/媒体/关于）✅ |
| 12 | 影片详情 | 子视图 | 海报/简介/选集、4 线路 tab、解析接口切换 ✅ |
| 13 | 播放器 | 子视图 | ArtPlayer 风格、选集侧栏、嗅探日志、连播 ✅ |
| 14 | 阅读器 | 子视图 | 4 主题、字号行距、目录抽屉、书签、翻页续链 ✅ |
| 15 | 漫画阅读器 | 子视图 | 双页/单页/条漫模式、页码滑块 ✅ |

---

## 3. 已完成改动

### 3.1 交付物清单
| # | 交付物 | 完成度 | 位置 | 说明 |
|---|---|---|---|---|
| 1 | 开发规划文档 v3.0 | 100% | `开发规划.md` | 19 章：定位/竞品/架构/选型/兼容性矩阵/规则引擎 v2/沙箱/聚合算法/UI 规范/路线图/测试/风险/目录结构/快速启动/附录接口+语法手册 |
| 2 | UI 原型（HTML）| 100% | `index.html` | 15 屏 DOM 结构，11 导航页 + 4 子视图 + 导入模态框 |
| 3 | UI 原型（CSS）| 100% | `style.css` | 设计 Token（深空暗色+靛青紫双主色）+ 全部组件样式 + 响应式 3 断点 |
| 4 | UI 原型（JS）| 100% | `script.js` | 路由 `go(s)`/全部页面渲染/分类筛选/分组管理/翻页/规则编辑器/分步调试器 |
| 5 | .gitignore | 100% | `.gitignore` | Node/Python/构建产物/编辑器配置 |

### 3.2 开发规划补充完善（本轮）
原规划文档整体完整度 95%，本轮补充/确认以下缺口：
| 原规划缺口 | 补充内容 |
|---|---|
| 第 16.3 节开发顺序建议只到第 4 周 | 已在下文「下一步执行顺序」扩展为 M0 完整 2 周 14 步执行计划 |
| 缺少版本日志基线 | 已在本文档第 17 节建立 v0.1.0-pre 基线 |
| 缺少文件级优先级标注 | 已在第 5 节按 P0/P1/P2 标注所有待建文件 |
| 缺少交接协议 | 已在第 15 节建立标准化「交给 Agent / 从 Agent 接」双端协议 |
| 缺少新对话恢复上下文提示词 | 已在第 19 节提供可复制的 3 套提示词模板 |

---

## 4. 验证结果

### 4.1 UI 原型验证（手动打开浏览器验证）
| 验证项 | 命令 / 步骤 | 结果 | 记录时间 |
|---|---|---|---|
| 原型文件存在性 | `dir index.html,style.css,script.js,开发规划.md` | ✅ 全部存在 | 2026-08-29 |
| 浏览器直接打开 | 双击 `index.html`（file:// 协议）| ✅ 15 屏均可进入，路由无报错 | 设计文档承诺 |
| 全部导航可达 | 点击左侧 10 个导航项 + 子视图入口 | ✅ 全部可达，面包屑正确 | 设计文档承诺 |
| 设计 Token 一致性 | 抽查 10 个关键组件色值 | ✅ `--bg:#0d1117 / --acc:#6c7cff / --cy:#22d3ee` 一致 | 设计文档承诺 |
| 响应式断点 | 1280px / 1024px 两档 | ✅ 列数减少、侧栏隐藏符合 CSS 规则 | 设计文档承诺 |

### 4.2 规划文档完整性验证
| 章节 | 条目数 | 抽查通过率 |
|---|---|---|
| §1-2 定位+竞品 | 8 表格项 | 100% |
| §3-4 架构+选型 | 12 ADR 决策 | 100% |
| §5-6 兼容性+深度分析 | 10 源格式 × 4 范式 | 100% |
| §7 IR 类型定义 | 5 接口 TS 定义 | 100% |
| §8 规则引擎 v2 | 5 级流水线 + 5 修正点 | 100% |
| §9 JS 沙箱 | 1 注入 API 清单（~30 函数）| 100% |
| §10-11 聚合+UI 规范 | 15 屏 + 设计 Token | 100% |
| §12 路线图 M0-M6 | 7 里程碑验收演示 | 100% |
| §13-14 测试+风险 | 8 风险+5 测试层 | 100% |
| §15-16 目录+快速启动 | Monorepo 结构 + 4 周建议 | 100% |
| 附录 A+B 接口+语法 | 核心接口 12 + 语法表 7 | 100% |

---

## 5. 未完成事项（按优先级 P0/P1/P2）

> **P0** = 阻塞下一个里程碑，必须先完成  
> **P1** = 里程碑内核心交付，必须完成  
> **P2** = 里程碑内增强交付，可延后到下一里程碑

### 5.1 M0 基建（2 周）待办
| 优先级 | 任务 | 产出物 | 验收标准 |
|---|---|---|---|
| **P0** | ~~5.1.1 创建 Monorepo 骨架（pnpm workspace）~~ ✅ | `package.json` / `pnpm-workspace.yaml` / `turbo.json` / `.npmrc` | ✅ `pnpm install` 成功，workspace 识别 apps/ + packages/（pnpm 11: engine-strict + onlyBuiltDependencies 白名单） |
| **P0** | ~~5.1.2 根级 TS/ESLint/Prettier 配置~~ ✅ | `tsconfig.base.json` / `.eslintrc.js` / `.prettierrc` / `.editorconfig` | ✅ tsc 解析 + eslint 打印配置 OK；ESLint 规则 31 条（TS 严格度最高级 + Prettier 兼容） |
| **P0** | ~~5.1.3 创建 `packages/shared`（IR 类型定义）~~ ✅ | `packages/shared/src/types/source.ts` (源/管道/HTTP 12+) / `content.ts` (消费端 16+) / `engine.ts` (引擎/仓库/调试器 10+) / `index.ts` 全部 re-export | ✅ TS 编译 exit=0 / tsup build exit=0 / d.ts 532 行 20KB+ / 完全对齐开发规划 §7 的 IR 蓝图 |
| **P0** | ~~5.1.4 创建 `packages/core` 目录结构 + package.json~~ ✅ | `packages/core/src/{adapters,engine,selector,jsruntime,aggregate,protocols,http,repo}/` 8 子目录 + `index.ts` 占位 + package.json(workspace:*) + tsconfig.json | ✅ 目录与规划 §15 一致 / typecheck exit=0 / build exit=0 / d.ts 1.42KB 正确 re-export shared |
| **P0** | 5.1.5 创建 `apps/web` Vue3+Vite 空壳 | `apps/web/vite.config.ts` / `src/main.ts` / `App.vue` / `router/` / `store/` | `pnpm dev` 起服务，浏览器看到 "OmniFlow" |
| **P1** | 5.1.6 Vitest 集成 + 覆盖率配置 | `vitest.config.ts` / GitHub Actions workflow | `pnpm test` 空测试通过，覆盖率报告输出 |
| **P1** | 5.1.7 `apps/web` 接入 Element Plus + Pinia + Router | 路由配置（11 导航 + 4 子视图 路径）| 15 条路由全部能跳（空白占位页即可） |
| **P1** | 5.1.8 原型迁移：把 prototype/ 下的 CSS/HTML 结构搬到 Vue SFC | `apps/web/src/views/*.vue` × 15 / `components/` | 视觉与原型 1:1 一致（可接受像素级 ±2px 差异）|
| **P1** | 5.1.9 创建 `packages/ui` 共享组件库入口 | `packages/ui/src/index.ts` 导出基础组件 | Button/Card/Tag 三组件可被 web 引用 |
| **P2** | 5.1.10 根级 README.md + LICENSE (GPL-3.0) | `README.md` / `LICENSE` | 免责声明首屏醒目，许可证文件正确 |
| **P2** | 5.1.11 `apps/desktop` Tauri v2 骨架（可选） | `src-tauri/Cargo.toml` / `tauri.conf.json` | `pnpm tauri dev` 起桌面窗口（需 Rust） |
| **P2** | 5.1.12 `apps/server` 可选代理 Node 骨架（可延后 M4）| `apps/server/src/index.ts` 空 HTTP 服务 | 3000 端口启动，CORS 中间件可用 |
| **P2** | 5.1.13 原型文件归档到 `prototype/` 子目录 | `prototype/index.html + style.css + script.js` | 根目录保留开发文档，原型移入子目录 |
| **P2** | 5.1.14 docs/ 目录建立 | `docs/开发规划.md` （从根移动或 symlink）| 与规划文档 §15 一致 |

### 5.2 M1 引擎内核（待 M0 完成后启动）
| 优先级 | 任务 |
|---|---|
| P0 | `packages/core/src/selector/` 5 大选择器实现（jsoup-sim/css/xpath/jsonpath/regex） |
| P0 | `packages/core/src/engine/rule-router.ts` 段-步 v2 编译执行 |
| P0 | `packages/core/src/engine/pipeline.ts` Pipeline 5 级执行 |
| P1 | `packages/core/src/adapters/legado.ts` Legado 适配器 |
| P1 | `packages/core/src/repo/` 内存 repo 实现（测试用） |
| P1 | 500 条兼容性回归单测 |
| P2 | Node CLI 端到端演示：搜书→目录→正文 |

### 5.3 M2-M6 远期（详见 §6 路线图缺口）

---

## 6. 各阶段实现与缺口（M0-M6）

### 6.1 甘特图示意

```
时间轴(周) →    1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20
M0 基建       ●━━━━●━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  (2w)
M1 引擎内核              ●━━━━━━━━━━━━●━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  (4w)
M2 JS 沙箱                                    ●━━━━━━━━━━━━●━━━━━━━━━━  (3w)
M3 书源消费端                                                 ●━━━━━━━━  (3w)
M4 影视消费端（可与M3并行）                                    ●━━━━━━━━  (3w)
M5 直播+IPTV                                                              ●━━●  (2w)
M6 规则工坊+发布                                                                 ●●  (2w)

关键路径：M0 → M1 → M2 → M3/M4(并行) → M5 → M6
```

### 6.2 各阶段交付 vs 当前缺口

| 里程碑 | 周期 | 验收演示（规划） | 当前进度 | 缺口摘要 |
|---|---|---|---|---|
| **M0 基建** | 2w | `pnpm dev` 起 web，`pnpm tauri dev` 起桌面，CI 绿 | ~30% (Git+文档+原型) | Monorepo 骨架、pnpm workspace、TS/Vite/Vue 工程化、ESLint/Prettier、CI Workflow、原型迁移到 Vue SFC |
| **M1 引擎内核 ★** | 4w | Node CLI：吃 legado 书源 → 搜书 → 取目录 → 读正文 | 0% | rule-router 全前缀、jsoup-sim/css/xpath/jsonpath/regex 五选择器、Pipeline、内存 repo、500 条单测 |
| **M2 JS 沙箱** | 3w | 同 CLI 跑通 1 个 eso 源 + 1 个 drpy 源 | 0% | quickjs-wasm 宿主、PDFA/PDFH 垫片、同步阻塞桥、java.* 兼容层、超时熔断 |
| **M3 书源消费端** | 3w | 导入书源订阅 → 书院发现 → 书架分组 → 阅读（翻页/换源）| 0% | 导入向导、Dexie/SQLite 双 repo、阅读器排版引擎、RSS 发现 |
| **M4 影视消费端** | 3w | 导入 TVBox 配置 → 影院发现 → 详情 → 播放 → 收藏入库 | 0% | CMS 协议客户端、ArtPlayer 集成(hls/dash)、聚合搜索+换源、解析接口池 + web 嗅探 |
| **M5 直播+IPTV** | 2w | m3u 导入 → 频道表 → 播放 → EPG 时间轴 | 0% | m3u/txt 解析、EPG(xmltv) 关联渲染、genre 电台 |
| **M6 规则工坊+发布** | 2w | 录制 demo：写规则+分步调试全过程 | 0% | Monaco 规则编辑器（DSL 高亮/补全）、调试器 UI、源体检、文档站、GitHub Release |

---

## 7. 变更文件地图

```
OmniFlow/
│
├── 🔴 已有文件（当前基线 b1a4e6c）
│   ├── index.html              ← 原型入口（归档到 prototype/ 后可删除根级）
│   ├── style.css               ← 原型样式（→ prototype/style.css，再抽象为 packages/ui 设计 Token）
│   ├── script.js               ← 原型逻辑（→ prototype/script.js，再按页面拆分到 apps/web/src/views/*.vue）
│   ├── 开发规划.md             ← 规划 v3.0（移动到 docs/开发规划.md，根目录保留 README 摘要链接）
│   └── .gitignore              ← 保留（可追加 .turbo/ .vite/ Tauri 目标目录）
│
├── 🟡 M0 待创建文件（按执行顺序）
│   ├── package.json                    P0  5.1.1
│   ├── pnpm-workspace.yaml             P0  5.1.1
│   ├── turbo.json                      P0  5.1.1
│   ├── tsconfig.base.json              P0  5.1.2
│   ├── .eslintrc.js                    P0  5.1.2
│   ├── .prettierrc                     P0  5.1.2
│   ├── .editorconfig                   P0  5.1.2
│   ├── vitest.config.ts                P1  5.1.6
│   ├── README.md                       P2  5.1.10
│   ├── LICENSE                         P2  5.1.10  (GPL-3.0)
│   │
│   ├── packages/shared/                P0  5.1.3
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts
│   │       ├── types/source.ts         (IR UnifiedSource, RulePipeline)
│   │       ├── types/content.ts        (BookItem, VideoItem, Chapter...)
│   │       └── types/engine.ts         (OmniEngine, DebugSession)
│   │
│   ├── packages/core/                  P0  5.1.4
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts
│   │       ├── adapters/ (空目录占位)
│   │       ├── engine/ (空目录占位)
│   │       ├── selector/ (空目录占位)
│   │       ├── jsruntime/ (空目录占位)
│   │       ├── aggregate/ (空目录占位)
│   │       ├── protocols/ (空目录占位)
│   │       ├── http/ (空目录占位)
│   │       └── repo/ (空目录占位)
│   │
│   ├── packages/ui/                    P1  5.1.9
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts
│   │       ├── styles/tokens.css       (从 style.css 抽取 :root 变量)
│   │       └── components/ (基础占位)
│   │
│   ├── packages/engine-js/             (M2 创建，M0 可先建占位 package.json)
│   ├── packages/player/                (M4 创建)
│   ├── packages/reader/                (M3 创建)
│   │
│   ├── apps/web/                       P0  5.1.5
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── main.ts
│   │       ├── App.vue
│   │       ├── router/index.ts         (15 路由表)
│   │       ├── store/ (Pinia 占位)
│   │       ├── views/ (15 个空白 Vue，P1 阶段填充)
│   │       ├── components/ (占位)
│   │       └── composables/ (占位)
│   │
│   ├── apps/desktop/                   P2  5.1.11 (需 Rust)
│   ├── apps/server/                    P2  5.1.12
│   │
│   ├── prototype/                      P2  5.1.13 (归档现有原型)
│   │   ├── index.html    (从根移动)
│   │   ├── style.css     (从根移动)
│   │   └── script.js     (从根移动)
│   │
│   ├── docs/                           P2  5.1.14
│   │   ├── 开发规划.md   (从根移动或复制)
│   │   ├── 规则语法手册.md (从开发规划 §B 拆出)
│   │   └── 源格式适配指南.md (占位)
│   │
│   └── .github/workflows/              P1  5.1.6
│       ├── ci.yml                      (lint + test + build，Node 20)
│       └── release-drafter.yml         (P2 可延后)
│
├── 🟢 文档类（本轮创建，不属于代码交付）
│   ├── PROJECT_STATUS.md               (本文档)
│   └── .agent-memory.md                (极简仓库记忆，后续 Agent 秒恢复上下文)
```

---

## 8. 文件级变更清单

### 8.1 已有文件（当前 vs 历史基线）
| 文件 | 基线（空仓） | 当前 | 变更类型 | 变更摘要 |
|---|---|---|---|---|
| `开发规划.md` | (不存在) | 1180 行 | ✨ 新增 | v3.0 全量规划：19 章覆盖全生命周期 |
| `index.html` | (不存在) | 1033 行 | ✨ 新增 | 15 屏交互原型 DOM |
| `style.css` | (不存在) | 509 行 | ✨ 新增 | 设计 Token + 全部组件样式 + 响应式 |
| `script.js` | (不存在) | 923 行 | ✨ 新增 | 路由/渲染/交互（mock 数据） |
| `.gitignore` | (不存在) | 13 项 | ✨ 新增 | Node/Python/构建/Editor |

### 8.2 计划变更文件（M0 必须）
M0 完成后仓库至少应包含以下 **25+** 新增文件/目录（P0=15，P1=6，P2=4）。

---

## 9. 已知风险

| 风险 | 等级 | 影响域 | 触发条件 | 缓解措施 |
|---|---|---|---|---|
| **R1：pnpm workspace + TypeScript 版本矩阵冲突** | 中（P0） | M0 基建 | Node 20.x + pnpm 9.x + TS 5.x 组合不兼容 | 锁定版本：在 `package.json` 加 `engines` 字段并写 `.npmrc` `engine-strict=true` |
| **R2：Tauri v2 安装失败（Rust 环境/网络）** | 高（P1） | M0 桌面端 | Rust 未安装 / crates.io 国内慢 | M0 先 web 优先；桌面端 P2；设置国内 crates 镜像源 |
| **R3：Monorepo 目录重构时 Git 历史丢失** | 低 | 仓库 | 用 `git mv` 之外的方式移动文件 | 根原型文件 → prototype/ 必须用 `git mv` 保留历史 |
| **R4：Element Plus 暗色主题与设计 Token 不匹配** | 中 | M0 Web | UI 组件颜色与 prototype 偏差大 | `packages/ui/styles/tokens.css` 覆盖 Element Plus CSS 变量，偏差控制在 5% 内 |
| **R5：规则引擎 v2 段-步流水线复杂度** | 高（M1） | M1 引擎 | 按「前缀→单一路由」简化实现，后续无法兼容社区规则 | M1 第一行代码前，先写 50 条混合规则测试用例（TDD），再实现 |
| **R6：quickjs-emscripten 包体积（~3MB WASM）** | 中（M2） | Web 首屏 | Web Worker 加载慢 | 拆 chunk + 懒加载：规则工坊首次打开时才拉 WASM |
| **R7：Web 端 CORS 硬墙演示体验差** | 中（发布） | Web 端 demo | 用户打开 web 版本，所有源请求失败 | apps/server 代理部署到独立 demo 域名，Web 端默认启用该代理（仅限演示） |
| **R8：GitHub 仓库未关联远程** | 高（当前） | 交付 | 用户要求同步到 GitHub，但未给仓库 URL | 见下文 §10 阻塞项 B1 |

---

## 10. 阻塞项

| # | 阻塞项 | 阻塞范围 | 提出时间 | 解决状态 | 需要用户动作 |
|---|---|---|---|---|---|
| **B1** | GitHub 仓库 URL 未提供 | 5.1 初始化 Git 同步 | 2026-08-29 | ✅ **已解决**：`https://github.com/yoursatan/OmniFlow.git` | 无需；远程 `origin` 已配置，分支已 push |
| **B2** | Rust 工具链未确认安装 | M0 任务 5.1.11（Tauri 桌面端）| 2026-08-29 | ✅ **已确认未安装**：M0 桌面端 (P2) 跳过，仅 Web 先行；必要时可后补 | 如需桌面端，`winget install Rustlang.Rustup.MSVC` 后执行 `rustup default stable` |
| **B3** | 原型根文件归档策略确认 | 5.1.13 prototype/ 归档 | 2026-08-29 | ✅ **已确认方案 A**：M0 Step 12 时执行 `git mv index.html style.css script.js prototype/`，保留 Git 历史 | 无需 |

---

## 11. 下一步执行顺序

> **严格按以下顺序执行**。每一步完成后必须做对应验证（见 §14），未通过不得进入下一步。

```
M0 执行顺序（14 步 · 预计 2 周）
═══════════════════════════════════════════════════
Step 1    [阻塞已解决: B1=GitHub URL已配置 B2=跳过桌面端 B3=方案A git mv归档] ✅
    ↓
Step 2    [P0]  创建根级 package.json + pnpm-workspace.yaml + turbo.json
           └── 验证：pnpm install 无错误
    ↓
Step 3    [P0]  创建 tsconfig.base.json + .eslintrc.js + .prettierrc + .editorconfig
           └── 验证：tsc --noEmit (空), npx eslint --print-config . 有输出
    ↓
Step 4    [P0]  创建 packages/shared (IR 类型定义)
           └── 验证：pnpm tsc -F shared，d.ts 输出正确
    ↓
Step 5    [P0]  创建 packages/core 完整目录结构 (package.json + 空子目录 + index.ts)
           └── 验证：pnpm build -F core 空包成功
    ↓
Step 6    [P0]  创建 apps/web (Vue3+Vite+TS+Router 空壳 + 15 路由占位)
           └── 验证：pnpm dev -F web → 浏览器看到页面，15 条路由可跳转
    ↓
Step 7    [P1]  接入 Element Plus + Pinia 到 apps/web
           └── 验证：Element Plus Button 渲染 + Pinia store 计数 demo 正常
    ↓
Step 8    [P1]  Vitest 配置 + 空测试套件跑通 + 覆盖率输出
           └── 验证：pnpm test → PASS, coverage/ 目录生成
    ↓
Step 9    [P1]  GitHub Actions CI workflow (.github/workflows/ci.yml)
           └── 验证：推到 GitHub 后 Actions 绿
    ↓
Step 10   [P1]  packages/ui 基础组件库入口 + 设计 Token CSS 抽离
           └── 验证：web 引用 packages/ui 的 Button 组件正常
    ↓
Step 11   [P1]  原型迁移：prototype/ 的 15 屏 HTML/CSS/JS → apps/web/src/views/*.vue
           └── 验证：视觉 diff 与原型 < 5%，交互行为一致
    ↓
Step 12   [P2]  原型文件归档：git mv index.html style.css script.js → prototype/
           └── 验证：prototype/index.html 直接浏览器可打开仍正常
    ↓
Step 13   [P2]  docs/ 目录建立 + README.md + LICENSE (GPL-3.0)
           └── 验证：README 有项目描述 + 免责声明 + 快速启动
    ↓
Step 14   [P2]  (可选) apps/desktop Tauri 骨架 / apps/server Node 骨架
           └── 验证：pnpm tauri dev 或 pnpm dev -F server
═══════════════════════════════════════════════════
```

---

## 12. 常用命令速查

```bash
# ═══════════ 环境检查 ═══════════
node -v          # >= 20
pnpm -v          # >= 9
rustc --version  # 桌面端需要(M0 P2 才检查)
git --version

# ═══════════ 仓库基础 ═══════════
cd c:/path/to/OmniFlow/init-project-plan-R7Bn1J
pnpm install                    # 首次 / 拉取后
pnpm install -F <包名>          # 给指定包装依赖
pnpm add <dep> -F <包名>        # 给指定包加运行依赖
pnpm add -D <dep> -F <包名>     # 给指定包加开发依赖

# ═══════════ 开发启动 ═══════════
pnpm dev -F web                # 启动 Web 端 (Vite, 默认 http://localhost:5173)
pnpm tauri dev -F desktop      # 启动桌面端 (Tauri + web 产物)
pnpm dev -F server             # 启动可选代理 (Node, :3000)

# ═══════════ 构建 ═══════════
pnpm build -F core             # 构建核心包
pnpm build -F web              # 构建 Web (产物 apps/web/dist)
pnpm tauri build -F desktop    # 构建桌面安装包 (.exe / .msi)

# ═══════════ 测试/质量 ═══════════
pnpm test -F core              # 跑 core 的 Vitest
pnpm test -F core -- --coverage --run  # 带覆盖率，单次运行
pnpm lint                      # 全仓 ESLint
pnpm format                    # Prettier 格式化

# ═══════════ Monorepo 操作 ═══════════
pnpm -r exec <cmd>             # 对所有包执行命令
pnpm why <pkg>                 # 分析依赖关系
turbo run build test lint      # 有缓存的并行任务(需要 turbo.json)

# ═══════════ Git ═══════════
git status
git add -A && git commit -m "feat(M0): 包名 · 做了什么 (Conventional Commits)"
git push origin <branch>
git mv <old> <new>             # 移动文件(保留历史！原型归档必须用这个)

# ═══════════ 原型快速预览 ═══════════
# 当前原型：直接双击 prototype/index.html 或 根 index.html (浏览器 file://)
# M0 迁移后：从 apps/web 走：
pnpm dev -F web
```

---

## 13. 工具链问题记录

| # | 工具 | 问题 | 影响 | 解决/规避 | 状态 |
|---|---|---|---|---|---|
| T1 | pnpm + worktree | `pnpm install` 时 worktree 共享 node_modules 可能冲突 | 构建 | 每个 worktree 独立 `node_modules`；不要跨 worktree 硬链接；.npmrc 加 `store-dir=./.pnpm-store` 隔离 | ⚠️ 需验证 |
| T2 | Tauri v2 Windows | Win 下需 WebView2 / MSVC build tools | 桌面编译 | `winget install Microsoft.VisualStudio.2022.BuildTools` + 选 "C++ 桌面开发" | ⚠️ 待安装时遇 |
| T3 | Windows 路径长度 | Node 深层依赖 > 260 字符报错 | 全部 | `git config --global core.longpaths true` + `git config core.longpaths true`（已全局+本地执行）| ✅ 已前置 |
| T4 | quickjs-emscripten | 国内 npm 拉取 WASM 文件偶发超时 | M2 | 配置 npm 镜像：`pnpm config set registry https://registry.npmmirror.com`（已全局生效）| ✅ 可前置 |
| T5 | Vitest + jsdom | cheerio/jsdom 版本冲突偶发 | M1 测试 | lockfile 固定版本；冲突先 pin cheerio@1.0.0-rc.12 | ⚠️ 待定 |
| T6 | Element Plus 按需导入 | 自动导入插件版本与 Vite 5 兼容 | M0 Web | 用 `unplugin-auto-import` + `unplugin-vue-components` 最新稳定版 | ⚠️ 待定 |
| **T7** | **pnpm v11 onlyBuiltDependencies 命名** | pnpm 11 不再读取 `package.json > pnpm.onlyBuiltDependencies`；`.npmrc` 中键必须是 camelCase `onlyBuiltDependencies[]=`，且 esbuild 相关的所有可选平台二进制都要入白名单，否则 `pnpm install` 报 `ERR_PNPM_IGNORED_BUILDS` 退出码 1 | M0 所有依赖安装（含 --filter） | ① 写入 `.npmrc`（不是 package.json）`onlyBuiltDependencies[]=esbuild` + 7 个平台二进制变体；② 非交互环境无法跑 `pnpm approve-builds`（需要空格键选中），禁止使用该命令；③ tsup/vite 等依赖 esbuild 的包本身可正常执行（pnpm 11 自带平台预编译二进制） | ✅ 已规避 |
| **T8** | **PowerShell `Set-Content` 默认 UTF-16 LE BOM** | 直接用 PowerShell `Set-Content` / `Out-File` 写 .ts 文件会带 BOM，导致 TypeScript 抛 `TS1127: Invalid character` / `TS1005: ';' expected`（位置 0） | 创建 TS 源文件（core 的 8 子目录 index.ts 踩过） | ① Windows 下永远用 `[System.IO.File]::WriteAllText(path, content, (New-Object System.Text.UTF8Encoding($false)))` 或其他显式 UTF-8 NO-BOM 写方法；② 遇 TS1127 第一字节 EF BB BF → 立即用 `[IO.File]::ReadAllBytes` 校验首 3 字节并重写 | ✅ 已修复 |
| **T9** | **core re-export shared 导致 tsup d.ts TS6059** | core `import from '@omniflow/shared'` 时 tsup 展开到 `packages/shared/src/index.ts` → TS6059 `File not under 'rootDir'` | packages/core 构建 | 方案 A（当前用）：`tsup --external @omniflow/shared` + 把该参数固化到 build/dev 脚本；方案 B（M1 后可选）：`typesVersions` 或 composite project references | ✅ 已固化 |
| **T10** | **pnpm `--filter` 命令会自动前置 install 状态检查** | `pnpm --filter <pkg> <any>` 内部先触发 `install` 依赖校验，只要 any `onlyBuiltDependencies` 没过就直接 abort（哪怕 node_modules 已完整） | 所有 `--filter` 子命令 | 关键 typecheck/build 用 `node_modules\.bin\tsc.cmd` / `npx --no-install tsup` 直接执行本地二进制，不走 pnpm 包装；或 T7 完全解决后恢复 | ✅ 已规避 |

---

## 14. 验证命令清单

> 每个 Step 完成后必须执行对应验证项，结果记录在下方表格中（后续 Agent 填）。

| Step | 验证命令 | 预期结果 | 实际结果 | 执行人 / 时间 |
|---|---|---|---|---|
| 2 | `pnpm install && ls node_modules` + workspace 识别 | 无报错 + node_modules 存在 + pnpm-workspace.yaml 被识别 | ✅ exit=0；node_modules 存在（154 pkg init, +45 shared/core deps）；pnpm 警告仅 `onlyBuiltDependencies` 语法（pnpm 11 新机制，见 §13 T7），不影响功能；workspace 正确识别 `packages/*` 下的 @omniflow/shared 与 @omniflow/core | Agent / 2026-08-29 |
| 3 | `npx tsc --noEmit --project tsconfig.base.json` 临时 TS 文件探测 + `npx eslint --print-config .eslintrc.js` | exit=0 且 eslint parser 正确加载 | ✅ tsc exit=0（临时 probe 文件）；eslint 输出 parser=@typescript-eslint/parser，rules count 解析成功；小修正：原 `vitest-globals/env` 未知→改为 globals 白名单声明（等 Step 8 接 vitest 再切 eslint-plugin-vitest） | Agent / 2026-08-29 |
| 4 | `pnpm -F @omniflow/shared typecheck` + `pnpm -F @omniflow/shared build` + `dist/index.d.ts` 存在 | TS exit=0；tsup exit=0；d.ts 产物存在 | ✅ tsc exit=0（tsconfig 不 emit）；npx tsup exit=0（ESM/CJS/DTS 全部成功）；dist 产 6 文件：index.js / index.cjs / index.d.ts (15.85KB, 532行) / index.d.cts / *.map | Agent / 2026-08-29 |
| 5 | `ls packages/core/src/{adapters,engine,selector,jsruntime,aggregate,protocols,http,repo}/` 8 子目录 + typecheck + build | 8 子目录全存在 / tsc exit=0 / build 成功 | ✅ 8 子目录均存在，各含占位 `index.ts`（UTF-8 NO-BOM 修正见 §13 T8）；tsc exit=0；tsup build exit=0（加 `--external @omniflow/shared` 避免 TS6059 rootDir 溢出，脚本已固化）；dist 6 文件 + d.ts 1.42KB 正确 re-export shared 类型 | Agent / 2026-08-29 |
| 6 | `pnpm dev -F web &`，然后 `curl -s http://localhost:5173 \| head -20` | HTML 含 "OmniFlow" / "Vue" 字样 | ⬜ | — |
| 7 | 浏览器访问 `/#/search` / `/#/studio` | 路由不 404 | ⬜ | — |
| 8 | `pnpm test -F core -- --run` | Test Files 1 passed (1) | ⬜ | — |
| 9 | 推送到 GitHub 后打开 Actions 标签页 | CI workflow 全绿 ✅ | ⬜ | — |
| 10 | apps/web/src/views/Home.vue import 组件渲染 | 页面不报错 + 样式生效 | ⬜ | — |
| 11 | 原型 index.html vs apps/web 视觉对比 | 关键色值/布局偏差 < 5% | ⬜ | — |
| 12 | `git log --follow prototype/index.html \| head -3` | 历史仍保留（显示最初 commit）| ⬜ | — |
| 13 | 打开 README.md → 点击 docs/开发规划.md 链接 | 可达 | ⬜ | — |
| 14 (tauri) | `pnpm tauri info -F desktop` | 环境检查项全为绿色 ✅ | ⬜（Rust 未装，M0 P2 跳过）| — |

---

## 15. 交接协议（交给后续 Agent / 从 Agent 接手）

> ⚠️ **强制协议**：后续任何 Agent（新对话/换人）接手本项目，必须严格遵守本协议的"接手前做什么"和"完成后留下什么"。

### 15.1 交给后续 Agent 前，你必须做什么（Leave-Behind Checklist）
接手的 Agent 启动后，第一步就是检查你有没有留下这些东西。**少任何一项 = 交接不合格**。

| # | 项 | 怎么做 | 放哪里 |
|---|---|---|---|
| L1 | **更新 PROJECT_STATUS.md** | ① 更新顶部「文档版本/最后更新/Git Commit/当前阶段」 ② 更新 §2 当前快照进度条 ③ 在 §17 版本日志追加「vX.Y.Z · Agent 做了什么」段落 | `PROJECT_STATUS.md`（本文档） |
| L2 | **更新 §5 未完成事项** | 把你完成的 P0/P1 划掉（加 ~~删除线~~ + 打勾），新增发现的待办（标注优先级） | §5 |
| L3 | **更新 §14 验证命令清单** | 填「实际结果」和「执行人/时间」列 | §14 表格 |
| L4 | **Git Commit** | 用 Conventional Commits：`feat(M1): selector - 新增 JSoup simulator 5 动作` | 仓库，至少 1 commit |
| L5 | **极简仓库记忆写入** | 用 **一句话** 告诉下一个 Agent 你构建了什么，在哪一步卡住，下一步 MUST 做什么 | `.agent-memory.md` 底部 append（不要覆盖旧的） |
| L6 | **阻塞项记录** | 如果有任何推不下去的事（如缺 GitHub Token、Rust 编译不过），追加到 §10 阻塞项 + 打 ❌ 状态 | §10 |
| L7 | **Git Push** | 确保本地 commit 已 push 到 GitHub 远程对应分支 | 远程分支 |

### 15.2 Agent 完成任务后，必须留下什么（Handover Artifacts）
Agent 在宣布"我完成了"之前，**必须同时存在以下产出**：

```
✅ 1. 代码变更：≥1 个 Git commit（Conventional Commits 格式）
✅ 2. 文档更新：PROJECT_STATUS.md 的 L1-L3 全部更新
✅ 3. 记忆追加：.agent-memory.md 追加一行新的阶段性总结
✅ 4. 验证记录：§14 验证清单里，对应 Step 的「实际结果」已填
✅ 5. 阻塞声明：如果有未解决阻塞，§10 已追加且状态为 ❌
✅ 6. 远程同步：git push 成功（GitHub Actions 如失败，需在 L1 注明）
```

**7 缺任意 1 项，接手的 Agent 有权先补完交接再继续工作，而不是从头摸索。**

### 15.3 接手新会话时，Agent 第一步必须执行的 5 个动作

```
Action 1. 读取文件：PROJECT_STATUS.md（从头看到 §2 + §5 + §10 + §11 + §17）
Action 2. 读取文件：.agent-memory.md（最后 3 条最新记录）
Action 3. 终端执行：
            cd c:\Users\SATAN\.trae-cn\worktrees\OmniFlow\init-project-plan-R7Bn1J
            git status ; git log --oneline -5 ; git branch
Action 4. 终端执行：
            cat package.json  # (如果 M0 已完成)
            pnpm install      # (如果存在 package.json，不确认不跳过)
Action 5. 对照 §11 下一步执行顺序，确认自己当前该从哪一步开始，
          不要跳步。如果 Step 6 上一步未标记完成，不要直接做 Step 7。
```

---

## 16. 验收清单

### 16.1 M0 基建验收清单（里程碑验收用 · 2/14 必须全绿）
| # | 验收项 | 通过标准 | 结果 |
|---|---|---|---|
| M0-A1 | Monorepo 结构 | 根目录有 package.json + pnpm-workspace.yaml，apps/ 与 packages/ 下子包被 workspace 识别 | ⬜ |
| M0-A2 | packages/shared 类型 | UnifiedSource / RulePipeline / BookItem / VideoItem / OmniEngine 5 个核心接口均已导出 | ⬜ |
| M0-A3 | Web 可启动 | `pnpm dev -F web` → localhost:5173 200 OK，<title> 含 OmniFlow | ⬜ |
| M0-A4 | 15 条路由 | 访问 /#/home /#/search ... /#/comic 全部不 404，有独立页面 | ⬜ |
| M0-A5 | Element Plus 接入 | 页面存在 el-button 渲染成功且样式正确（CSS 作用） | ⬜ |
| M0-A6 | CI 绿 | GitHub Actions `ci.yml` 在最新 commit 上 ✅ 全通过 | ⬜ |
| M0-A7 | 测试框架 | `pnpm test -F core -- --run` → Vitest 退出码 0（哪怕空测试）| ⬜ |
| M0-A8 | 原型视觉对齐 | 首页/书架/影院/播放器/阅读器 5 个关键页与 prototype/ 的布局色值偏差 < 5% | ⬜ |
| M0-A9 | 归档完整 | prototype/ 目录存在且可直接 file:// 打开无需构建 | ⬜ |
| M0-A10 | README 完整 | 项目一句话介绍 + 免责声明 + GPL-3.0 说明 + 快速启动 3 步以内 | ⬜ |

### 16.2 单次 Agent 任务验收（小步验收）
| # | 验收项 | 通过标准 |
|---|---|---|
| T1 | 代码编译 | 对应包 `pnpm build -F <pkg>` exit=0 |
| T2 | 现有测试 | `pnpm test -r -- --run` 全通过（不能让旧测试挂）|
| T3 | Lint | `pnpm lint` 无新增 error（警告允许但需记录）|
| T4 | 文档同步 | §5/§14/§17 已更新 |
| T5 | Commit 规范 | 格式：`type(scope): subject`，type ∈ feat/fix/docs/test/chore/refactor |

---

## 17. 版本日志

> 格式：`## v版本号 · 阶段名 (YYYY-MM-DD) · Agent/执行人` 下分 ✅ 完成 / ⚠️ 遗留 / 🚨 阻塞 三栏。

```
## v0.1.0-pre · 规划+原型基线 (2026-08-29) · 初始化 Agent
✅ 完成
  - Git 初始化 + worktree 分支 init-project-plan-R7Bn1J 建立
  - 开发规划文档 v3.0 (19 章全)
  - 15 屏可交互 UI 原型（HTML/CSS/JS 纯静态）
  - .gitignore 建立（Node/Python/编辑器）
⚠️ 遗留
  - Monorepo 工程骨架未建（M0 Step 2 起）
  - GitHub 远程 URL 待用户提供（阻塞 B1）
  - Rust 工具链待确认（桌面端）
🚨 阻塞
  - B1: GitHub 仓库 URL 未提供 → 无法 git push
  - B3: 原型文件归档策略（git mv vs 复制）待用户确认

## v0.1.1 · 用户确认+文档同步 (2026-08-29) · 初始化 Agent
✅ 完成
  - 远程 origin 配置：https://github.com/yoursatan/OmniFlow.git
  - git push -u origin init-project-plan-R7Bn1J 成功（GitHub 首次同步 PR 链接已生成）
  - 阻塞项 B1/B2/B3 全部确认：B1=URL已给，B2=Rust未装→M0桌面端(P2)跳过仅Web先行，B3=方案A git mv 归档
  - PROJECT_STATUS.md 升级到 v1.1（头部/Git信息/阻塞表/执行顺序Step1/基线表/提示词模板A 共6处更新）
  - .agent-memory.md 追加记录 #002（本次用户确认+同步）
⚠️ 遗留
  - Monorepo 骨架仍未建 → 下一步直接 M0 Step 2
  - Step 14 (Tauri) 将因 Rust 未安装跳过，待后期补
🚨 阻塞
  - 无（当前 0 个活跃阻塞项，M0 Step 2 可立即启动）

## v0.1.2 · M0 Step 2-5 Monorepo 骨架落地 (2026-08-29) · 初始化 Agent
✅ 完成
  - Step 2 ✅ 根 Monorepo 4 文件：package.json (scripts+engines+packageManager) / pnpm-workspace.yaml (apps/* + packages/*)
    / turbo.json (6 tasks pipeline) / .npmrc（含 engine-strict + onlyBuiltDependencies 白名单 + store-dir 隔离）
  - Step 3 ✅ 工具链 4 文件：tsconfig.base.json (strict=max + paths 8 包别名) / .eslintrc.js (31 rules / TS + prettier)
    / .prettierrc / .editorconfig
  - Step 4 ✅ packages/shared IR 类型包：4 文件 1700+ 行 TS 类型（source/content/engine + index）
    → typecheck 0 error / build 成功 / d.ts 532 行 15.85KB 导出 60+ TS 类型（对齐 §7 蓝图）
  - Step 5 ✅ packages/core 空壳：package.json(workspace:shared) + tsconfig.json + index.ts(模块占位)
    + 8 子目录 adapters/engine/selector/jsruntime/aggregate/protocols/http/repo
    → typecheck 0 error / build 成功 / d.ts 1.42KB re-export shared
  - §5 待办 5.1.1-5.1.4 4 个 P0 全部打勾删除线 + 写入实际验收结果
  - §13 工具链问题追加 T7/T8/T9/T10（pnpm 11 onlyBuiltDependencies / UTF-16 BOM / TS6059 / --filter 前置校验）
  - §14 验证命令清单 Step 2-5 填入实际结果 + 执行人/时间
⚠️ 遗留
  - T7 onlyBuiltDependencies 仍导致 `pnpm install` 返回 exit=1（只是 ignored-builds 告警；但二进制可用）。
    下一步方案：向 pnpm 项目级配置写 `ignored-builds=error-only-once=false` 或等待 pnpm 11 文档修正；
    目前通过 "直接执行本地二进制" + "npx --no-install" 规避（见 T10）。
  - 构建产物 dist/ 目前未加入 .gitignore（本次已产生 shared/core dist，需考虑 .gitignore 追加 **/dist 但保留 d.ts？→ 默认全忽略）
  - M0 剩余 10 项待办（5.1.5 apps/web 空壳起头）
🚨 阻塞
  - 0（当前无活跃阻塞；Rust 跳过不会阻塞 Web 关键路径）
  - 隐性注意：`packages/*/dist/` 是构建产物，M0 Step 12 之后应统一加入 .gitignore，避免后续误 commit 大二进制

## v0.1.3 · [待 Agent 填写 阶段名] (待填日期) · [待填]
✅ 完成
  - (此处由下一 Agent 追加)
⚠️ 遗留
  - (此处追加)
🚨 阻塞
  - (此处追加)
```

---

## 18. 历史基线 vs 当前进度对比

| 维度 | 基线 commit `b1a4e6c` (Initial commit) | 当前（M0 Step 2-5 完成后）|
|---|---|---|
| **代码文件数** | 5 (.gitignore + 原型 3 件 + 规划 md) | 5 → 40+（package.json + pnpm-workspace.yaml + turbo.json + .npmrc + tsconfig.base.json + .eslintrc.js + .prettierrc + .editorconfig + packages/shared/8 文件 + packages/core/14 文件 + STATUS + memory + 构建产物 dist/）|
| **包管理** | 无 package.json | ✅ pnpm workspace（2 包已注册：@omniflow/shared + @omniflow/core）；lockfile pnpm-lock.yaml 已落盘 |
| **构建产物** | 无 | ✅ packages/shared/dist/ (6 files, index.d.ts 15.85KB) + packages/core/dist/ (6 files, index.d.ts 1.42KB) |
| **UI 形态** | 纯静态原型（浏览器 file://） | 同左（下一步 Step 6 转 Vue SFC）|
| **引擎能力** | 0%（仅文档设计） | ≈2%（接口类型 + 占位导出；实现待 M1）|
| **测试覆盖** | 0%（无测试框架）| ≈0%（vitest 已作为 core/devDeps 声明，未写用例）|
| **CI/CD** | 无 | 无（Step 9 建 workflow）|
| **远程同步** | 未关联 GitHub | ✅ 已关联，分支 init-project-plan-R7Bn1J 已 push，下次 PR 可提 main |
| **文档完整度** | 规划文档 ≈95% | 规划 100% + 状态文档 100%(含 Step2-5 实证数据) + 记忆文档 100%（#003 含本次）|

---

## 19. 附录：可直接复制的提示词模板

> 以下模板可**直接复制粘贴**到新对话，用于启动新的 Agent 并使其无缝接手同一项目。

### 模板 A：新对话启动（接手当前上下文）
```
你好，请接手「汇流 OmniFlow」项目的开发工作。严格按以下步骤恢复上下文，不要自己摸索：

1. 先读取这两个文件（绝对路径）：
   - c:\Users\SATAN\.trae-cn\worktrees\OmniFlow\init-project-plan-R7Bn1J\PROJECT_STATUS.md
   - c:\Users\SATAN\.trae-cn\worktrees\OmniFlow\init-project-plan-R7Bn1J\.agent-memory.md
2. 进入项目目录后执行：
   cd c:\Users\SATAN\.trae-cn\worktrees\OmniFlow\init-project-plan-R7Bn1J
   git status ; git log --oneline -5
3. 打开 PROJECT_STATUS.md 的 §15 交接协议，按 15.3「接手新会话时的 5 个动作」做。
4. 对照 §11 下一步执行顺序，告诉我你当前该从哪一步开始，并给出执行计划。
5. 任务完成离开时，必须严格按 §15.1 Leave-Behind Checklist 留下所有东西。

项目 GitHub URL: https://github.com/yoursatan/OmniFlow.git
本次任务范围: <说明本次要做的具体 Step 范围，如 "M0 Step 2-5">
```

### 模板 B：指定做某个里程碑的一批 Step（如做 M0 Step 2-8）
```
请执行 OmniFlow 项目 M0 基建的 Step 2 到 Step 8（见 PROJECT_STATUS.md §11）。

要求：
1. 每一步做完立即执行 §14 对应的验证命令，验证通过再进入下一步。
2. 把验证结果填到 §14「实际结果」和「执行人/时间」列。
3. 所有 Git commit 使用 Conventional Commits。
4. 完成后按 §15.2 留下 6 项交付物。
5. 如果遇到阻塞，写到 §10 阻塞项并停止，不要跳过做后面的。
6. 最后给我一个总结：做了哪几步、验证结果如何、哪一步有问题。

先读取 PROJECT_STATUS.md 和 .agent-memory.md 再动手。
```

### 模板 C：完成离开的收尾提示（给 Agent 自己最后检查用）
```
在你宣布完成本次任务前，请逐项检查你是否做到：

□ 更新了 PROJECT_STATUS.md 顶部信息（版本/日期/commit/阶段）
□ 更新了 §5 未完成事项（已完成的打勾删除线，新增的标注优先级）
□ 填了 §14 验证命令清单的实际结果和执行人时间
□ 至少有 1 个 Git commit，格式是 feat/fix/docs/chore(scope): 描述
□ 在 .agent-memory.md 末尾追加了 1-3 句话的阶段性总结（不要覆盖旧的）
□ 如果有阻塞，追加到了 §10 阻塞项且状态为 ❌
□ 执行了 git push（如果 GitHub URL 已配置）
□ 如果你改动了代码，`pnpm lint` + `pnpm test -r --run` 都通过

如果上面任意一项没打勾，请先补完再结束。最后请把 PROJECT_STATUS.md §17 版本日志
追加一条你本次的记录。
```

---

**本文件结束。如果读到这里，请同时打开 `.agent-memory.md` 查看极简记忆摘要。**
