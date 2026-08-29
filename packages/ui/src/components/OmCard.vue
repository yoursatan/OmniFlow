<script setup lang="ts">
/**
 * OmCard — OmniFlow 共享卡片组件
 * 暗色主题，支持 title / shadow / padding 自定义。
 */
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  title?: string
  shadow?: 'always' | 'hover' | 'never'
  padding?: number | string
}>(), {
  shadow: 'hover',
  padding: 16,
})

const styles = computed(() => ({
  padding: typeof props.padding === 'number' ? `${props.padding}px` : props.padding,
}))
</script>

<template>
  <div
    class="om-card"
    :class="[`om-card--shadow-${shadow}`]"
    :style="styles"
  >
    <div v-if="title || $slots.header" class="om-card__header">
      <slot name="header">
        <span class="om-card__title">{{ title }}</span>
      </slot>
    </div>
    <div class="om-card__body">
      <slot />
    </div>
    <div v-if="$slots.footer" class="om-card__footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<style scoped>
.om-card {
  border: 1px solid var(--om-border, #333);
  border-radius: var(--om-radius, 12px);
  background: var(--om-bg-card, #1e1e1e);
  overflow: hidden;
  transition: box-shadow 0.3s ease;
}

.om-card--shadow-always {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
}

.om-card--shadow-hover:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}

.om-card--shadow-never {
  box-shadow: none;
}

.om-card__header {
  display: flex;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--om-border, #333);
  margin-bottom: 12px;
}

.om-card__title {
  font-size: 15px;
  font-weight: 600;
  color: var(--om-text, #e0e0e0);
}

.om-card__body {
  color: var(--om-text-secondary, #aaa);
  line-height: 1.6;
}

.om-card__footer {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--om-border, #333);
}
</style>
