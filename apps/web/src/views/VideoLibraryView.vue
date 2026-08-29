<template>
  <TwoColumnDiscovery
    left-title="影视分组"
    right-title="全部影视"
    :groups="groups"
    :kinds="['剧集', '电影', '动漫', '综艺', '纪录片', '收藏', '观看历史']"
    entity-label="部"
    :count="16"
    placeholder-src="🎬"
  />
</template>
<script setup lang="ts">
import TwoColumnDiscovery from '@/components/TwoColumnDiscovery.vue';
const groups = [
  { label: '收藏分组', count: 12 },
  { label: '观看历史', count: 24 },
  { label: '稍后看',   count: 7 },
];
// TODO(M4): 接入 repo.video + 分组拖拽排序 / 批量删除
</script>
