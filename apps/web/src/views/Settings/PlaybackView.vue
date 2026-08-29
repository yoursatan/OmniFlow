<template>
  <div class="omni-card">
    <h2>设置 · 播放与阅读</h2>
    <p class="omni-muted">播放器内核、解码、阅读器主题、字号/行距、滚动/分页模式、阅读器/播放器快捷键</p>
    <el-row :gutter="20">
      <el-col :span="12">
        <h3>播放器</h3>
        <el-form label-width="140px">
          <el-form-item label="内核">
            <el-radio-group v-model="pl">
              <el-radio label="artplayer">ArtPlayer</el-radio>
              <el-radio label="native">原生 &lt;video&gt;</el-radio>
              <el-radio label="hlsjs" disabled>hls.js（待接入）</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="默认清晰度"><el-select v-model="q"><el-option label="自动" value="auto" /><el-option label="1080P" value="1080" /><el-option label="720P" value="720" /></el-select></el-form-item>
          <el-form-item label="自动连播下一集"><el-switch v-model="next" /></el-form-item>
          <el-form-item label="硬件解码"><el-switch v-model="hw" /></el-form-item>
        </el-form>
      </el-col>
      <el-col :span="12">
        <h3>阅读器</h3>
        <el-form label-width="140px">
          <el-form-item label="主题"><el-radio-group v-model="rtheme"><el-radio-button label="dark">暗夜</el-radio-button><el-radio-button label="sepia">护眼</el-radio-button><el-radio-button label="light">浅色</el-radio-button><el-radio-button label="green">绿豆沙</el-radio-button></el-radio-group></el-form-item>
          <el-form-item label="字号"><el-slider v-model="fz" :min="12" :max="28" show-input /></el-form-item>
          <el-form-item label="行距"><el-slider v-model="lh" :min="1.2" :max="2.4" :step="0.1" show-input /></el-form-item>
          <el-form-item label="翻页模式"><el-radio-group v-model="mode"><el-radio label="scroll">长页滚动</el-radio><el-radio label="page">左右分页</el-radio><el-radio label="tap">点击翻页</el-radio></el-radio-group></el-form-item>
        </el-form>
      </el-col>
    </el-row>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
const pl = ref<'artplayer' | 'native' | 'hlsjs'>('artplayer');
const q = ref('auto');
const next = ref(true);
const hw = ref(true);
const rtheme = ref<'dark' | 'sepia' | 'light' | 'green'>('dark');
const fz = ref(17);
const lh = ref(1.75);
const mode = ref<'scroll' | 'page' | 'tap'>('scroll');
</script>
