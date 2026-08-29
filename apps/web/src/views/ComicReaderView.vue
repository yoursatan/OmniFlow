<template>
  <div class="comic">
    <div class="top omni-card" style="margin-bottom: 12px;">
      <div style="display:flex; align-items:center; gap:14px;">
        <el-button :icon="ArrowLeft" circle text @click="$router.back()" />
        <div style="flex:1;">
          <div class="t1">示例漫画 · {{ id }}</div>
          <div class="t2 omni-muted">漫画阅读器 · 屏 #15 · 第 12 话 / 共 38 话</div>
        </div>
        <el-radio-group v-model="mode" size="small">
          <el-radio-button label="double">双页</el-radio-button>
          <el-radio-button label="single">单页</el-radio-button>
          <el-radio-button label="scroll">条漫</el-radio-button>
        </el-radio-group>
        <el-button-group>
          <el-button :icon="DArrowLeft" :disabled="page<=1" @click="page = Math.max(1, page-1)" />
          <el-button plain disabled>{{ page }} / {{ total }}</el-button>
          <el-button :icon="DArrowRight" :disabled="page>=total" @click="page = Math.min(total, page+1)" />
        </el-button-group>
      </div>
      <el-slider v-model="page" :min="1" :max="total" style="margin-top: 10px;" />
    </div>

    <div class="omni-card stage">
      <div class="pages" :class="`mode-${mode}`">
        <div v-for="p in (mode === 'double' ? 2 : 1)" :key="p" class="page">
          <div class="pg-num">P.{{ (page - 1) + p }}</div>
          <div class="panel" :style="{ background: panels[p-1] }"></div>
        </div>
      </div>
    </div>

    <div class="omni-card bottom omni-muted">
      模式说明：<b>双页</b>（漫画卷阅读）/ <b>单页</b>（竖屏）/ <b>条漫</b>（长页滚动，Webtoon）。
      M5 接入翻页动画 & 缓存下 3 页图像预加载。
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ArrowLeft, DArrowLeft, DArrowRight } from '@element-plus/icons-vue';
const props = defineProps<{ id: string }>();
void props;
const mode = ref<'double' | 'single' | 'scroll'>('double');
const page = ref(1);
const total = ref(38);
const panels = [
  'linear-gradient(135deg, #1b1f2a, #2b3040)',
  'linear-gradient(135deg, #221a2f, #3a2a4a)',
];
</script>

<style scoped>
.comic { max-width: 1200px; margin: 0 auto; }
.top .t1 { font-weight: 700; }
.top .t2 { font-size: 12px; margin-top: 2px; }
.stage {
  background: #000;
  min-height: 620px;
  padding: 24px;
  display: flex; align-items: center; justify-content: center;
}
.pages { display: flex; gap: 2px; align-items: center; justify-content: center; }
.mode-scroll { flex-direction: column; width: 100%; gap: 0; }
.page {
  position: relative;
  background: #111;
  border-radius: 4px;
  overflow: hidden;
}
.mode-double .page { aspect-ratio: 3 / 4; width: clamp(240px, 40vw, 460px); }
.mode-single .page { aspect-ratio: 3 / 4; width: min(70vw, 620px); }
.mode-scroll .page { width: 100%; aspect-ratio: unset; height: 900px; border-radius: 0; }
.page + .page { border-left: 1px solid #000; }
.pg-num { position: absolute; top: 10px; right: 12px; color: rgba(255,255,255,0.6); font-size: 12px; font-variant-numeric: tabular-nums; }
.panel { width: 100%; height: 100%; }
.bottom { padding: 10px 18px; font-size: 12px; }
</style>
