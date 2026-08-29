import { describe, it, expect } from 'vitest'
import type { UnifiedSource, RulePipeline, SourceHealth } from '@omniflow/shared'

/**
 * Smoke 测试 — 验证 @omniflow/core 包的测试基础设施正常工作。
 * M1 引擎内核实现后将替换为真实单测。
 */
describe('core smoke test', () => {
  it('vitest 基础断言可用', () => {
    expect(1 + 1).toBe(2)
  })

  it('@omniflow/shared IR 类型可被 core 消费', () => {
    const pipeline: RulePipeline = {
      name: 'test-pipeline',
      segments: [],
    }
    const health: SourceHealth = {
      status: 'healthy',
      latencyMs: 50,
      lastCheckAt: Date.now(),
    }
    const source: UnifiedSource = {
      id: 'smoke-test',
      name: 'Smoke Test Source',
      kind: 'generic_web_rss',
      format: 'rss',
      homeUrl: { url: 'https://example.com' },
      search: pipeline,
      detail: pipeline,
      toc: pipeline,
      content: pipeline,
      enabled: true,
      health,
    }
    expect(source.id).toBe('smoke-test')
    expect(source.kind).toBe('generic_web_rss')
    expect(source.health.status).toBe('healthy')
  })
})
