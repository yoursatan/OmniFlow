<template>
  <el-container class="omni-root">
    <!-- 左侧导航（11 主入口，对应开发规划 §11.4 / §11.5 主 11 屏） -->
    <el-aside :width="NAV_W" class="omni-nav">
      <div class="brand">
        <span class="logo-dot" />
        <div class="brand-text">
          <div class="name">汇流 OmniFlow</div>
          <div class="sub">全源媒体聚合 · 规则引擎</div>
        </div>
      </div>

      <el-menu
        :default-active="route.path"
        router
        class="nav-menu"
        background-color="transparent"
        text-color="var(--text-1)"
        active-text-color="#ffffff"
      >
        <template v-for="g in groups" :key="g.title || 'default'">
          <div v-if="g.title" class="menu-group">{{ g.title }}</div>
          <el-menu-item
            v-for="item in g.items"
            :key="item.path"
            :index="item.path"
          >
            <el-icon><component :is="item.icon" /></el-icon>
            <template #title>
              <span class="nav-label">{{ item.label }}</span>
              <el-tag
                v-if="item.badge"
                size="small"
                type="warning"
                effect="dark"
                class="badge"
              >{{ item.badge }}</el-tag>
            </template>
          </el-menu-item>
        </template>
      </el-menu>

      <div class="nav-footer">
        <div>v0.1.0 · M0 空壳</div>
      </div>
    </el-aside>

    <el-container class="omni-main">
      <el-header class="omni-header" :height="HEADER_H">
        <div class="crumb">
          <el-icon><Location /></el-icon>
          <span class="crumb-text">{{ currentTitle }}</span>
        </div>

        <el-input
          v-model="keyword"
          placeholder="跨源搜索书籍 / 影视 / 文章 / 直播… (原型)"
          clearable
          class="global-search"
          @keyup.enter="goSearch"
        >
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>

        <div class="header-actions">
          <el-tooltip content="新建源（跳转规则工坊）" placement="bottom">
            <el-button type="primary" :icon="Plus" circle @click="$router.push('/workshop')" />
          </el-tooltip>
          <el-tooltip content="设置" placement="bottom">
            <el-button :icon="Setting" circle text @click="$router.push('/settings')" />
          </el-tooltip>
          <el-avatar :size="30" class="avatar" shape="square">U</el-avatar>
        </div>
      </el-header>

      <el-main class="omni-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  DataAnalysis, Search, Reading, Film, Odometer, Monitor,
  EditPen, Management, Setting, Location, Plus
} from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();

const NAV_W = '240px';
const HEADER_H = 52;

type NavItem = { path: string; label: string; icon: unknown; badge?: string };
const groups: Array<{ title: string; items: NavItem[] }> = [
  {
    title: '',
    items: [
      { path: '/',            label: '首页',       icon: DataAnalysis },
      { path: '/search',      label: '跨源搜索',   icon: Search },
    ],
  },
  {
    title: '我的库',
    items: [
      { path: '/bookshelf',   label: '书架', icon: Reading },
      { path: '/video-lib',   label: '影视', icon: Film },
    ],
  },
  {
    title: '全源发现',
    items: [
      { path: '/discovery/books', label: '书院·书源',   icon: Odometer },
      { path: '/discovery/video', label: '影院·影视源', icon: Film },
      { path: '/discovery/rss',   label: 'RSS 订阅',    icon: Reading, badge: 'Beta' },
      { path: '/live',            label: '直播 / IPTV', icon: Monitor },
    ],
  },
  {
    title: '工具',
    items: [
      { path: '/workshop',      label: '规则工坊', icon: EditPen, badge: 'WIP' },
      { path: '/source-mgr',    label: '源管理',   icon: Management },
      { path: '/settings',      label: '设置',     icon: Setting },
    ],
  },
];

const flat = groups.flatMap((g) => g.items);
const currentTitle = computed(() => flat.find((i) => i.path === route.path)?.label ?? '汇流 OmniFlow');

const keyword = ref((route.query.q as string) || '');
function goSearch() {
  void router.push({ path: '/search', query: keyword.value ? { q: keyword.value } : {} });
}
</script>

<style scoped>
.omni-root { height: 100%; background: var(--bg-0); }

.omni-nav {
  background: var(--bg-1);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.brand { padding: 18px 16px 12px 16px; display: flex; align-items: center; gap: 12px; }
.logo-dot {
  width: 34px; height: 34px; border-radius: 9px;
  background: linear-gradient(135deg, var(--brand), var(--accent));
  box-shadow: 0 4px 10px rgba(79, 140, 255, 0.35);
}
.brand-text { line-height: 1.2; }
.brand-text .name { font-weight: 700; font-size: 15px; letter-spacing: 0.5px; }
.brand-text .sub  { color: var(--muted); font-size: 11px; margin-top: 3px; }

.nav-menu { border-right: 0; padding: 6px 8px; }
.nav-menu :deep(.el-menu-item) {
  border-radius: 8px;
  margin-bottom: 2px;
  height: 40px;
  line-height: 40px;
}
.nav-menu :deep(.el-menu-item.is-active) {
  background: var(--brand-soft) !important;
  color: #fff;
}
.nav-label { display: inline-flex; align-items: center; gap: 8px; }
.menu-group {
  padding: 12px 16px 4px 16px;
  color: var(--muted);
  font-size: 11px;
  letter-spacing: 1.4px;
  text-transform: uppercase;
}
.badge { margin-left: auto; }
.nav-footer {
  margin-top: auto;
  padding: 10px 16px;
  color: var(--muted);
  font-size: 11px;
  border-top: 1px solid var(--border);
}

.omni-main { display: flex; flex-direction: column; min-width: 0; }
.omni-header {
  background: var(--bg-1);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 0 20px;
}
.crumb { display: flex; align-items: center; gap: 8px; color: var(--text-1); min-width: 140px; }
.crumb-text { font-weight: 600; color: var(--text-0); }
.global-search { flex: 1; max-width: 640px; }
.header-actions { margin-left: auto; display: flex; align-items: center; gap: 10px; }
.avatar { background: var(--brand-soft); color: var(--brand); font-weight: 700; }

.omni-content {
  padding: 20px 24px;
  background: var(--bg-0);
  overflow: auto;
  height: calc(100vh - 52px);
}
</style>
