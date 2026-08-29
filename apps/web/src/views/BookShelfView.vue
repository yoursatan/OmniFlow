<template>
  <TwoColumnDiscovery
    left-title="书库分组"
    right-title="全部书籍"
    :groups="groups"
    :kinds="['玄幻', '都市', '科幻', '历史', '轻小说', '武侠', '未分组']"
    entity-label="本"
    :count="28"
    placeholder-src="📚"
  />
</template>
<script setup lang="ts">
import TwoColumnDiscovery from '@/components/TwoColumnDiscovery.vue';
// 原型占位，不接真实数据
const groups = [
  { label: '正在追', count: 5 },
  { label: '已完结', count: 9 },
  { label: '稍后看', count: 14 },
];
// TODO(M3): 从 sourceManager store + Dexie repo 拉书架 & 分组 CRUD
</script>
