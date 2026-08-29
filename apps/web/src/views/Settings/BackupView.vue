<template>
  <div class="settings-section" id="sec-backup">
    <h3>💾 数据备份</h3>
    <div class="sh-sub">SQLite（桌面）/ Dexie（Web）双驱动，上层无感</div>
    <div class="setting-row">
      <div class="setting-info"><b>导出全部数据</b><span>源配置、书架、历史、阅读进度、规则</span></div>
      <div class="setting-input"><button class="btn sm">📤 导出</button></div>
    </div>
    <div class="setting-row">
      <div class="setting-info"><b>导入数据</b><span>从备份文件恢复所有数据</span></div>
      <div class="setting-input"><button class="btn sm">📥 导入</button>
      </div>
    </div>
    <div class="setting-row">
      <div class="setting-info"><b>WebDAV 同步</b><span>书源 / 书架 / 阅读进度 / 规则 · 增量同步</span></div>
      <div class="switch on"></div>
    </div>
    <div class="setting-row" style="flex-direction:column;align-items:stretch;gap:8px">
      <div class="setting-info"><b>本地数据库</b><span>SQLite + Dexie 索引 · 源/书架/历史/进度</span></div>
      <div class="setting-input col" style="width:100%">
        <div style="font-size:11.5px;color:var(--muted);width:100%;text-align:left">已用 186 MB / 512 MB</div>
        <div class="storage-bar"><i style="width:36%"></i></div>
      </div>
    </div>
    <div class="setting-row">
      <div class="setting-info"><b>缓存策略</b><span>封面 / 章节正文 / 播放直链</span></div>
      <div class="seg"><span>不缓存</span><span class="on">智能</span><span>全缓存</span></div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 数据备份设置（静态展示；状态持久化待接入）
</script>
