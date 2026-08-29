<template>
  <div class="omni-card">
    <h2>设置 · 安全沙箱</h2>
    <p class="omni-muted">
      JS 规则的执行边界。M2 接入 <code>quickjs-emscripten</code> 作为 JS 隔离运行时，
      严格限制网络、文件、全局变量访问。
    </p>
    <el-alert type="warning" :closable="false" style="margin: 14px 0;"
      title="沙箱是 OmniFlow 最核心的安全防线"
      description="请务必不要关闭网络白名单和内存限制，除非你信任所有已导入的规则源。" />
    <el-form label-width="180px" style="max-width: 720px;">
      <el-form-item label="启用 JS 沙箱"><el-switch v-model="enabled" /></el-form-item>
      <el-form-item label="网络访问策略">
        <el-radio-group v-model="net">
          <el-radio label="whitelist">仅允许规则基址 + 白名单</el-radio>
          <el-radio label="none">全部禁止</el-radio>
          <el-radio label="open" disabled>全部允许（不推荐）</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="域名白名单（一行一个）">
        <el-input v-model="whitelist" type="textarea" :rows="5" placeholder="example.com&#10;*.cdn.example.net" />
      </el-form-item>
      <el-form-item label="单规则执行内存上限 (MB)"><el-input-number v-model="mem" :min="8" :max="512" /></el-form-item>
      <el-form-item label="单规则执行超时 (ms)"><el-input-number v-model="ms" :min="1000" :max="600000" :step="1000" /></el-form-item>
      <el-form-item label="允许调用宿主 Debugger"><el-switch v-model="debug" /></el-form-item>
    </el-form>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
const enabled = ref(true);
const net = ref<'whitelist' | 'none' | 'open'>('whitelist');
const whitelist = ref('');
const mem = ref(64);
const ms = ref(20000);
const debug = ref(true);
</script>
