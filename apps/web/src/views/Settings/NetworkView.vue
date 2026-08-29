<template>
  <div class="settings-section" id="sec-network">
    <h3>🌐 网络设置</h3>
    <div class="sh-sub">请求代理、UA 伪装、并发与超时 —— 决定源的命中率</div>
    <div class="setting-row">
      <div class="setting-info"><b>HTTP 代理</b><span>Clash HTTP 7890 · 全局 / 规则分流</span></div>
      <div class="setting-input"><select>
          <option>不使用代理</option>
          <option selected>系统代理</option>
          <option>自定义代理</option>
        </select></div>
    </div>
    <div class="setting-row">
      <div class="setting-info"><b>自定义 User-Agent</b><span>模拟浏览器 UA，避免被反爬识别</span></div>
      <div class="setting-input"><input type="text" value="Mozilla/5.0 (Windows NT 10.0; Win64; x64)"></div>
    </div>
    <div class="setting-row">
      <div class="setting-info"><b>全局请求头</b><span>所有请求附加的自定义 Header</span></div>
      <div class="setting-input"><button class="btn sm">配置</button></div>
    </div>
    <div class="setting-row">
      <div class="setting-info"><b>请求超时</b><span>网络请求最长等待时间</span></div>
      <div class="setting-input"><select>
          <option>10 秒</option>
          <option selected>15 秒</option>
          <option>30 秒</option>
          <option>60 秒</option>
        </select></div>
    </div>
    <div class="setting-row">
      <div class="setting-info"><b>并发抓取上限</b><span>聚合搜索扇出并发数</span></div>
      <div class="seg"><span>4</span><span class="on">8</span><span>16</span></div>
    </div>
    <div class="setting-row">
      <div class="setting-info"><b>字符集自动纠正</b><span>GBK/Big5 源自动转 UTF-8</span></div>
      <div class="switch on"></div>
    </div>
    <div class="setting-row">
      <div class="setting-info"><b>Web 端 CORS 代理</b><span>Web 端跨域请求中转服务（需自建 server）</span></div>
      <div class="switch"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 网络设置（静态展示；状态持久化待接入）
</script>
