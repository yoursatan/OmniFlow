<template>
  <div class="detail-hero">
    <div class="poster p5">
      <div class="ph">
        <div class="t">三体</div>
        <div class="s">2023 · 电视剧</div>
      </div>
      <div style="position:absolute;top:8px;right:8px">
        <span class="tag gold" style="background:rgba(245,197,24,.25);font-weight:700">9.4</span>
      </div>
    </div>
    <div class="info" style="flex:1;min-width:0">
      <h2>三体 <span class="tag green">4 源可用</span></h2>
      <div class="meta-line">
        <span><b>30</b> 集全</span>
        <span>科幻 / 奇幻</span>
        <span>2023</span>
        <span>中国大陆</span>
        <span>张鲁一 / 于和伟 / 陈瑾</span>
      </div>
      <div class="desc-block">
        纳米材料学家汪淼被警察史强带到联合作战中心，参与侦破一起科学家连环自杀案件。倒计时的尽头是什么？幽灵倒计时、科学边界、三日凌空……一个宏大的宇宙图景在人类面前徐徐展开。
      </div>
      <div class="parse-row">
        <span class="tag acc">解析接口</span>
        <span class="tag" style="cursor:pointer" @click="noop">JSON 池-A（默认）</span>
        <span class="tag" style="cursor:pointer" @click="noop">嗅探模式</span>
        <span class="tag" style="cursor:pointer" @click="noop">极速解析</span>
      </div>
      <div style="display:flex;gap:10px;margin-top:16px;flex-wrap:wrap">
        <button class="btn primary" @click="$router.push(`/player/${id}`)">▶ 立即播放</button>
        <button class="btn" @click="noop">+ 收藏</button>
        <button class="btn" @click="noop">⇄ 换源 4</button>
        <button class="btn" @click="noop">⤓ 下载</button>
      </div>
    </div>
  </div>
  <div class="card" style="padding:16px">
    <div class="ep-tabs">
      <span class="tag cy">播放线路</span>
      <span
        v-for="(src, i) in sources"
        :key="i"
        class="tag src-tab"
        :class="{ on: i === currentSource }"
        style="cursor:pointer"
        @click="pickSource(i)"
      >{{ src }}</span>
      <span style="margin-left:auto;color:var(--cy);font-size:12px;cursor:pointer" @click="toggleOrder">
        ⇅ {{ ascending ? '正序' : '倒序' }}
      </span>
    </div>
    <div class="ep-grid">
      <div
        v-for="ep in episodes"
        :key="ep.id"
        class="ep"
        :class="{ on: ep.id === currentEp }"
        @click="pickEp(ep.id)"
      >{{ ep.title }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
defineProps<{ id: string }>();

const sources = ref(['量子资源', '非凡CMS', '蓝光影院', '快手影视']);
const currentSource = ref(0);
const episodes = ref(
  Array.from({ length: 30 }, (_, i) => ({
    id: i + 1,
    title: `第${String(i + 1).padStart(2, '0')}集`,
  }))
);
const currentEp = ref(1);
const ascending = ref(true);

function pickSource(i: number) {
  currentSource.value = i;
}
function pickEp(id: number) {
  currentEp.value = id;
}
function toggleOrder() {
  ascending.value = !ascending.value;
  episodes.value = [...episodes.value].reverse();
}
function noop() {}
</script>

<style scoped>
.detail-hero { display: flex; gap: 24px; margin-bottom: 22px; }
.detail-hero .poster { width: 190px; flex-shrink: 0; }
.detail-hero h2 { font-size: 26px; font-weight: 800; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.meta-line { display: flex; gap: 14px; color: var(--muted); font-size: 13px; margin: 10px 0; flex-wrap: wrap; }
.meta-line b { color: var(--gold); }
.desc-block { font-size: 13px; line-height: 1.8; color: #c4cad8; }
.parse-row { display: flex; gap: 8px; align-items: center; margin: 16px 0 14px; flex-wrap: wrap; }
.ep-tabs { display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; align-items: center; }
.ep-tabs .src-tab.on { background: rgba(108,124,255,.16); color: #fff; }
.ep-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(104px, 1fr)); gap: 8px; }
.ep {
  padding: 9px 8px; text-align: center; border-radius: 8px;
  background: var(--bg3); border: 1px solid var(--line);
  font-size: 12px; cursor: pointer; transition: all 0.15s;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.ep:hover { border-color: var(--acc-dim); color: var(--cy); }
.ep.on { background: linear-gradient(135deg, var(--acc), #8b5cf6); color: #fff; border-color: transparent; font-weight: 700; }
</style>
