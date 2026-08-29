<template>
  <el-row :gutter="16" style="min-height: calc(100vh - 120px);">
    <el-col :span="5">
      <div class="omni-card" style="height: 100%;">
        <div class="st-title">设置 · 分区导航</div>
        <el-menu
          :default-active="$route.path"
          router
          background-color="transparent"
          text-color="var(--text-1)"
          active-text-color="#ffffff"
          class="st-menu"
        >
          <el-menu-item index="/settings/appearance"><el-icon><Brush /></el-icon><span>外观</span></el-menu-item>
          <el-menu-item index="/settings/network"><el-icon><Connection /></el-icon><span>网络</span></el-menu-item>
          <el-menu-item index="/settings/sandbox"><el-icon><Lock /></el-icon><span>安全沙箱</span></el-menu-item>
          <el-menu-item index="/settings/backup"><el-icon><Files /></el-icon><span>数据备份</span></el-menu-item>
          <el-menu-item index="/settings/playback"><el-icon><Reading /></el-icon><span>播放与阅读</span></el-menu-item>
          <el-menu-item index="/settings/about"><el-icon><InfoFilled /></el-icon><span>关于</span></el-menu-item>
        </el-menu>
      </div>
    </el-col>
    <el-col :span="19">
      <router-view />
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import { Brush, Connection, Lock, Files, Reading, InfoFilled } from '@element-plus/icons-vue';
// 11 设置 = 左分区导航 + 右侧子路由
// TODO: 接入 Pinia globalState 持久化设置 (localStorage / Dexie)
</script>

<style scoped>
.st-title { font-weight: 700; margin-bottom: 10px; color: var(--text-1); }
.st-menu { border: 1px solid var(--border); border-radius: 8px; padding: 6px; background: var(--bg-2); }
.st-menu :deep(.el-menu-item) { border-radius: 6px; }
.st-menu :deep(.el-menu-item.is-active) { background: var(--brand-soft); color: #fff; }
</style>
