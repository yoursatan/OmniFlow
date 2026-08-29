<template>
  <el-row :gutter="16">
    <!-- 左栏：分组 / 源列表（宽 245px 定宽，约 el-col span=5） -->
    <el-col :span="5" class="left-col">
      <div class="left-title">{{ leftTitle }}</div>
      <el-input
        v-if="leftFilterPlaceholder"
        v-model="filter"
        size="default"
        :placeholder="leftFilterPlaceholder"
        clearable
        class="src-filter"
      >
        <template #prefix><el-icon><Search /></el-icon></template>
      </el-input>

      <!-- 有 groups 时展示分组（书架/影视） -->
      <div v-if="groups && groups.length" class="group-list">
        <div class="group-title" style="margin-top: 12px;">
          <span>分组</span>
          <el-button text size="small" :icon="Plus" class="mgmt">新建分组</el-button>
        </div>
        <div
          v-for="g in groups"
          :key="g.label"
          class="row"
          :class="{ active: groups?.[0]?.label === g.label }"
        >
          <span class="lbl">{{ g.label }}</span>
          <el-tag effect="dark" size="small" class="cnt">{{ g.count }}</el-tag>
        </div>
        <div class="divider"></div>
        <div class="row mgmt-row"><span class="lbl omni-muted">管理分组…</span></div>
      </div>

      <!-- 有 sources 时展示源列表（书院/影院/RSS） -->
      <div v-if="sources && sources.length" class="src-list">
        <div
          v-for="(s, idx) in sources"
          :key="(s as any).name + idx"
          class="row"
          :class="{ active: idx === 0 }"
        >
          <div class="row-main">
            <div class="nm">{{ (s as any).name }}</div>
            <div class="mt omni-muted">{{ (s as any).group }}</div>
          </div>
          <el-progress
            :percentage="(s as any).health"
            :stroke-width="4"
            :show-text="false"
            style="width: 60px;"
          />
        </div>
      </div>
    </el-col>

    <!-- 右栏：分类 chips + 计数 + 卡片网格 -->
    <el-col :span="19" class="right-col">
      <div class="right-head">
        <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
          <h3 style="margin:0;">{{ rightTitle }}</h3>
          <span class="omni-muted">共 {{ count }} {{ entityLabel }}</span>
          <el-tag v-for="k in kinds" :key="k" effect="plain" round class="chip">{{ k }}</el-tag>
        </div>
        <div style="display:flex; gap:8px;">
          <el-button :icon="Refresh" circle text title="刷新" />
          <el-button :icon="Sort">排序…</el-button>
          <el-button type="primary" text>移动至…</el-button>
        </div>
      </div>
      <div class="divider"></div>

      <div class="cards">
        <el-card
          v-for="n in Math.min(count, 20)"
          :key="n"
          shadow="hover"
          class="card"
        >
          <div class="cover">
            <span class="placeholder-emoji">{{ placeholderSrc }}</span>
            <div class="progress-wrap">
              <el-progress v-if="n % 3 === 0" :percentage="(n * 13) % 90 + 10" :stroke-width="3" :show-text="false" />
            </div>
          </div>
          <div class="card-body">
            <div class="card-t">示例条目 {{ n }}</div>
            <div class="card-s omni-muted">作者 / 年份 / 标签</div>
          </div>
        </el-card>
      </div>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Search, Plus, Refresh, Sort } from '@element-plus/icons-vue';

type OptStrNum = string | number;

interface GroupLike { label: string; count: number }
interface SourceLike { name: string; group: string; health: number }

defineProps<{
  leftTitle: string;
  rightTitle: string;
  leftFilterPlaceholder?: string;
  groups?: GroupLike[];
  sources?: SourceLike[];
  kinds: OptStrNum[];
  entityLabel?: string;
  count: number;
  placeholderSrc?: string;
}>();

const filter = ref('');
</script>

<style scoped>
.left-col {
  background: var(--bg-1);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 14px 12px;
  height: calc(100vh - 92px);
  min-height: 560px;
}
.left-title { font-size: 14px; font-weight: 700; margin-bottom: 10px; padding: 0 4px; }
.src-filter { margin-bottom: 8px; }
.group-title {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 4px; color: var(--muted); font-size: 11px; letter-spacing: 1.2px; text-transform: uppercase;
  margin-bottom: 6px;
}
.group-title .mgmt { letter-spacing: 0; text-transform: none; font-size: 12px; }
.row {
  padding: 8px 10px; border-radius: 7px; display: flex; align-items: center;
  cursor: pointer; margin-bottom: 2px; border: 1px solid transparent;
}
.row:hover { background: var(--bg-3); }
.row.active { background: var(--brand-soft); border-color: var(--brand); }
.row .lbl { flex: 1; }
.row .cnt { background: var(--bg-3); border-color: transparent; }
.divider { height: 1px; background: var(--border); margin: 10px 0; }
.mgmt-row { color: var(--muted); }
.src-list .row-main { flex: 1; min-width: 0; }
.src-list .nm { font-weight: 600; font-size: 13px; }
.src-list .mt { font-size: 11px; }

.right-col { display: flex; flex-direction: column; }
.right-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 4px 8px 8px 2px;
}
.chip { margin-right: 5px; }

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(175px, 1fr));
  gap: 14px;
}
.card { background: var(--bg-1); border: 1px solid var(--border); }
.card :deep(.el-card__body) { padding: 0; }
.cover {
  aspect-ratio: 3 / 4;
  background: linear-gradient(135deg, var(--bg-2), var(--bg-3));
  border-radius: var(--radius) var(--radius) 0 0;
  display: flex; align-items: center; justify-content: center;
  position: relative;
}
.placeholder-emoji { font-size: 54px; opacity: 0.7; }
.progress-wrap { position: absolute; left: 10px; right: 10px; bottom: 8px; }
.card-body { padding: 10px 12px 14px 12px; }
.card-t { font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.card-s { font-size: 11px; margin-top: 2px; }
</style>
