<template>
  <div class="settings-layout">
    <div class="settings-nav">
      <div v-for="n in navItems" :key="n.key" class="settings-nav-item"
        :class="{ on: route.path === n.path }" @click="$router.push(n.path)">
        {{ n.label }}
      </div>
    </div>
    <div class="settings-content">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';

const route = useRoute();
// 11 设置 = 左分区导航 + 右侧子路由
// prototype 的 media 分区对应路由 playback（播放与阅读）
const navItems = [
  { key: 'appearance', label: '🎨 外观主题', path: '/settings/appearance' },
  { key: 'network', label: '🌐 网络设置', path: '/settings/network' },
  { key: 'sandbox', label: '🔒 安全沙箱', path: '/settings/sandbox' },
  { key: 'backup', label: '💾 数据备份', path: '/settings/backup' },
  { key: 'playback', label: '▶ 播放与阅读', path: '/settings/playback' },
  { key: 'about', label: 'ℹ 关于', path: '/settings/about' },
];
// TODO: 接入 Pinia globalState 持久化设置 (localStorage / Dexie)
</script>

<style scoped>
.settings-layout { display: grid; grid-template-columns: 200px 1fr; gap: 20px; align-items: start; }
.settings-nav { background: var(--bg2); border: 1px solid var(--line); border-radius: 12px; padding: 8px; }
.settings-nav-item {
  padding: 10px 14px; border-radius: 8px; cursor: pointer; font-size: 13px;
  color: #c4cad8; transition: all .15s; display: flex; align-items: center; gap: 10px;
}
.settings-nav-item:hover { background: var(--bg3); }
.settings-nav-item.on { background: rgba(108, 124, 255, .15); color: #fff; }
.settings-content {
  background: var(--bg2); border: 1px solid var(--line); border-radius: 12px;
  padding: 20px; min-height: 560px;
}
</style>
