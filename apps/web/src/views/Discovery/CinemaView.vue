<template>
  <div class="disc-layout">
    <div class="disc-side card">
      <div class="disc-head">
        <div class="dh-title">影院<span>影视源·发现</span></div>
      </div>
      <input class="disc-search" v-model="filterText" placeholder="筛选影视源…">
      <div class="disc-sep"></div>
      <div class="disc-src-list">
        <div
          v-for="(s, idx) in filteredSources"
          :key="idx"
          class="dis-src"
          :class="{ on: activeSrc === idx }"
          @click="activeSrc = idx"
        >
          <div class="ic">{{ s.icon }}</div>
          <div class="tx"><b>{{ s.name }}</b><span>{{ s.desc }}</span></div>
          <span class="cnt">{{ s.cats }}</span>
        </div>
        <div v-if="!filteredSources.length" style="padding:16px;color:var(--faint);font-size:12px">无匹配的源</div>
      </div>
    </div>
    <div class="disc-main card">
      <div class="disc-header">
        <h2>{{ sources[activeSrc]?.name }}</h2>
        <div class="cat-line">
          <span class="cl-label">分类</span>
          <div
            v-for="c in cats"
            :key="c"
            class="cat-chip"
            :class="{ on: activeCat === c }"
            @click="activeCat = c"
          >{{ c }}</div>
        </div>
      </div>
      <div class="disc-sep"></div>
      <div class="disc-content">
        <div class="sec-head">
          <h2 style="font-size:15px">{{ activeCat }}</h2>
          <span class="sub">共 126 部 · 换源可用</span>
          <span class="more" @click="noop">刷新 ↻</span>
        </div>
        <div class="disc-grid">
          <div v-for="(m, i) in contentItems" :key="i" class="disc-card" @click="noop">
            <div class="poster" :class="m.cover">
              <div class="ph">
                <div class="t">{{ m.title }}</div>
                <div class="s">{{ activeCat }}</div>
              </div>
            </div>
            <div class="nm">{{ m.title }}</div>
            <div class="au">{{ m.source }} · {{ activeCat }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const noop = () => {};
const filterText = ref('');
const activeSrc = ref(0);
const activeCat = ref('电影');

interface Source { name: string; desc: string; icon: string; cats: string }
interface ContentItem { title: string; source: string; cover: string }

const sources: Source[] = [
  { name: '量子资源', desc: 'CMS(json) · 分类发现', icon: '影', cats: '8类' },
  { name: '卧龙资源', desc: 'CMS(xml) · 分类发现', icon: '影', cats: '6类' },
  { name: '海阔·影视JS', desc: 'hiker JS 源 · 发现', icon: '影', cats: '7类' },
  { name: 'drpy·豆瓣', desc: 'drpy XP源 · 发现', icon: '影', cats: '5类' },
];

const cats = ['电影', '电视剧', '动漫', '综艺', '纪录片', '短剧', '欧美', '国产'];

const pool = ['漫长的季节', '流浪地球 2', '三体', '大明王朝 1566', '宇宙探索编辑部', '风味人间', '爱死机 S3', '中国奇谭', '狂飙', '沙丘 2', '奥本海默', '繁花'];
const sourceNames = ['量子资源', '卧龙CMS', '非凡CMS', '海阔JS', 'drpy'];
const covers = ['p5', 'p3', 'p7', 'p4', 'p2', 'p6', 'p1', 'p8'];

const filteredSources = computed(() => {
  const f = filterText.value.trim();
  if (!f) return sources;
  return sources.filter(s => s.name.includes(f) || s.desc.includes(f));
});

const contentItems = computed<ContentItem[]>(() => {
  const seed = activeSrc.value * 7 + activeCat.value.length;
  return pool.map((_, i) => ({
    title: pool[(i + seed) % pool.length]!,
    source: sourceNames[(i + seed) % sourceNames.length]!,
    cover: covers[(i + seed) % covers.length]!,
  }));
});
</script>

<style scoped>
.disc-layout { display: flex; gap: 18px; height: calc(100vh - 100px); }
.disc-side { width: 245px; flex-shrink: 0; display: flex; flex-direction: column; padding: 12px; overflow-y: auto; }
.disc-head { padding: 2px 2px 10px; flex-shrink: 0; }
.disc-head .dh-title { font-size: 15px; font-weight: 700; }
.disc-head .dh-title span { font-size: 12px; color: var(--muted); font-weight: 400; margin-left: 8px; }
.disc-sep { height: 1px; background: var(--line); flex-shrink: 0; }
.disc-side .disc-sep { margin: 10px -12px 6px; }
.disc-search { width: 100%; background-color: var(--bg3); background-repeat: no-repeat; background-position: 11px center; background-size: 15px 15px; border: 1px solid var(--line); border-radius: 8px; padding: 8px 11px 8px 34px; color: var(--text); font-size: 12px; outline: none; font-family: var(--font); flex-shrink: 0; }
.disc-search:focus { border-color: var(--acc-dim); }
.disc-src-list { flex: 1; overflow-y: auto; min-height: 0; }
.dis-src { display: flex; align-items: center; gap: 10px; padding: 10px; border-radius: 9px; cursor: pointer; transition: background .15s; margin-top: 6px; }
.dis-src:hover { background: var(--bg3); }
.dis-src.on { background: rgba(108,124,255,.16); box-shadow: inset 2px 0 0 var(--acc); }
.dis-src .ic { width: 30px; height: 30px; border-radius: 8px; background: var(--bg3); border: 1px solid var(--line); display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0; }
.dis-src .tx { min-width: 0; flex: 1; }
.dis-src .tx b { font-size: 12.5px; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.dis-src .tx span { font-size: 10.5px; color: var(--faint); }
.dis-src .cnt { font-family: var(--mono); font-size: 10px; color: var(--faint); background: var(--bg4); padding: 1px 7px; border-radius: 10px; }
.disc-main { flex: 1; min-width: 410px; display: flex; flex-direction: column; overflow-y: auto; padding: 0; }
.disc-header { padding: 14px 16px 0; flex-shrink: 0; display: flex; gap: 12px; flex-wrap: wrap; flex-direction: column; }
.disc-header h2 { font-size: 16px; font-weight: 700; }
.disc-header .cat-line { margin-bottom: 0; }
.disc-main .disc-sep { margin: 12px 0 0; }
.disc-content { flex: 1; overflow-y: auto; padding: 14px 16px; min-height: 0; }
.cat-line { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.cl-label { font-size: 11px; color: var(--faint); letter-spacing: 1px; }
.disc-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(132px, 1fr)); gap: 14px; }
.disc-card { cursor: pointer; }
.disc-card .nm { font-size: 12.5px; margin-top: 8px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.disc-card .au { font-size: 11px; color: var(--faint); margin-top: 2px; }
</style>
