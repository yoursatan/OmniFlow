<template>
  <div class="bs-layout">
    <div class="bs-side card">
      <div class="bs-head">影视分组</div>
      <div class="bs-sep"></div>
      <div class="bs-body">
        <div class="bs-sec">收藏</div>
        <div
          v-for="g in groups"
          :key="g.id"
          class="bs-group"
          :class="{ on: activeGroup === g.id }"
          @click="activeGroup = g.id"
        >
          <span class="g-ic">{{ g.icon }}</span>
          <span class="g-n">{{ g.name }}</span>
          <span class="g-cnt">{{ g.count }}</span>
        </div>
        <div class="bs-sec">历史</div>
        <div
          class="bs-group"
          :class="{ on: activeGroup === 'history' }"
          @click="activeGroup = 'history'"
        >
          <span class="g-ic">≡</span>
          <span class="g-n">观看历史</span>
          <span class="g-cnt">{{ historyCount }}</span>
        </div>
        <div class="bs-new" @click="noop">+ 新建分组</div>
      </div>
      <div class="bs-sep"></div>
      <div class="bs-foot">
        <button class="btn sm ghost" style="width:100%" @click="noop">管理分组</button>
      </div>
    </div>
    <div class="bs-main card">
      <div class="bs-header">
        <div class="bs-toolbar">
          <div class="bs-title">{{ activeGroupName }} <span class="tag green">{{ filteredMovies.length }}部</span></div>
          <div class="sort-chip" :class="{ on: type === 'all' }" @click="type = 'all'">全部</div>
          <div class="sort-chip" :class="{ on: type === '剧集' }" @click="type = '剧集'">剧集</div>
          <div class="sort-chip" :class="{ on: type === '电影' }" @click="type = '电影'">电影</div>
          <div class="sort-chip" :class="{ on: type === '动漫' }" @click="type = '动漫'">动漫</div>
          <div class="sort-chip" :class="{ on: type === '纪录片' }" @click="type = '纪录片'">纪录片</div>
          <div class="sort-chip" :class="{ on: sort === 'recent' }" @click="sort = 'recent'">最近</div>
          <div class="sort-chip" :class="{ on: sort === 'name' }" @click="sort = 'name'">标题</div>
          <div class="sort-chip" :class="{ on: sort === 'progress' }" @click="sort = 'progress'">进度</div>
        </div>
        <div class="bs-sep"></div>
      </div>
      <div class="book-grid">
        <div v-if="!filteredMovies.length" class="empty">该筛选下暂无内容</div>
        <div v-for="m in filteredMovies" :key="m.id" class="book-card">
          <div class="poster" :class="m.cover">
            <div class="ph">
              <div class="t">{{ m.title }}</div>
              <div class="s">{{ m.source }}</div>
            </div>
          </div>
          <div class="nm">{{ m.title }}</div>
          <div class="st">{{ m.source }} · {{ m.type }} · {{ m.time }}</div>
          <div class="prog-line"><i :style="{ width: m.progress + '%' }"></i></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const noop = () => {};
const activeGroup = ref('all');
const type = ref('all');
const sort = ref('recent');

interface VideoGroup { id: string; name: string; icon: string; count: number }
interface Movie {
  id: number; title: string; source: string; type: string;
  progressText: string; time: string; group: string; cover: string;
  mark: string; progress: number;
}

const groups: VideoGroup[] = [
  { id: 'all', name: '全部收藏', icon: '≡', count: 7 },
  { id: '未分组', name: '未分组', icon: '○', count: 3 },
  { id: '追剧', name: '追剧', icon: '▣', count: 2 },
  { id: '动漫', name: '动漫', icon: '▣', count: 2 },
  { id: '纪录片', name: '纪录片', icon: '▣', count: 1 },
];

const movies: Movie[] = [
  { id: 1, title: '漫长的季节', source: '量子资源', type: '剧集', progressText: '看到 08/30 集 · 62%', time: '2 小时前', group: '追剧', cover: 'p5', mark: 'fav', progress: 62 },
  { id: 2, title: '流浪地球 2', source: '量子资源', type: '电影', progressText: '34:12 / 2:53:00 · 22%', time: '昨天', group: '未分组', cover: 'p3', mark: 'fav', progress: 22 },
  { id: 3, title: '三体 · 动画版', source: '非凡CMS', type: '动漫', progressText: '第 24/30 话 · 81%', time: '3 天前', group: '动漫', cover: 'p7', mark: 'fav', progress: 81 },
  { id: 4, title: '宇宙探索编辑部', source: '卧龙CMS', type: '电影', progressText: '已看完', time: '5 天前', group: '未分组', cover: 'p2', mark: 'fav', progress: 100 },
  { id: 5, title: '爱死机 S3', source: '海阔JS', type: '动漫', progressText: '45%', time: '1 周前', group: '动漫', cover: 'p1', mark: 'fav', progress: 45 },
  { id: 6, title: '大明王朝 1566', source: '量子资源', type: '剧集', progressText: '第 6/46 集 · 13%', time: '2 周前', group: '追剧', cover: 'p4', mark: 'fav', progress: 13 },
  { id: 7, title: '风味人间 S2', source: '非凡CMS', type: '纪录片', progressText: '60%', time: '3 周前', group: '纪录片', cover: 'p6', mark: 'fav', progress: 60 },
  { id: 8, title: '狂飙', source: '量子资源', type: '剧集', progressText: '已看完', time: '4 天前', group: '未分组', cover: 'p2', mark: 'hist', progress: 100 },
  { id: 9, title: '漫长的季节', source: '卧龙CMS', type: '剧集', progressText: '15%', time: '昨天', group: '未分组', cover: 'p5', mark: 'hist', progress: 15 },
  { id: 10, title: '流浪地球 2', source: '非凡CMS', type: '电影', progressText: '100%', time: '上周', group: '未分组', cover: 'p3', mark: 'hist', progress: 100 },
  { id: 11, title: '中国奇谭', source: '海阔JS', type: '动漫', progressText: '第 4/8 话 · 50%', time: '3 天前', group: '未分组', cover: 'p1', mark: 'hist', progress: 50 },
  { id: 12, title: '舌尖上的中国', source: '非凡CMS', type: '纪录片', progressText: '80%', time: '2 周前', group: '未分组', cover: 'p6', mark: 'hist', progress: 80 },
];

const historyCount = movies.filter(m => m.mark === 'hist').length;

const activeGroupName = computed(() => {
  if (activeGroup.value === 'history') return '观看历史';
  const g = groups.find(x => x.id === activeGroup.value);
  return g ? '收藏 · ' + g.name : '收藏';
});

const filteredMovies = computed(() => {
  let list: Movie[];
  if (activeGroup.value === 'history') list = movies.filter(m => m.mark === 'hist');
  else if (activeGroup.value === 'all') list = movies.filter(m => m.mark === 'fav');
  else list = movies.filter(m => m.mark === 'fav' && m.group === activeGroup.value);

  if (type.value !== 'all') list = list.filter(m => m.type === type.value);

  if (sort.value === 'recent') list = list.slice().sort((a, b) => a.id - b.id);
  else if (sort.value === 'name') list = list.slice().sort((a, b) => a.title.localeCompare(b.title, 'zh'));
  else if (sort.value === 'progress') list = list.slice().sort((a, b) => b.progress - a.progress);

  return list;
});
</script>

<style scoped>
.bs-layout { display: flex; gap: 18px; height: calc(100vh - 100px); }
.bs-side { width: 245px; flex-shrink: 0; padding: 14px 10px; display: flex; flex-direction: column; overflow-y: auto; }
.bs-head { font-size: 15px; font-weight: 700; padding: 0 6px 10px; flex-shrink: 0; }
.bs-sep { height: 1px; background: var(--line); flex-shrink: 0; }
.bs-side .bs-sep { margin: 0 -10px; }
.bs-body { flex: 1; overflow-y: auto; padding: 8px 2px; min-height: 0; }
.bs-foot { padding-top: 10px; flex-shrink: 0; }
.bs-new { display: flex; align-items: center; gap: 6px; padding: 8px 6px; border-radius: 7px; cursor: pointer; font-size: 12px; color: var(--faint); transition: all .15s; margin-top: 2px; }
.bs-new:hover { color: var(--text); background: var(--bg3); }
.bs-sec { font-size: 10px; color: var(--faint); letter-spacing: 1.5px; padding: 10px 6px 4px; }
.bs-group { display: flex; align-items: center; gap: 8px; padding: 8px 10px; border-radius: 8px; cursor: pointer; font-size: 13px; color: #c4cad8; transition: background .15s; margin-bottom: 2px; }
.bs-group:hover { background: var(--bg3); }
.bs-group.on { background: linear-gradient(90deg, rgba(108,124,255,.22), rgba(108,124,255,.08)); color: #fff; box-shadow: inset 2px 0 0 var(--acc); }
.bs-group .g-ic { width: 16px; text-align: center; opacity: .8; }
.bs-group .g-n { flex: 1; }
.bs-group .g-cnt { font-family: var(--mono); font-size: 10px; color: var(--muted); background: var(--bg4); padding: 1px 7px; border-radius: 10px; }
.bs-main { flex: 1; min-width: 410px; display: flex; flex-direction: column; overflow-y: auto; padding: 0; }
.bs-header { padding: 14px 16px 0; flex-shrink: 0; display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.bs-header .bs-sep { margin: 12px -16px 0; }
.bs-toolbar { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.bs-title { font-size: 15px; font-weight: 700; }
.sort-chip { font-size: 12px; padding: 5px 12px; border-radius: 8px; background: var(--bg2); border: 1px solid var(--line); color: var(--muted); cursor: pointer; }
.sort-chip:hover { color: var(--text); }
.sort-chip.on { background: rgba(108,124,255,.16); border-color: var(--acc-dim); color: #fff; }
.book-grid { flex: 1; overflow-y: auto; padding: 14px 16px; min-height: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(132px, 1fr)); gap: 14px; }
.book-card { position: relative; cursor: pointer; }
.book-card .poster { width: 100%; }
.book-card .nm { font-size: 12.5px; margin-top: 8px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.book-card .st { font-size: 11px; color: var(--faint); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.prog-line { height: 3px; border-radius: 2px; background: var(--bg4); margin-top: 6px; overflow: hidden; }
.prog-line i { display: block; height: 100%; background: linear-gradient(90deg, var(--acc), var(--cy)); }
</style>
