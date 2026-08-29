import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'

/**
 * Smoke 测试 — 验证 @omniflow/web 的 Vitest + jsdom + @vue/test-utils 基础设施。
 * M0 阶段仅验证测试框架能跑通；真实组件测试在 M1+ 补充。
 */

const HelloComponent = defineComponent({
  name: 'HelloOmniFlow',
  props: { msg: { type: String, default: 'OmniFlow' } },
  template: '<div class="hello">{{ msg }}</div>',
})

describe('web smoke test', () => {
  it('vitest + jsdom 基础断言可用', () => {
    expect(document.body).toBeDefined()
    expect(2 * 3).toBe(6)
  })

  it('@vue/test-utils mount 正常渲染', () => {
    const wrapper = mount(HelloComponent, { props: { msg: '汇流 OmniFlow' } })
    expect(wrapper.classes()).toContain('hello')
    expect(wrapper.text()).toBe('汇流 OmniFlow')
  })
})
