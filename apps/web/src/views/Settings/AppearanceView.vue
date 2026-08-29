<template>
  <div class="omni-card">
    <h2>设置 · 外观</h2>
    <p class="omni-muted">主题、字号、密度、顶部 / 侧边栏视觉参数</p>
    <el-form label-width="140px" style="max-width: 640px; margin-top: 16px;">
      <el-form-item label="主题预设">
        <el-radio-group v-model="theme">
          <el-radio-button label="dark">Omni 暗色</el-radio-button>
          <el-radio-button label="light">浅色</el-radio-button>
          <el-radio-button label="high-contrast">高对比</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="强调色">
        <el-color-picker v-model="accent" />
      </el-form-item>
      <el-form-item label="基础字号">
        <el-slider v-model="fontSize" :min="12" :max="20" show-input />
      </el-form-item>
      <el-form-item label="紧凑密度">
        <el-switch v-model="dense" />
      </el-form-item>
      <el-form-item label="导航折叠">
        <el-switch v-model="collapse" />
      </el-form-item>
    </el-form>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
const theme  = ref<'dark' | 'light' | 'high-contrast'>('dark');
const accent = ref('#4f8cff');
const fontSize = ref(14);
const dense = ref(false);
const collapse = ref(false);
</script>
