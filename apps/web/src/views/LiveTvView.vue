<template>
  <div class="omni-card">
    <h2>直播 / IPTV · 屏 #08</h2>
    <p class="omni-muted">频道分组树、频道搜索、EPG 时间轴、收藏星标</p>

    <el-row :gutter="16" style="margin-top: 12px;">
      <el-col :span="5">
        <el-input v-model="filter" placeholder="搜索频道…" size="default" clearable>
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <el-tree
          class="tree"
          :data="groups"
          default-expand-all
          :highlight-current="true"
        />
      </el-col>
      <el-col :span="19">
        <el-alert type="info" :closable="false" style="margin-bottom: 14px;"
          title="EPG 时间轴（原型占位）：选择频道后可在 M5 阶段绘制 7×24 节目单预览" />
        <div class="omni-kgrid">
          <el-card v-for="n in 12" :key="n" shadow="never" class="ch">
            <div class="ch-live">● LIVE</div>
            <div class="ch-no">CH{{ n.toString().padStart(3, '0') }}</div>
            <div class="ch-name">频道 {{ n }}</div>
            <div class="ch-epg omni-muted">当前：节目名称 · 20:00-21:30</div>
          </el-card>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Search } from '@element-plus/icons-vue';
const filter = ref('');
const groups = [
  {
    label: '央视频道', children: [
      { label: 'CCTV-1 综合' }, { label: 'CCTV-2 财经' }, { label: 'CCTV-5 体育' }, { label: 'CCTV-6 电影' }, { label: 'CCTV-13 新闻' },
    ],
  },
  {
    label: '卫视频道', children: [
      { label: '湖南卫视' }, { label: '东方卫视' }, { label: '浙江卫视' }, { label: '江苏卫视' },
    ],
  },
  {
    label: '海外精选', children: [
      { label: 'NHK World' }, { label: 'Bloomberg TV' }, { label: 'France 24' },
    ],
  },
];
// TODO(M5): protocols.iptv 解析 M3U + XMLTV，生成频道+EPG；Dexie 持久化收藏
</script>

<style scoped>
.tree { margin-top: 10px; background: var(--bg-2); border: 1px solid var(--border); border-radius: 8px; padding: 8px; }
.ch { background: var(--bg-2); border: 1px solid var(--border); }
.ch :deep(.el-card__body) { padding: 14px; position: relative; }
.ch-live { position: absolute; top: 10px; right: 12px; color: var(--danger); font-weight: 700; font-size: 11px; letter-spacing: 0.5px; }
.ch-no { color: var(--muted); font-size: 11px; margin-bottom: 4px; }
.ch-name { font-weight: 600; font-size: 15px; margin-bottom: 6px; }
</style>
