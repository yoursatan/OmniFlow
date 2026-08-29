import { defineConfig } from 'vitest/config'
import { resolve } from 'node:path'

/**
 * @omniflow/core Vitest 配置
 * 纯 TS 引擎测试，node 环境，无 DOM 依赖。
 */
export default defineConfig({
  resolve: {
    alias: {
      '@omniflow/shared': resolve(__dirname, '../shared/src'),
      '@omniflow/core': resolve(__dirname, 'src'),
    },
  },
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/**/index.ts', 'dist/**'],
    },
  },
})
