<template>
  <div class="reader">
    <!-- 顶部：返回 + 书籍标题 + 进度 + 操作 -->
    <div class="topbar omni-card" style="margin-bottom: 12px;">
      <div style="display:flex; align-items:center; gap:14px;">
        <el-button :icon="ArrowLeft" circle text @click="$router.back()" />
        <div style="flex:1; min-width: 0;">
          <div class="t1" :title="book">示例书籍 · {{ book }}</div>
          <div class="t2 omni-muted">第 23 章：章节标题占位（阅读器 · 屏 #14）</div>
        </div>
        <el-tag effect="plain" size="small">56% · 第 123 / 221 页</el-tag>
        <el-button-group>
          <el-button :icon="List" title="目录" />
          <el-button :icon="CollectionTag" title="书签" />
          <el-button :icon="Setting" title="排版" @click="$router.push('/settings/playback')" />
        </el-button-group>
      </div>
      <el-slider :model-value="56" :show-tooltip="false" style="margin-top: 10px;" />
    </div>

    <div class="content omni-card" :class="`theme-${theme}`">
      <h3 class="chapter-title">第 23 章 · 章节标题占位</h3>
      <p v-for="p in paragraphs" :key="p.i" class="para">{{ p.t }}</p>
      <div class="chain-hint omni-muted">
        🔗 正文未完，检测到 <code>nextTocUrl</code>，点击下方按钮自动续链 · M3 实现翻页时静默预加载下一章
      </div>
      <el-button type="primary" style="margin-top: 8px;" :icon="Right">继续下一章</el-button>
    </div>

    <div class="bottom omni-card">
      <el-space wrap>
        <span class="omni-muted">主题：</span>
        <el-radio-group v-model="theme" size="small">
          <el-radio-button label="dark">暗夜</el-radio-button>
          <el-radio-button label="sepia">护眼</el-radio-button>
          <el-radio-button label="light">浅色</el-radio-button>
          <el-radio-button label="green">绿豆沙</el-radio-button>
        </el-radio-group>
        <el-divider direction="vertical" />
        <span class="omni-muted">字号：</span>
        <el-slider v-model="fz" :min="12" :max="28" style="width: 160px;" />
        <el-divider direction="vertical" />
        <span class="omni-muted">行距：</span>
        <el-slider v-model="lh" :min="1.2" :max="2.4" :step="0.1" style="width: 160px;" />
      </el-space>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ArrowLeft, List, CollectionTag, Setting, Right } from '@element-plus/icons-vue';
const props = defineProps<{ id: string }>();
void props;
const book = ref('demo-book-source#sample-01');
const theme = ref<'dark' | 'sepia' | 'light' | 'green'>('dark');
const fz = ref(17);
const lh = ref(1.85);
const paragraphs = computed(() => Array.from({ length: 12 }, (_, i) => ({
  i,
  t: `　　这是第 ${i + 1} 段示例正文。OmniFlow 阅读器在 M3 阶段将从 @omniflow/core 传入 ` +
     `BaseContentItem.text，并支持「正文段拼接 + 章节跨页 + TOC 抽屉 + 换源续链」四种 ` +
     `核心能力。此处为演示排版视觉：字号 ${fz.value}px，行距 ${lh.value.toFixed(2)} 倍。` +
     `段落首行缩进 2 字符，段间距 ≈ 1em，左右留白与阅读器容器成比例。`,
})));
// TODO(M3): 接入 Reader 排版引擎（长页/分页/点击翻页）+ Dexie 进度保存
</script>

<style scoped>
.reader { max-width: 860px; margin: 0 auto; }
.topbar .t1 { font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.topbar .t2 { font-size: 12px; margin-top: 2px; }

.content {
  padding: 36px 42px;
  transition: background .2s, color .2s;
}
.theme-dark  { background: #0f1117; color: #dcdfe6; }
.theme-sepia { background: #f2e6c8; color: #473418; }
.theme-light { background: #ffffff; color: #1f2329; }
.theme-green { background: #cce8cf; color: #0c1a12; }
.chapter-title { text-align: center; margin-top: 0; margin-bottom: 28px; font-weight: 700; }
.para {
  font-size: v-bind('fz + "px"');
  line-height: v-bind('String(lh)');
  margin: 0 0 16px 0;
  text-indent: 2em;
}
.chain-hint {
  margin-top: 24px; padding: 10px 14px;
  border-left: 3px solid var(--brand);
  background: var(--brand-soft);
  border-radius: 6px;
}
.bottom { padding: 14px 20px; }
</style>
