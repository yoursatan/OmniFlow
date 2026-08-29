import { defineWorkspace } from 'vitest/config'

/**
 * OmniFlow Vitest Workspace — 统一管理 core + web 两个项目的测试配置。
 * - core: 纯 TS 引擎，node 环境
 * - web:  Vue3 SFC，jsdom 环境 + @vue/test-utils
 *
 * 用法：
 *   pnpm test              # 跑全部
 *   pnpm test:core         # 只跑 core
 *   pnpm test:web          # 只跑 web
 *   pnpm coverage          # 跑全部 + 覆盖率
 *   pnpm test:ui           # 打开 Vitest UI 面板
 */
export default defineWorkspace([
  {
    extends: './packages/core/vitest.config.ts',
    test: {
      name: 'core',
      root: './packages/core',
      include: ['src/**/*.test.ts'],
      coverage: {
        reporter: ['text', 'html', 'lcov'],
        reportsDirectory: './packages/core/coverage',
      },
    },
  },
  {
    extends: './apps/web/vitest.config.ts',
    test: {
      name: 'web',
      root: './apps/web',
      include: ['src/**/*.test.ts'],
      coverage: {
        reporter: ['text', 'html', 'lcov'],
        reportsDirectory: './apps/web/coverage',
      },
    },
  },
])
