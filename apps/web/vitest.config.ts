import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'

/**
 * @omniflow/web Vitest 配置
 * Vue3 SFC 组件测试，jsdom 环境 + @vue/test-utils。
 */
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@omniflow/shared': resolve(__dirname, '../../packages/shared/src'),
      '@omniflow/core': resolve(__dirname, '../../packages/core/src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts', 'src/**/*.vue'],
      exclude: ['src/**/*.test.ts', 'src/**/*.d.ts', 'dist/**'],
    },
  },
})
