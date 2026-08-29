# 汇流 OmniFlow

> **一套规则引擎，吃下所有主流源格式（书源/影视源/直播源/解析源），Web 与桌面共享同一核心。**

[![License: GPL-3.0](https://img.shields.io/badge/License-GPL--3.0-blue.svg)](./LICENSE)
[![Node](https://img.shields.io/badge/Node-%3E%3D20-brightgreen.svg)](https://nodejs.org)
[![Vue](https://img.shields.io/badge/Vue-3.5-42b883.svg)](https://vuejs.org)
[![Vite](https://img.shields.io/badge/Vite-5-646cff.svg)](https://vitejs.dev)

---

## ⚠️ 免责声明

**本项目仅提供解析规则引擎，不内置任何版权资源。** 用户自行导入的第三方资源源由用户自行负责，项目不对内容合法性承担责任。请遵守当地法律法规。

---

## 功能特性

- **全源格式兼容**：Legado 书源（含漫画源/订阅源）、TVBox 配置、ZyPlayer 格式、苹果 CMS、IPTV m3u/txt、drpy（XP/JS 源）等
- **全选择器体系**：JSoup 类选择器、CSS、XPath、JSONPath、正则、`{{}}` JS 模板、`@js:` 纯 JS
- **段-步 v2 规则引擎**：结构化流水线编译执行，支持分步调试
- **双端同构**：核心逻辑纯 TypeScript，Web 端（Vue3）与桌面端（Tauri）共享同一引擎
- **消费端完整**：观影界面（多播放器/换源）、阅读界面（翻页/排版）、直播界面（EPG/换台）
- **规则工坊**：可视化规则编写界面 + 分步调试器 + 源体检（批量校验可用性）

## 技术栈

| 层 | 技术 |
|---|---|
| **Monorepo** | pnpm workspace + Turbo |
| **核心引擎** | 纯 TypeScript（零原生依赖，双端同构） |
| **Web 前端** | Vue 3.5 + Vite 5 + Element Plus 2.8 + Pinia 2 |
| **桌面端** | Tauri v2（规划中，需 Rust） |
| **类型系统** | TypeScript 5.5（strict 模式全开） |
| **测试** | Vitest 2.1 + @vue/test-utils + jsdom |
| **代码质量** | ESLint + Prettier + EditorConfig |

## 快速开始

### 环境要求

- Node.js >= 20.0.0
- pnpm >= 9.0.0

### 安装

```bash
git clone https://github.com/yoursatan/OmniFlow.git
cd OmniFlow
pnpm install
```

### 开发

```bash
pnpm dev:web          # 启动 Web 开发服务器 (localhost:5173)
pnpm build            # 构建所有包
pnpm test             # 运行所有测试
pnpm test:core        # 仅运行 core 测试
pnpm test:web         # 仅运行 web 测试
pnpm coverage         # 运行测试 + 覆盖率报告
pnpm lint             # ESLint 检查
pnpm typecheck        # TypeScript 类型检查
```

## 仓库结构

```
OmniFlow/
├── apps/
│   └── web/                    # Vue3 + Vite + Element Plus Web 前端
│       ├── src/
│       │   ├── views/          # 22 个 SFC 视图（15 屏）
│       │   ├── stores/         # 3 个 Pinia store
│       │   ├── router/         # 27 条路由
│       │   ├── components/     # 公共组件
│       │   └── layouts/        # 布局组件
│       └── vite.config.ts
├── packages/
│   ├── shared/                 # 跨项目 IR 类型定义
│   ├── core/                   # 核心引擎（纯 TS）
│   └── ui/                     # 共享组件库
├── prototype/                  # UI 交互原型（HTML/CSS/JS）
├── docs/                       # 文档
├── vitest.workspace.ts         # Vitest workspace 配置
├── turbo.json                  # Turbo 任务编排
└── pnpm-workspace.yaml         # pnpm workspace 配置
```

## 开发路线图

| 里程碑 | 状态 | 说明 |
|---|---|---|
| **M0 基建** | 进行中 90% | Monorepo 骨架 + TS 配置 + IR 类型 + apps/web 空壳 + Vitest |
| **M1 引擎内核** | 待开始 | 5 大选择器 + 段-步 v2 规则引擎 + Pipeline 执行 |
| **M2 JS 沙箱** | 待开始 | 隔离运行时 + 安全策略 |
| **M3 书源消费** | 待开始 | Legado 适配器 + 阅读器 + 书架 |
| **M4 影视消费** | 待开始 | 影视聚合 + 播放器 + 换源 |
| **M5 直播+IPTV** | 待开始 | m3u 解析 + EPG + 换台 |
| **M6 规则工坊+发布** | 待开始 | 规则编辑器 + 调试器 + 打包发布 |

详见 [docs/开发规划.md](./docs/开发规划.md)。

## 许可证

[GPL-3.0](./LICENSE) — 与 Legado/Hiker 生态一致，防闭源套壳。
