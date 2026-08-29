<template>
  <div class="live-layout">
    <div class="live-side card">
      <div style="padding:10px">
        <input class="disc-search" v-model="filterText" placeholder="搜索频道…">
      </div>
      <div>
        <div v-for="g in filteredGroups" :key="g.name" class="live-group">
          <div class="gt"><b>{{ g.name }}</b><span>{{ g.channels.length }}</span></div>
          <div
            v-for="ch in g.channels"
            :key="ch"
            class="chan"
            :class="{ on: curChan === ch }"
            @click="pickChan(ch)"
          >
            <span class="playing-dot" :style="{ display: curChan === ch ? 'inline-block' : 'none' }"></span>
            {{ ch }}
            <span
              class="fav"
              :style="favs[ch] ? 'opacity:1;color:var(--gold)' : ''"
              @click.stop="toggleFav(ch)"
            >{{ favs[ch] ? '★' : '☆' }}</span>
          </div>
        </div>
        <div v-if="!filteredGroups.length" style="padding:20px;color:var(--faint);font-size:12px">未找到匹配频道</div>
      </div>
    </div>
    <div class="live-main">
      <div class="player-shell">
        <div class="video-ph"></div>
        <div class="play-core">
          <div class="big" @click="noop">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <span>{{ curChan }} · 直播中</span>
        </div>
        <div class="ctrl-bar">
          <div class="ctrl-ic" @click="noop">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <span class="time">LIVE · 高清</span>
          <div class="track" style="opacity:.3"><i style="width:100%"></i></div>
          <div class="ctrl-ic" title="音量">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 8.03v7.94A4.5 4.5 0 0 0 16.5 12zM14 3.23v2.06a7 7 0 0 1 0 13.42v2.06a9 9 0 0 0 0-17.54z" />
            </svg>
          </div>
          <div class="ctrl-ic" title="全屏">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
            </svg>
          </div>
        </div>
      </div>
      <div class="card epg-card">
        <div class="epg-now">
          <span class="name">📺 <span>{{ curChan }}</span></span>
          <span class="time">正在播出 · {{ epgTimeRange }}</span>
          <span class="tag gold" style="margin-left:auto">HD</span>
        </div>
        <div style="font-size:18px;font-weight:800;margin-bottom:4px">{{ curProg.title }}</div>
        <div style="font-size:12px;color:var(--muted);margin-bottom:16px">{{ curProg.desc }}</div>
        <div class="epg-timeline">
          <div
            v-for="(b, i) in curProg.list"
            :key="i"
            class="epg-block"
            :class="{ now: i === curProg.now, past: i < curProg.now }"
            :style="{ left: (b[0] * 2) + '%', width: ((b[1] - b[0]) * 2) + '%' }"
            @click="noop"
          >{{ b[2] }}</div>
          <div class="epg-rule" :style="{ left: (curProg.rule * 2) + '%' }"></div>
        </div>
        <div class="epg-timebar">
          <span>18:00</span><span>19:00</span><span>20:00</span><span>21:00</span><span>22:00</span><span>23:00</span>
        </div>
        <div class="epg-upnext">
          <span
            v-for="(b, i) in curProg.list.slice(curProg.now + 1)"
            :key="i"
            class="up"
          >⏭ {{ b[2] }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const noop = () => {};
const filterText = ref('');
const curChan = ref('CCTV-1 综合');
const favs = ref<Record<string, boolean>>({});

interface ChannelGroup { name: string; channels: string[] }
interface ProgBlock { title: string; desc: string; list: [number, number, string][]; now: number; rule: number }

const groups: ChannelGroup[] = [
  { name: '📺 央视', channels: ['CCTV-1 综合', 'CCTV-2 财经', 'CCTV-3 综艺', 'CCTV-5 体育', 'CCTV-6 电影', 'CCTV-13 新闻', 'CCTV-4K 超高清'] },
  { name: '🌐 卫视', channels: ['湖南卫视', '浙江卫视', '东方卫视', '江苏卫视', '北京卫视', '深圳卫视'] },
  { name: '🎬 影视', channels: ['CHC 动作电影', 'CHC 家庭影院', '凤凰电影', '影视轮播·武侠'] },
  { name: '🎵 地方/特色', channels: ['广东珠江', '上海新闻综合', '音乐轮播·90s', '纪录频道'] },
];

const progs: ProgBlock[] = [
  {
    title: '新闻联播', desc: '中央电视台综合频道每晚 19 点播出的新闻节目',
    list: [[0, 8, '18:30 晚间新闻'], [8, 14, '19:00 新闻联播'], [14, 16.5, '19:30 天气预报'], [16.5, 19, '19:32 焦点访谈'], [19, 31, '19:56 黄金剧场'], [31, 44, '20:46 剧场续播'], [44, 50, '21:30 新闻直播间']],
    now: 1, rule: 12,
  },
  {
    title: '黄金剧场 · 人世间', desc: '现实主义题材电视剧，讲述普通家庭跨越五十年的命运变迁',
    list: [[0, 10, '19:00 新闻联播'], [10, 18, '19:30 今日说法'], [18, 30, '20:06 人世间 23'], [30, 42, '21:00 人世间 24'], [42, 50, '21:40 晚间新闻']],
    now: 2, rule: 26,
  },
  {
    title: '体育赛事直播', desc: '赛事信号直转，EPG 由 xmltv 数据源关联',
    list: [[0, 12, '19:00 体育世界'], [12, 26, '19:30 赛事直播'], [26, 38, '20:30 赛事集锦'], [38, 50, '21:30 体育新闻']],
    now: 1, rule: 20,
  },
];

const filteredGroups = computed(() => {
  const f = filterText.value.trim();
  if (!f) return groups;
  return groups
    .map(g => ({ ...g, channels: g.channels.filter(n => n.includes(f)) }))
    .filter(g => g.channels.length > 0);
});

const curProgIdx = computed(() => {
  let sum = 0;
  for (let i = 0; i < curChan.value.length; i++) sum += curChan.value.charCodeAt(i);
  return sum % progs.length;
});

const curProg = computed(() => progs[curProgIdx.value]!);

const epgTimeRange = computed(() => {
  const p = curProg.value;
  const nowBlock = p.list[p.now]!;
  const nextBlock = p.list[Math.min(p.now + 1, p.list.length - 1)]!;
  return nowBlock[2].slice(0, 5) + ' - ' + nextBlock[2].slice(0, 5);
});

function pickChan(n: string) {
  curChan.value = n;
}

function toggleFav(n: string) {
  favs.value[n] = !favs.value[n];
}
</script>

<style scoped>
.live-layout { display: flex; gap: 18px; height: calc(100vh - 132px); }
.live-side { width: 245px; flex-shrink: 0; overflow-y: auto; padding: 8px; }
.disc-search { width: 100%; background-color: var(--bg3); background-repeat: no-repeat; background-position: 11px center; background-size: 15px 15px; border: 1px solid var(--line); border-radius: 8px; padding: 8px 11px 8px 34px; color: var(--text); font-size: 12px; outline: none; font-family: var(--font); flex-shrink: 0; }
.disc-search:focus { border-color: var(--acc-dim); }
.live-group .gt { font-size: 12px; color: var(--muted); padding: 8px 10px 4px; display: flex; justify-content: space-between; }
.chan { display: flex; align-items: center; gap: 8px; padding: 8px 10px; border-radius: 8px; cursor: pointer; font-size: 13px; color: #c4cad8; transition: background .15s; }
.chan:hover { background: var(--bg3); }
.chan.on { background: linear-gradient(90deg, rgba(108,124,255,.22), transparent); color: #fff; box-shadow: inset 2px 0 0 var(--acc); }
.chan .fav { margin-left: auto; color: var(--faint); opacity: .45; }
.chan:hover .fav { opacity: 1; }
.playing-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--red); animation: pulse2 1s infinite; display: none; flex-shrink: 0; }
@keyframes pulse2 { 50% { opacity: .3; } }
.live-main { flex: 1; display: flex; flex-direction: column; gap: 14px; min-width: 410px; }
.player-shell { aspect-ratio: 16/9; border-radius: 14px; background: #000; position: relative; overflow: hidden; border: 1px solid var(--line); display: flex; align-items: center; justify-content: center; }
.player-shell .video-ph { position: absolute; inset: 0; background: radial-gradient(ellipse at center, #182446 0%, #05070d 75%); }
.play-core { position: relative; z-index: 2; display: flex; flex-direction: column; align-items: center; gap: 14px; color: var(--muted); }
.play-core .big { width: 72px; height: 72px; border-radius: 50%; background: linear-gradient(135deg, var(--acc), var(--cy)); display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 8px 40px var(--acc-glow); transition: transform .2s; }
.play-core .big:hover { transform: scale(1.08); }
.play-core .big svg { width: 30px; height: 30px; color: #fff; }
.ctrl-bar { position: absolute; bottom: 0; left: 0; right: 0; padding: 10px 16px; background: linear-gradient(transparent, rgba(0,0,0,.85)); display: flex; align-items: center; gap: 12px; z-index: 3; }
.ctrl-bar .time { font-family: var(--mono); font-size: 11px; color: #dfe5f0; }
.ctrl-bar .track { flex: 1; height: 4px; border-radius: 2px; background: rgba(255,255,255,.2); position: relative; cursor: pointer; }
.ctrl-bar .track i { position: absolute; left: 0; top: 0; bottom: 0; width: 38%; border-radius: 2px; background: linear-gradient(90deg, var(--acc), var(--cy)); }
.ctrl-ic { width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #dfe5f0; opacity: .85; }
.ctrl-ic:hover { opacity: 1; }
.ctrl-ic svg { width: 17px; height: 17px; }
.epg-card { padding: 14px; }
.epg-now { display: flex; align-items: baseline; gap: 12px; margin-bottom: 12px; flex-wrap: wrap; }
.epg-now .name { font-size: 15px; font-weight: 700; }
.epg-now .time { font-family: var(--mono); font-size: 12px; color: var(--cy); }
.epg-timeline { position: relative; height: 56px; background: var(--bg4); border-radius: 10px; overflow: hidden; cursor: crosshair; }
.epg-block { position: absolute; top: 8px; bottom: 8px; border-radius: 6px; background: var(--bg3); border: 1px solid var(--line2); display: flex; align-items: center; padding: 0 8px; font-size: 10.5px; white-space: nowrap; overflow: hidden; cursor: pointer; transition: all .15s; }
.epg-block:hover { background: var(--bg4); border-color: var(--acc-dim); z-index: 2; }
.epg-block.now { background: linear-gradient(135deg, rgba(108,124,255,.3), rgba(34,211,238,.15)); border-color: var(--acc-dim); color: #fff; }
.epg-block.past { opacity: .45; }
.epg-rule { position: absolute; top: 0; bottom: 0; width: 2px; background: var(--red); z-index: 3; }
.epg-timebar { display: flex; justify-content: space-between; font-family: var(--mono); font-size: 10px; color: var(--faint); margin-top: 6px; padding: 0 2px; }
.epg-upnext { display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap; }
.epg-upnext .up { font-size: 11px; color: var(--muted); padding: 4px 10px; border-radius: 6px; background: var(--bg3); }
</style>
