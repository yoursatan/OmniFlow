<template>
  <div class="omni-card">
    <h2>设置 · 网络</h2>
    <p class="omni-muted">代理、并发、超时、User-Agent、CookieJar</p>
    <el-form label-width="160px" style="max-width: 720px; margin-top: 16px;">
      <el-form-item label="HTTP 代理">
        <el-input v-model="proxy" placeholder="http://127.0.0.1:7890" />
      </el-form-item>
      <el-form-item label="并发数">
        <el-input-number v-model="concurrency" :min="1" :max="32" />
      </el-form-item>
      <el-form-item label="单请求超时 (ms)">
        <el-input-number v-model="timeout" :min="1000" :max="120000" :step="1000" />
      </el-form-item>
      <el-form-item label="自定义 UA">
        <el-input v-model="ua" type="textarea" :rows="2" />
      </el-form-item>
      <el-form-item label="启用 CookieJar">
        <el-switch v-model="jar" />
      </el-form-item>
      <el-form-item label="自动重试">
        <el-input-number v-model="retries" :min="0" :max="10" />
      </el-form-item>
    </el-form>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
const proxy = ref('');
const concurrency = ref(6);
const timeout = ref(15000);
const ua = ref('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36');
const jar = ref(true);
const retries = ref(2);
// TODO(M2): 下传到 @omniflow/core/http 适配器
</script>
