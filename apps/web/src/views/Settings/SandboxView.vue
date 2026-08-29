<template>
  <div class="settings-section" id="sec-sandbox">
    <h3>🔒 安全沙箱</h3>
    <div class="sh-sub">QuickJS-WASM 隔离执行用户脚本，双端同构</div>
    <div class="setting-row">
      <div class="setting-info"><b>JS 脚本沙箱</b><span>启用后，所有用户 JS 在隔离沙箱中执行</span></div>
      <div class="switch on"></div>
    </div>
    <div class="setting-row">
      <div class="setting-info"><b>脚本执行超时</b><span>单条 JS 脚本最长 CPU 时间，防死循环</span></div>
      <div class="setting-input"><select>
          <option>3 秒</option>
          <option selected>5 秒</option>
          <option>10 秒</option>
          <option>30 秒</option>
        </select></div>
    </div>
    <div class="setting-row">
      <div class="setting-info"><b>沙箱内存限制</b><span>单个 JS 实例可使用的最大内存</span></div>
      <div class="setting-input"><select>
          <option>32 MB</option>
          <option selected>64 MB</option>
          <option>128 MB</option>
          <option>256 MB</option>
        </select></div>
    </div>
    <div class="setting-row">
      <div class="setting-info"><b>禁止危险 API</b><span>阻止脚本访问 process / window / 本地文件</span></div>
      <div class="switch on"></div>
    </div>
    <div class="setting-row">
      <div class="setting-info"><b>网络请求白名单</b><span>脚本内 fetch 仅允许访问源自身域名</span></div>
      <div class="switch"></div>
    </div>
    <div class="setting-row">
      <div class="setting-info"><b>同步阻塞桥</b><span>hiker / drpy 同步 req() 支持（Atomics.wait 桥）</span></div>
      <div class="switch on"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 安全沙箱设置（静态展示；状态持久化待接入）
</script>
