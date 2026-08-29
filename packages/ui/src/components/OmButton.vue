<script setup lang="ts">
/**
 * OmButton — OmniFlow 共享按钮组件
 * 基于 Element Plus 风格的暗色主题，支持 type/size/disabled/loading。
 */
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  type?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  loading?: boolean
  icon?: string
}>(), {
  type: 'default',
  size: 'medium',
  disabled: false,
  loading: false,
})

const emit = defineEmits<{
  click: [e: MouseEvent]
}>()

const classes = computed(() => [
  'om-button',
  `om-button--${props.type}`,
  `om-button--${props.size}`,
  {
    'is-disabled': props.disabled,
    'is-loading': props.loading,
  },
])

function onClick(e: MouseEvent) {
  if (props.disabled || props.loading) return
  emit('click', e)
}
</script>

<template>
  <button :class="classes" :disabled="disabled || loading" @click="onClick">
    <span v-if="loading" class="om-button__loading" aria-hidden="true" />
    <slot />
  </button>
</template>

<style scoped>
.om-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 1px solid var(--om-border, #3a3a3a);
  border-radius: var(--om-radius, 8px);
  background: var(--om-bg-default, #2a2a2a);
  color: var(--om-text, #e0e0e0);
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  white-space: nowrap;
  user-select: none;
}

.om-button:hover:not(.is-disabled) {
  border-color: var(--om-brand, #4fc3f7);
  color: var(--om-brand, #4fc3f7);
}

.om-button--primary {
  background: var(--om-brand, #4fc3f7);
  border-color: var(--om-brand, #4fc3f7);
  color: #0a0a0a;
}

.om-button--primary:hover:not(.is-disabled) {
  opacity: 0.85;
  color: #0a0a0a;
}

.om-button--success { background: #2e7d32; border-color: #2e7d32; color: #fff; }
.om-button--warning { background: #f57c00; border-color: #f57c00; color: #fff; }
.om-button--danger { background: #c62828; border-color: #c62828; color: #fff; }

.om-button--small { padding: 4px 10px; font-size: 12px; }
.om-button--medium { padding: 6px 16px; font-size: 14px; }
.om-button--large { padding: 10px 20px; font-size: 16px; }

.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.is-loading {
  cursor: wait;
}

.om-button__loading {
  width: 14px;
  height: 14px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: om-spin 0.6s linear infinite;
}

@keyframes om-spin {
  to { transform: rotate(360deg); }
}
</style>
