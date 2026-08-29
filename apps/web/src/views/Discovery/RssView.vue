<template>
  <TwoColumnDiscovery
    left-title="订阅源"
    right-title="RSS 订阅发现"
    left-filter-placeholder="筛选订阅源…"
    :sources="sources"
    :kinds="['技术', '产品', 'AI', '创投', '博客', '新闻']"
    entity-label="篇文章"
    :count="96"
    placeholder-src="📰"
  />
</template>
<script setup lang="ts">
import TwoColumnDiscovery from '@/components/TwoColumnDiscovery.vue';
const sources = [
  { name: '阮一峰·科技爱好者', group: '默认',  health: 100 },
  { name: 'InfoQ 中文站',      group: '技术',  health: 99 },
  { name: 'Hacker News',      group: '海外',  health: 90 },
];
// TODO(M3): RSS 协议适配器（protocols 模块）拉取 XML，转为 BaseContentItem[]
</script>
