<template>
  <div class="settings-section on" id="sec-appearance">
    <h3>🎨 外观主题</h3>
    <div class="sh-sub">界面基调、排版密度与阅读器默认纸张</div>
    <div class="setting-row">
      <div class="setting-info"><b>深色模式</b><span>跟随系统 / 手动切换</span></div>
      <div class="seg"><span class="on">深色</span><span>浅色</span><span>跟随</span></div>
    </div>
    <div class="setting-row">
      <div class="setting-info"><b>界面密度</b><span>卡片间距与网格列数</span></div>
      <div class="seg"><span>紧凑</span><span class="on">默认</span><span>宽松</span></div>
    </div>
    <div class="setting-row">
      <div class="setting-info"><b>阅读器默认纸张</b><span>新开书籍时套用的主题</span></div>
      <div class="seg"><span class="on">深色</span><span>纸黄</span><span>浅色</span><span>护眼</span></div>
    </div>
    <div class="setting-row">
      <div class="setting-info"><b>强调色</b><span>靛紫 / 青 双主色配比</span></div>
      <div class="seg"><span class="on">靛紫主</span><span>青主</span><span>均衡</span></div>
    </div>
    <div class="setting-row">
      <div class="setting-info"><b>减弱动效</b><span>关闭翻页/淡入动画，降低眩晕</span></div>
      <div class="switch"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 外观主题设置（静态展示；状态持久化待接入 Pinia / localStorage）
</script>
