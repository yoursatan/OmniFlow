<template>
  <div class="omni-card">
    <div style="display:flex; align-items:center; gap:12px; margin-bottom: 10px;">
      <h2 style="margin:0; flex:1;">源管理 · 屏 #10</h2>
      <el-button :icon="Upload">导入源</el-button>
      <el-button :icon="MagicStick">导入向导</el-button>
      <el-button type="primary" :icon="Plus" @click="$router.push('/workshop')">新建源 → 规则工坊</el-button>
    </div>
    <p class="omni-muted">分类筛选、健康度条、启用滑块、编辑（→ 规则工坊）/ 删除</p>

    <el-row style="margin: 14px 0;" :gutter="12">
      <el-col :span="6">
        <el-select v-model="kindFilter" placeholder="按源范式" clearable style="width:100%">
          <el-option v-for="k in ['Legado 书源 A','JS 源 B','TVBox / CMS C','IPTV D','RSS']" :key="k" :label="k" :value="k" />
        </el-select>
      </el-col>
      <el-col :span="6">
        <el-select v-model="groupFilter" placeholder="按分组" clearable style="width:100%">
          <el-option v-for="g in ['默认分组','影视分组','自建','社区分享','订阅']" :key="g" :label="g" :value="g" />
        </el-select>
      </el-col>
      <el-col :span="6">
        <el-select v-model="healthFilter" placeholder="健康度" clearable style="width:100%">
          <el-option label="健康 >= 80" value="ok" />
          <el-option label="一般 40-80" value="mid" />
          <el-option label="不健康 <40" value="bad" />
        </el-select>
      </el-col>
      <el-col :span="6">
        <el-input v-model="kw" placeholder="搜索源名 / key" clearable>
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
      </el-col>
    </el-row>

    <el-table :data="rows" stripe style="width: 100%;">
      <el-table-column prop="enabled" label="启用" width="72" align="center">
        <template #default="{ row }">
          <el-switch v-model="row.enabled" inline-prompt />
        </template>
      </el-table-column>
      <el-table-column label="源" min-width="220">
        <template #default="{ row }">
          <div style="font-weight:600;">{{ row.name }}</div>
          <div class="omni-muted" style="font-size:11px;">key: {{ row.key }} · {{ row.baseUrl }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="kind" label="范式" width="130">
        <template #default="{ row }"><el-tag size="small" effect="plain">{{ row.kind }}</el-tag></template>
      </el-table-column>
      <el-table-column prop="group" label="分组" width="130" />
      <el-table-column label="健康度" width="180">
        <template #default="{ row }">
          <el-progress :percentage="row.health" :color="row.health>=80?'#32c787':row.health>=40?'#f1b14a':'#ef5d60'" :stroke-width="7" />
        </template>
      </el-table-column>
      <el-table-column prop="lastRun" label="上次运行" width="170" />
      <el-table-column label="操作" width="180" fixed="right" align="right">
        <template #default>
          <el-button size="small" text type="primary" @click="$router.push('/workshop')">编辑</el-button>
          <el-button size="small" text>体检</el-button>
          <el-button size="small" text type="danger">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Upload, MagicStick, Plus, Search } from '@element-plus/icons-vue';
const kindFilter = ref('');
const groupFilter = ref('');
const healthFilter = ref('');
const kw = ref('');
const rows = [
  { enabled: true,  name: '演示书源',       key: 'demo-book-source', baseUrl: 'https://example.com',    kind: 'Legado A',  group: '默认分组', health: 94, lastRun: '2026-08-29 10:21' },
  { enabled: true,  name: '某 CMS 影视配置', key: 'cms-movies-1',     baseUrl: 'https://cms.example.net', kind: 'TVBox C',   group: '影视分组', health: 76, lastRun: '2026-08-29 10:19' },
  { enabled: false, name: '第三方 B (旧)',   key: 'legacy-old-1',     baseUrl: 'https://old.example.org', kind: 'JS 源 B',   group: '社区分享', health: 28, lastRun: '2026-08-20 00:00' },
  { enabled: true,  name: 'InfoQ RSS',       key: 'rss-infoq-cn',     baseUrl: 'https://feed.infoq.cn',  kind: 'RSS',       group: '订阅',     health: 100, lastRun: '2026-08-29 09:00' },
];
// TODO(M1/M2): sourceManager store 对接 @omniflow/core repo；批量体检走 engine.run + 健康度加权
</script>
