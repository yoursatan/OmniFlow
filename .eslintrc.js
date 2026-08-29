/* ==========================================================
 * OmniFlow ESLint 配置
 * 说明：根级通用规则，子包可各自 extend；
 *       Vue/TSX/Vitest 等子包特定规则在子包内追加。
 * ========================================================== */
// eslint-disable-next-line no-undef
module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2022: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    tsconfigRootDir: __dirname,
    project: null, // 子包各自启用 type-aware lint
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  ignorePatterns: [
    'node_modules',
    'dist',
    'build',
    '.turbo',
    '.pnpm-store',
    '*.min.js',
    'prototype',
    'coverage',
    // 根级 eslint 无 vue-eslint-parser，.vue / .css 交给子包各自 lint（apps/web/packages/ui 有独立解析链）
    '**/*.vue',
    '**/*.css',
    'packages/ui/**',
  ],
  rules: {
    // —— TypeScript 专用：放宽/收紧推荐配置 ——
    '@typescript-eslint/ban-types': [
      'warn',
      {
        extendDefaults: true,
        types: {
          // {} 在 IR 中用作"无额外字段的空对象约束"（与 object / unknown 语义不同），保留为 warn 而非 error
          '{}': false,
        },
      },
    ],
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      },
    ],
    '@typescript-eslint/no-explicit-any': 'warn',    // 引擎内允许暂标 any，M1 逐步替换
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/no-var-requires': 'error',
    // '@typescript-eslint/prefer-const' 依赖 TS 插件完全加载，pnpm hoist 下偶发 rule-not-found；
    // 核心 eslint 'prefer-const' 规则已覆盖同等语义，故此处不再重复配置。
    '@typescript-eslint/consistent-type-imports': [
      'warn',
      { prefer: 'type-imports', disallowTypeAnnotations: false },
    ],

    // —— 通用 ——
    'no-console': ['warn', { allow: ['warn', 'error', 'info', 'debug'] }],
    'no-debugger': 'warn',
    'no-alert': 'error',
    'prefer-promise-reject-errors': 'warn',
    eqeqeq: ['error', 'smart'],
    'no-var': 'error',
    'prefer-const': 'warn',
  },
  overrides: [
    // 测试文件：允许断言相关非空断言等
    {
      files: ['**/*.spec.ts', '**/*.test.ts', '**/__tests__/**/*.ts'],
      env: { jest: true },
      globals: {
        // Vitest 全局变量（等 M0 Step 8 接入 vitest + eslint-plugin-vitest 后，
        // 替换为 extends 'plugin:vitest-globals/recommended'）
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        assert: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        vi: 'readonly',
      },
    },
    // 配置文件
    {
      files: [
        '*.js',
        '*.cjs',
        '*.config.ts',
        '*.config.js',
        'vite.config.ts',
        'vitest.config.ts',
      ],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
      },
    },
  ],
};
