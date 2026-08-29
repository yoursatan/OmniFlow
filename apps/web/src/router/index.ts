import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router';

import MainLayout from '@/layouts/MainLayout.vue';

import DashboardView     from '@/views/DashboardView.vue';
import SearchView        from '@/views/SearchView.vue';
import BookShelfView     from '@/views/BookShelfView.vue';
import VideoLibraryView  from '@/views/VideoLibraryView.vue';
import AcademyView       from '@/views/Discovery/AcademyView.vue';
import CinemaView        from '@/views/Discovery/CinemaView.vue';
import RssView           from '@/views/Discovery/RssView.vue';
import LiveTvView        from '@/views/LiveTvView.vue';
import RuleWorkshopView  from '@/views/RuleWorkshopView.vue';
import SourceManagerView from '@/views/SourceManagerView.vue';

import SettingsIndexView      from '@/views/Settings/IndexView.vue';
import SettingsAppearanceView from '@/views/Settings/AppearanceView.vue';
import SettingsNetworkView    from '@/views/Settings/NetworkView.vue';
import SettingsSandboxView    from '@/views/Settings/SandboxView.vue';
import SettingsBackupView     from '@/views/Settings/BackupView.vue';
import SettingsPlaybackView   from '@/views/Settings/PlaybackView.vue';
import SettingsAboutView      from '@/views/Settings/AboutView.vue';

import VideoDetailView   from '@/views/VideoDetailView.vue';
import PlayerView        from '@/views/PlayerView.vue';
import ReaderView        from '@/views/ReaderView.vue';
import ComicReaderView   from '@/views/ComicReaderView.vue';

/**
 * 路由表 = 开发规划 §11.5 全部 15 屏 + 设置 6 子分区
 *  - 01 首页 / 02 搜索 / 03 书架 / 04 影视
 *  - 05 书院 / 06 影院 / 07 RSS / 08 直播
 *  - 09 规则工坊 / 10 源管理 / 11 设置 (×6 子分区)
 *  - 12 影片详情 / 13 播放器 / 14 阅读器 / 15 漫画阅读器
 */
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: MainLayout,
    children: [
      // ---------- 01 首页 ----------
      { path: '', name: 'dashboard', component: DashboardView, meta: { title: '首页 · 继续观看/阅读 + 源健康度' } },

      // ---------- 02 搜索 ----------
      { path: 'search', name: 'search', component: SearchView, meta: { title: '跨源搜索' } },

      // ---------- 我的库 ----------
      // 03 书架
      { path: 'bookshelf', name: 'bookshelf', component: BookShelfView, meta: { title: '书架' } },
      // 04 影视
      { path: 'video-lib', name: 'video-lib', component: VideoLibraryView, meta: { title: '影视库' } },

      // ---------- 全源发现 ----------
      // 05 书院
      { path: 'discovery/books', name: 'discovery-books', component: AcademyView, meta: { title: '书院 · 书源发现' } },
      // 06 影院
      { path: 'discovery/video', name: 'discovery-video', component: CinemaView, meta: { title: '影院 · 影视源发现' } },
      // 07 RSS
      { path: 'discovery/rss', name: 'discovery-rss', component: RssView, meta: { title: 'RSS 订阅发现' } },
      // 08 直播
      { path: 'live', name: 'live', component: LiveTvView, meta: { title: '直播 / IPTV' } },

      // ---------- 工具 ----------
      // 09 规则工坊（子视图：可直接通过 /workshop 进入，编辑时带 ?sourceId=xxx）
      { path: 'workshop', name: 'workshop', component: RuleWorkshopView, meta: { title: '规则工坊 · 段-步 v2 编辑器' } },
      // 10 源管理
      { path: 'source-mgr', name: 'source-mgr', component: SourceManagerView, meta: { title: '源管理' } },

      // ---------- 11 设置（6 子分区）----------
      {
        path: 'settings',
        component: SettingsIndexView,
        redirect: '/settings/appearance',
        children: [
          { path: 'appearance', name: 'settings-appearance', component: SettingsAppearanceView, meta: { title: '设置 · 外观' } },
          { path: 'network',    name: 'settings-network',    component: SettingsNetworkView,    meta: { title: '设置 · 网络' } },
          { path: 'sandbox',    name: 'settings-sandbox',    component: SettingsSandboxView,    meta: { title: '设置 · 安全沙箱' } },
          { path: 'backup',     name: 'settings-backup',     component: SettingsBackupView,     meta: { title: '设置 · 数据备份' } },
          { path: 'playback',   name: 'settings-playback',   component: SettingsPlaybackView,   meta: { title: '设置 · 播放与阅读' } },
          { path: 'about',      name: 'settings-about',      component: SettingsAboutView,      meta: { title: '设置 · 关于 OmniFlow' } },
        ],
      },

      // ---------- 12 影片详情 / 13 播放器 / 14 阅读器 / 15 漫画 ----------
      { path: 'video/:id',  name: 'video-detail', component: VideoDetailView, meta: { title: '影片详情' }, props: true },
      { path: 'player/:id', name: 'player',       component: PlayerView,      meta: { title: '播放器' },   props: true },
      { path: 'reader/:id', name: 'reader',       component: ReaderView,      meta: { title: '阅读器' },   props: true },
      { path: 'comic/:id',  name: 'comic',        component: ComicReaderView, meta: { title: '漫画阅读器' }, props: true },
    ],
  },

  { path: '/:pathMatch(.*)*', redirect: '/' },
];

const router = createRouter({
  history: createWebHashHistory(), // Hash 模式：开发期直接 file:// 打开也能跑；部署可改 history
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

router.afterEach((to) => {
  const t = (to.meta?.title as string) || '汇流 OmniFlow';
  if (typeof document !== 'undefined') document.title = `${t} · 汇流 OmniFlow`;
});

export default router;
