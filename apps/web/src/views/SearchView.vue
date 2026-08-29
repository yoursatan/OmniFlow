<template>
  <div class="omni-card">
    <h2>跨源搜索 · 屏 #02</h2>
    <p class="omni-muted">源分类筛选 chips、渐进渲染、来源徽标 + 耗时、相似归并「换源 N」</p>

    <el-space wrap style="margin: 12px 0 18px;">
      <span class="omni-muted">过滤：</span>
      <el-tag v-for="t in kinds" :key="t" effect="plain" round :type="'primary'">{{ t }}</el-tag>
    </el-space>

    <el-input
      v-model="q"
      size="large"
      placeholder="输入书籍 / 影视 / 文章 / 频道关键词… (原型)"
    >
      <template #prefix><el-icon><Search /></el-icon></template>
      <template #append>
        <el-button type="primary" :icon="Search">搜索</el-button>
      </template>
    </el-input>

    <el-empty description="M1 接入 @omniflow/core aggregate.search() 后显示结果，M0 为空壳" style="margin-top: 48px;" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Search } from '@element-plus/icons-vue';
import { useRoute } from 'vue-router';
const route = useRoute();
const q = ref((route.query.q as string) || '');
const kinds = ['书源', '影视源', 'RSS', '直播', '漫画', '全站'];
// TODO(M1): 调 core.aggregate.search，用 <TransitionGroup> + 源徽标时间戳卡片渲染
</script>
