<template>
  <TwoColumnDiscovery
    left-title="书源"
    right-title="书院 · 发现"
    left-filter-placeholder="筛选书源名 / 分组…"
    :sources="sources"
    :kinds="['排行', '玄幻', '都市', '言情', '科幻', '历史', '轻小说']"
    entity-label="本书籍"
    :count="256"
    placeholder-src="📖"
  />
</template>
<script setup lang="ts">
import TwoColumnDiscovery from '@/components/TwoColumnDiscovery.vue';
const sources = [
  { name: 'A 书源',   group: '默认分组', health: 95 },
  { name: 'B 书源',   group: '默认分组', health: 82 },
  { name: 'C 笔趣',   group: '第三方',   health: 63 },
  { name: 'D 知轩',   group: '第三方',   health: 71 },
];
// TODO(M3): sourceManager 列出启用的书源 → @omniflow/core aggregate.discovery()
</script>
