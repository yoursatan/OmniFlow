<template>
  <div class="player-wrap">
    <div class="player-screen">
      <div class="placeholder">
        <div class="big-play">▶</div>
        <div class="title">播放器 · 屏 #13 · 资源 ID: {{ id }}</div>
        <div class="hint omni-muted">
          ArtPlayer 视觉 · 选集侧栏 · 嗅探日志 · 下一集连播 &nbsp;&nbsp;（M4 集成 ArtPlayer + hls.js / dash.js）
        </div>
      </div>
    </div>

    <div class="player-controls omni-card">
      <el-row :gutter="14">
        <el-col :span="17">
          <el-slider
            :model-value="26"
            :show-tooltip="false"
            :marks="{ 0: '00:00', 50: '12:15', 100: '24:30' }"
            range
          />
          <div style="display:flex; align-items:center; gap:14px; margin-top: 10px;">
            <el-button :icon="Back" circle text />
            <el-button type="primary" :icon="VideoPlay" circle />
            <el-button :icon="Right" circle text />
            <span class="t now">06:24 / 24:30</span>
            <el-tag size="small" effect="dark">1080P</el-tag>
            <el-tag size="small">2×</el-tag>
            <div style="flex:1"></div>
            <el-button text>嗅探日志</el-button>
            <el-button text :icon="PictureFilled">截图</el-button>
            <el-button text :icon="FullScreen">全屏</el-button>
          </div>
        </el-col>
        <el-col :span="7">
          <div style="font-weight: 700; margin-bottom: 8px;">选集 · 共 24 集</div>
          <div class="ep-scroller">
            <el-tag
              v-for="n in 24"
              :key="n"
              size="default"
              :effect="n < 7 ? 'dark' : (n === 7 ? 'dark' : 'plain')"
              :type="n === 7 ? 'danger' : (n < 7 ? 'primary' : 'info')"
              class="ep-chip"
            >E{{ n.toString().padStart(2, '0') }}</el-tag>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Back, VideoPlay, Right, PictureFilled, FullScreen } from '@element-plus/icons-vue';
const props = defineProps<{ id: string }>();
// void props;
// TODO(M4): ArtPlayer 集成（hls/dash + 解析接口池 + 多线路自动换源 + 嗅探日志）
</script>

<style scoped>
.player-wrap { display: flex; flex-direction: column; gap: 14px; }
.player-screen {
  background: #000;
  aspect-ratio: 16 / 9;
  border-radius: var(--radius);
  position: relative;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
}
.placeholder { text-align: center; color: #fff; }
.big-play { font-size: 68px; line-height: 1; margin-bottom: 12px; opacity: 0.9; }
.title { font-weight: 700; font-size: 18px; }
.hint  { margin-top: 8px; color: rgba(255,255,255,0.55) !important; }
.ep-scroller { max-height: 120px; overflow: auto; display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; padding-right: 4px; }
.ep-chip { text-align: center; }
.t.now { color: var(--muted); font-variant-numeric: tabular-nums; }
</style>
