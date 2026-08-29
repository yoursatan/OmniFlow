<template>
  <div>
    <section class="omni-card">
      <h2>首页 · 屏 #01</h2>
      <p class="omni-muted">继续观看/阅读（进度条）、源健康度统计卡、最近活动</p>
      <el-space wrap>
        <el-tag type="info">M0 原型骨架</el-tag>
        <el-tag type="warning">真实数据 M3/M4 接入</el-tag>
        <el-tag effect="plain">Pinia → globalState.progressCards</el-tag>
      </el-space>
    </section>

    <section class="omni-card">
      <h3>源健康度（占位数据）</h3>
      <div class="omni-kgrid">
        <el-card class="kcard" shadow="never">
          <div class="k-title">书源</div>
          <div class="k-num">42 <span class="omni-muted">/ 68</span></div>
          <el-progress :percentage="62" :stroke-width="6" status="success" />
        </el-card>
        <el-card class="kcard" shadow="never">
          <div class="k-title">影视源</div>
          <div class="k-num">19 <span class="omni-muted">/ 31</span></div>
          <el-progress :percentage="61" :stroke-width="6" status="warning" />
        </el-card>
        <el-card class="kcard" shadow="never">
          <div class="k-title">RSS 订阅</div>
          <div class="k-num">7 <span class="omni-muted">/ 8</span></div>
          <el-progress :percentage="88" :stroke-width="6" status="success" />
        </el-card>
        <el-card class="kcard" shadow="never">
          <div class="k-title">直播源</div>
          <div class="k-num">1200 <span class="omni-muted">/ 1340</span></div>
          <el-progress :percentage="89" :stroke-width="6" />
        </el-card>
      </div>
    </section>

    <section class="omni-card">
      <h3>继续观看 / 阅读（原型卡）</h3>
      <div class="omni-kgrid">
        <el-card v-for="n in 4" :key="n" shadow="hover" class="continue">
          <div class="cover">{{ n < 3 ? '📖' : '🎬' }}</div>
          <div class="t">示例条目 {{ n }}</div>
          <div class="s omni-muted">{{ n < 3 ? '书架 · 第 23 章 56%' : '影视 · S01 E05 33%' }}</div>
          <el-progress :percentage="(n * 20) % 100 || 80" :stroke-width="4" :show-text="false" />
        </el-card>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
// TODO(M3/M4): 从 Pinia globalState 读取进度 + @omniflow/core repo 聚合健康度
</script>

<style scoped>
.kcard { background: var(--bg-2); border: 1px solid var(--border); }
.kcard :deep(.el-card__body) { padding: 16px 18px; }
.k-title { color: var(--muted); font-size: 12px; }
.k-num   { font-size: 24px; font-weight: 700; margin: 6px 0 10px; }
.continue { background: var(--bg-2); border: 1px solid var(--border); }
.continue :deep(.el-card__body) { padding: 14px; }
.cover {
  height: 120px; border-radius: 8px; margin-bottom: 10px;
  background: linear-gradient(135deg, var(--brand-soft), var(--bg-3));
  display: flex; align-items: center; justify-content: center; font-size: 44px;
}
.continue .t { font-weight: 600; margin-bottom: 4px; }
</style>
