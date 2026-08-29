<template>
  <div class="disc-layout">
    <div class="disc-main card">
      <div class="search-header">
        <div class="searchbar">
          <input v-model="q" placeholder="输入片名 / 书名，Enter 发起跨源聚合搜索" @keyup.enter="runSearch">
          <button class="btn primary" @click="runSearch">⌕ 聚合搜索</button>
        </div>
        <div class="catbar" style="margin-top:2px">
          <span class="cat-label">源分类</span>
          <div v-for="k in kinds" :key="k.key" class="cat-chip" :class="{ on: activeKind === k.key }"
            @click="activeKind = k.key">
            {{ k.label }} <span class="n">{{ k.count }}</span>
          </div>
        </div>
        <div class="sr-meta">
          <span class="pulse"></span>聚合 <b style="color:var(--cy)">87</b> 个源 · 归并
          <b style="color:var(--cy)">{{ results.length }}</b> 组结果 · {{ elapsed }}（渐进渲染）
        </div>
      </div>
      <div class="disc-sep"></div>
      <div class="disc-content">
        <div v-for="r in results" :key="r.id" class="sr-item" @click="$router.push('/video/' + r.id)">
          <div class="poster" :class="r.poster"></div>
          <div class="body">
            <h3>{{ r.title }}
              <span v-for="t in r.tags" :key="t.text" class="tag" :class="t.cls">{{ t.text }}</span>
            </h3>
            <div class="desc">{{ r.desc }}</div>
            <div class="src-chips">
              <span v-for="s in r.sources" :key="s.name" class="src-chip" :class="s.status">
                <span class="dot"></span>{{ s.name }}<span class="ms">{{ s.ms }}</span>
              </span>
              <span class="switch-src">⇄ 换源 {{ r.sources.length }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const q = ref((route.query.q as string) || '三体');
const activeKind = ref('all');
const elapsed = '1.8s';
const kinds = [
  { key: 'all', label: '全部', count: 87 },
  { key: 'video', label: '影视源', count: 23 },
  { key: 'book', label: '书源', count: 41 },
  { key: 'comic', label: '漫画源', count: 8 },
  { key: 'rss', label: 'RSS', count: 9 },
  { key: 'live', label: '直播源', count: 6 },
];
const results = [
  {
    id: 1, title: '三体', poster: 'p5',
    tags: [{ text: '9.4', cls: 'gold' }, { text: '30 集', cls: '' }, { text: '科幻', cls: '' }, { text: '2023', cls: '' }],
    desc: '纳米材料学家汪淼被警察史强带到联合作战中心，参与侦破一起科学家连环自杀案件。倒计时的尽头是什么？幽灵倒计时、科学边界、三日凌空……一个宏大的宇宙图景在人类面前徐徐展开。',
    sources: [
      { name: '量子资源', status: 'ok', ms: '180ms' },
      { name: '非凡CMS', status: 'ok', ms: '220ms' },
      { name: '蓝光影院', status: 'slow', ms: '1.2s' },
      { name: '快手影视', status: 'dead', ms: '超时' },
    ],
  },
  {
    id: 2, title: '三体 · 动画版', poster: 'p7',
    tags: [{ text: '8.1', cls: 'gold' }, { text: '动画', cls: '' }, { text: '2022', cls: '' }],
    desc: '改编自刘慈欣科幻巨著《三体》的动画剧集，讲述人类文明面对三体世界入侵时的生存抉择与宇宙博弈。',
    sources: [
      { name: '非凡CMS', status: 'ok', ms: '195ms' },
      { name: '量子资源', status: 'ok', ms: '240ms' },
      { name: '蓝光影院', status: 'ok', ms: '310ms' },
    ],
  },
  {
    id: 3, title: '三体（原著小说）', poster: 'p1',
    tags: [{ text: '书', cls: 'cy' }, { text: '刘慈欣', cls: '' }, { text: '科幻', cls: '' }],
    desc: '文化大革命如火如荼地进行，叶文洁在红岸基地向宇宙发出第一声呼唤，揭开了人类与三体文明四百年纠葛的序幕。',
    sources: [
      { name: '笔趣阁', status: 'ok', ms: '120ms' },
      { name: '深海书源', status: 'slow', ms: '980ms' },
      { name: '古登堡', status: 'dead', ms: '超时' },
    ],
  },
];

function runSearch() {
  // TODO(M1): 调用 @omniflow/core aggregate.search，渐进渲染跨源聚合结果
}
</script>

<style scoped>
.disc-layout { display: flex; gap: 18px; height: calc(100vh - 100px); }
.disc-main { flex: 1; min-width: 410px; display: flex; flex-direction: column; overflow-y: auto; padding: 0; }
.disc-main .disc-sep { margin: 12px 0 0; }
.disc-sep { height: 1px; background: var(--line); flex-shrink: 0; }
.disc-content { flex: 1; overflow-y: auto; padding: 14px 16px; min-height: 0; }

.search-header { padding: 14px 16px 0; flex-shrink: 0; display: flex; gap: 6px; flex-direction: column; }
.searchbar { display: flex; flex-wrap: wrap; }
.searchbar input {
  flex: 1; background: var(--bg2); border: 1px solid var(--line); border-radius: 12px;
  padding: 12px 18px; color: var(--text); font-size: 14px; outline: none;
  font-family: var(--font); transition: border-color .2s;
}
.searchbar input:focus { border-color: var(--acc); }
.sr-meta { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; font-size: 12px; color: var(--muted); }
.pulse { width: 8px; height: 8px; border-radius: 50%; background: var(--green); animation: pulse 1.4s infinite; }

.sr-item { display: flex; gap: 14px; padding: 12px; cursor: pointer; transition: background .15s; align-items: flex-start; }
.sr-item:hover { background: var(--bg3); }
.sr-item .poster { width: 76px; flex-shrink: 0; }
.sr-item .body { flex: 1; min-width: 0; }
.sr-item h3 { font-size: 15px; font-weight: 700; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.sr-item .desc {
  color: var(--muted); font-size: 12px; margin-top: 6px;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.src-chips { display: flex; gap: 6px; margin-top: 10px; flex-wrap: wrap; align-items: center; }
.src-chip {
  display: inline-flex; align-items: center; gap: 5px; font-size: 11px;
  padding: 3px 9px; border-radius: 6px; background: var(--bg4); color: var(--muted);
}
.src-chip .dot { width: 6px; height: 6px; border-radius: 50%; }
.src-chip.ok .dot { background: var(--green); }
.src-chip.slow .dot { background: var(--orange); }
.src-chip.dead .dot { background: var(--red); }
.src-chip .ms { font-family: var(--mono); font-size: 9.5px; opacity: .7; }
.switch-src {
  font-size: 11px; color: var(--cy); cursor: pointer; padding: 3px 9px; border-radius: 6px;
  background: rgba(34, 211, 238, .08); border: 1px solid rgba(34, 211, 238, .2);
}
</style>
