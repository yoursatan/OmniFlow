import { defineStore } from 'pinia';
import { ref } from 'vue';

/**
 * 全局 UI 状态：导航折叠、主题 Token、用户信息、顶部进度。
 * TODO(M1): 持久化到 localStorage；和 Settings 各分区 store 打通
 */
export const useGlobalState = defineStore('globalState', () => {
  // ---- 导航与布局 ----
  const navCollapsed = ref(false);
  const headerHeight = ref(52);

  // ---- 主题（与 CSS vars 对应；M1 写切换函数 applyTheme()）----
  const theme = ref<'dark' | 'light' | 'sepia' | 'green' | 'high-contrast'>('dark');
  const accentColor = ref('#4f8cff');
  const baseFontSize = ref(14);
  const dense = ref(false);

  // ---- 继续观看 / 阅读（首页 01 用；M3/M4 接 repo）----
  type ProgressCard = {
    id: string;
    title: string;
    kind: 'book' | 'video' | 'comic' | 'article';
    cover?: string;
    percent: number;
    chapter?: string;
    gotoPath: string;
  };
  const progressCards = ref<ProgressCard[]>([]);

  // ---- 源健康度统计（SourceManager 聚合后写入；M1 接 core.healthCheckSummary）----
  const healthSummary = ref<{ book: number; video: number; rss: number; live: number }>({
    book: 0, video: 0, rss: 0, live: 0,
  });

  // ---- 用户（M0 空壳）----
  const user = ref<{ id: string; name: string; avatar?: string } | null>(null);

  function toggleNav() {
    navCollapsed.value = !navCollapsed.value;
  }

  function applyTheme(next: typeof theme.value) {
    theme.value = next;
    // M1: document.documentElement.setAttribute('data-theme', next);
  }

  return {
    navCollapsed, headerHeight,
    theme, accentColor, baseFontSize, dense,
    progressCards, healthSummary,
    user,
    toggleNav, applyTheme,
  };
});
