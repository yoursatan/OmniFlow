<template>
  <TwoColumnDiscovery
    left-title="影视源"
    right-title="影院 · 发现"
    left-filter-placeholder="筛选影视源名…"
    :sources="sources"
    :kinds="['热播', '剧集', '电影', '动漫', '综艺', '4K', '纪录片']"
    entity-label="部影视"
    :count="412"
    placeholder-src="🎞️"
  />
</template>
<script setup lang="ts">
import TwoColumnDiscovery from '@/components/TwoColumnDiscovery.vue';
const sources = [
  { name: 'TVBox 配置 #1', group: '自建',  health: 96 },
  { name: '某 CMS',        group: 'CMS',   health: 74 },
  { name: 'ZyPlayer 分享', group: '社区',  health: 81 },
];
// TODO(M4): protocols.cms + aggregate.discovery 渲染
</script>
