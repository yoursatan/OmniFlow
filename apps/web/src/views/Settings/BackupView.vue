<template>
  <div class="omni-card">
    <h2>设置 · 数据备份</h2>
    <p class="omni-muted">源仓库、书架/影视库进度、规则、设置的导入 / 导出。Web 端走 IndexedDB + JSON 序列化。</p>
    <el-space wrap style="margin: 14px 0;">
      <el-button type="primary" :icon="Download">导出 JSON 备份</el-button>
      <el-button :icon="Upload">导入 JSON 备份</el-button>
      <el-button :icon="Delete" type="danger">清空全部本地数据</el-button>
      <el-tag effect="dark" type="success">IndexedDB · 0.3MB</el-tag>
    </el-space>
    <el-table :data="rows" style="max-width: 820px;">
      <el-table-column prop="name" label="数据域" />
      <el-table-column prop="count" label="记录数" width="120" />
      <el-table-column prop="size" label="大小" width="120" />
      <el-table-column prop="updated" label="最近更新" />
    </el-table>
  </div>
</template>
<script setup lang="ts">
import { Download, Upload, Delete } from '@element-plus/icons-vue';
const rows = [
  { name: '源仓库 (sources)',        count: 16, size: '32 KB',  updated: '2026-08-29 10:21' },
  { name: '书架 (books)',            count: 28, size: '16 KB',  updated: '2026-08-29 09:55' },
  { name: '影视库 (videos)',         count: 16, size: '12 KB',  updated: '2026-08-28 23:40' },
  { name: '阅读进度 (progress)',     count: 120, size: '56 KB', updated: '2026-08-29 10:00' },
  { name: '设置 (settings)',         count: 1,  size: '4 KB',   updated: '2026-08-29 00:00' },
];
// TODO: 对接 Dexie DB 导出/导入
</script>
