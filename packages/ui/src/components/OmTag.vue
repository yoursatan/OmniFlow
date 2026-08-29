<script setup lang="ts">
/**
 * OmTag — OmniFlow 共享标签组件
 * 暗色主题，支持 type / size / closable / effect。
 */
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  type?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'small' | 'medium' | 'large'
  closable?: boolean
  effect?: 'light' | 'dark' | 'plain'
}>(), {
  type: 'default',
  size: 'medium',
  closable: false,
  effect: 'dark',
})

const emit = defineEmits<{
  close: [e: MouseEvent]
}>()

const classes = computed(() => [
  'om-tag',
  `om-tag--${props.type}`,
  `om-tag--${props.size}`,
  `om-tag--${props.effect}`,
])

function onClose(e: MouseEvent) {
  e.stopPropagation()
  emit('close', e)
}
</script>

<template>
  <span :class="classes">
    <slot />
    <span v-if="closable" class="om-tag__close" @click="onClose">×</span>
  </span>
</template>

<style scoped>
.om-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border-radius: 4px;
  border: 1px solid transparent;
  white-space: nowrap;
  user-select: none;
}

.om-tag--small { padding: 0 6px; height: 20px; font-size: 11px; }
.om-tag--medium { padding: 0 8px; height: 24px; font-size: 12px; }
.om-tag--large { padding: 0 10px; height: 28px; font-size: 13px; }

/* dark effect (default) */
.om-tag--dark.om-tag--default { background: #3a3a3a; color: #e0e0e0; }
.om-tag--dark.om-tag--primary { background: #4fc3f7; color: #0a0a0a; }
.om-tag--dark.om-tag--success { background: #2e7d32; color: #fff; }
.om-tag--dark.om-tag--warning { background: #f57c00; color: #fff; }
.om-tag--dark.om-tag--danger { background: #c62828; color: #fff; }
.om-tag--dark.om-tag--info { background: #455a64; color: #fff; }

/* light effect */
.om-tag--light.om-tag--default { background: rgba(255,255,255,0.08); color: #ccc; }
.om-tag--light.om-tag--primary { background: rgba(79,195,247,0.15); color: #4fc3f7; }
.om-tag--light.om-tag--success { background: rgba(46,125,50,0.2); color: #66bb6a; }
.om-tag--light.om-tag--warning { background: rgba(245,124,0,0.2); color: #ffb74d; }
.om-tag--light.om-tag--danger { background: rgba(198,40,40,0.2); color: #ef5350; }
.om-tag--light.om-tag--info { background: rgba(69,90,100,0.2); color: #90a4ae; }

/* plain effect */
.om-tag--plain { background: transparent; }
.om-tag--plain.om-tag--default { border-color: #555; color: #ccc; }
.om-tag--plain.om-tag--primary { border-color: #4fc3f7; color: #4fc3f7; }
.om-tag--plain.om-tag--success { border-color: #66bb6a; color: #66bb6a; }
.om-tag--plain.om-tag--warning { border-color: #ffb74d; color: #ffb74d; }
.om-tag--plain.om-tag--danger { border-color: #ef5350; color: #ef5350; }
.om-tag--plain.om-tag--info { border-color: #90a4ae; color: #90a4ae; }

.om-tag__close {
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
  margin-left: 2px;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.om-tag__close:hover {
  opacity: 1;
}
</style>
