<template>
  <div class="settings-section" id="sec-media">
    <h3>▶ 播放与阅读</h3>
    <div class="sh-sub">ArtPlayer 与阅读排版内核的默认行为</div>
    <div class="setting-row">
      <div class="setting-info"><b>默认播放器内核</b><span>ArtPlayer + hls.js / dash.js / flv.js</span></div>
      <div class="setting-input"><select>
          <option selected>ArtPlayer（推荐）</option>
          <option>系统原生</option>
          <option>外部播放器</option>
        </select></div>
    </div>
    <div class="setting-row">
      <div class="setting-info"><b>自动连播</b><span>片尾 5 秒倒计时自动进入下一集</span></div>
      <div class="switch on"></div>
    </div>
    <div class="setting-row">
      <div class="setting-info"><b>播放前嗅探</b><span>网页嗅探真实 m3u8 / mp4 直链</span></div>
      <div class="switch on"></div>
    </div>
    <div class="setting-row">
      <div class="setting-info"><b>默认解析接口</b><span>仓库不内置任何解析地址，需自行配置</span></div>
      <div class="setting-input"><select>
          <option selected>JSON 池-A</option>
          <option>嗅探模式</option>
          <option>极速解析</option>
        </select></div>
    </div>
    <div class="setting-row">
      <div class="setting-info"><b>阅读正文字号</b><span>阅读器默认字号 / 行距</span></div>
      <div class="seg"><span>小</span><span class="on">中</span><span>大</span></div>
    </div>
    <div class="setting-row">
      <div class="setting-info"><b>翻页动画</b><span>仿真翻页 / 滚动 / 无动画</span></div>
      <div class="seg"><span class="on">仿真翻页</span><span>滚动</span><span>无</span></div>
    </div>
    <div class="setting-row">
      <div class="setting-info"><b>TTS 朗读</b><span>Web Speech API / 桌面系统 TTS</span></div>
      <div class="switch"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 播放与阅读设置（静态展示；状态持久化待接入）
</script>
