<template>
  <div class="player-layout">
    <div class="player-main">
      <div class="player-shell">
        <div class="video-ph"></div>
        <div class="play-core">
          <div class="big" @click="noop"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg></div>
          <span>点击播放 · 三体 第{{ String(currentEp).padStart(2, '0') }}集 {{ currentEpTitle }}</span>
        </div>
        <div class="ctrl-bar">
          <div class="ctrl-ic" title="播放/暂停" @click="noop"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg></div>
          <span class="time">08:36 / 42:10</span>
          <div class="track" @click="noop"><i></i></div>
          <div class="ctrl-ic" title="音量" @click="noop"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 8.03v7.94A4.5 4.5 0 0 0 16.5 12zM14 3.23v2.06a7 7 0 0 1 0 13.42v2.06a9 9 0 0 0 0-17.54z" /></svg></div>
          <div class="ctrl-ic" title="倍速" @click="noop"><span style="font-size:11px;font-family:var(--mono)">1.0x</span></div>
          <div class="ctrl-ic" title="设置" @click="noop"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.14 12.94a7.07 7.07 0 0 0 0-1.88l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.61-.22l-2.39.96a7.03 7.03 0 0 0-1.62-.94l-.36-2.54A.5.5 0 0 0 14 2h-4a.5.5 0 0 0-.5.42l-.36 2.54c-.59.24-1.13.56-1.62.94l-2.39-.96a.5.5 0 0 0-.61.22L2.6 8.48a.5.5 0 0 0 .12.64l2.03 1.58a7.07 7.07 0 0 0 0 1.88L2.72 14.16a.5.5 0 0 0-.12.64l1.92 3.32c.14.24.43.34.68.24l2.39-.96c.49.38 1.03.7 1.62.94l.36 2.54c.04.25.25.42.5.42h4c.25 0 .46-.17.5-.42l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.25.1.54 0 .68-.24l1.92-3.32a.5.5 0 0 0-.12-.64l-2.03-1.58zM12 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z" /></svg></div>
          <div class="ctrl-ic" title="画中画" @click="noop"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 11h-8v6h8v-6zm4 8V4.98C23 3.88 22.1 3 21 3H3c-1.1 0-2 .88-2 1.98V19c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2zm-2 .02H3V4.97h18v14.05z" /></svg></div>
          <div class="ctrl-ic" title="全屏" @click="noop"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" /></svg></div>
        </div>
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin:14px 4px 0;gap:12px;flex-wrap:wrap">
        <div>
          <h2 style="font-size:16px">三体 · 第{{ String(currentEp).padStart(2, '0') }}集 · {{ currentEpTitle }}</h2>
          <div style="color:var(--muted);font-size:12px;margin-top:4px">量子资源 · 1080P · H.265 · hls.js</div>
        </div>
        <div style="display:flex;gap:8px">
          <button class="btn sm" @click="prevEp">‹ 上一集</button>
          <button class="btn sm" @click="nextEp">下一集 ›</button>
          <button class="btn sm" @click="noop">⇱ 投屏</button>
        </div>
      </div>
    </div>
    <div class="player-side">
      <div class="next-ep" @click="nextEp">➤ 下一集：<span>第{{ String(Math.min(currentEp + 1, episodes.length)).padStart(2, '0') }}集 {{ episodes[Math.min(currentEp, episodes.length - 1)]?.title?.slice(2) ?? '' }}</span><br><span style="color:var(--muted);font-size:11px">自动连播已开启</span></div>
      <div class="card" style="padding:12px">
        <div style="font-size:13px;font-weight:700;margin-bottom:8px">选集列表 <span class="tag" style="margin-left:6px">量子资源</span></div>
        <div class="ep-list-side">
          <div
            v-for="ep in episodes"
            :key="ep.id"
            class="ep-item-side"
            :class="{ on: ep.id === currentEp }"
            @click="pickEp(ep.id)"
          >
            <span>第{{ String(ep.id).padStart(2, '0') }}集 {{ ep.title }}</span>
            <span class="dur">42:10</span>
          </div>
        </div>
      </div>
      <div class="sniff-log">
        <div style="color:var(--cy);margin-bottom:6px">🔍 嗅探日志</div>
        <div v-for="(log, i) in sniffLogs" :key="i">
          <span :class="log.type">[{{ log.type === 'ok' ? 'OK' : 'HIT' }}]</span> {{ log.text }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
defineProps<{ id: string }>();

const epNames = ['科学边界', '倒计时', '红岸基地', '宇宙闪烁', '三体问题', '周文王', '大撕裂'];
const episodes = ref(
  Array.from({ length: 30 }, (_, i) => ({
    id: i + 1,
    title: epNames[i % epNames.length],
  }))
);
const currentEp = ref(1);
const currentEpTitle = computed(() => episodes.value[currentEp.value - 1]?.title ?? '');
const sniffLogs = ref([
  { type: 'ok' as const, text: '请求主页面 200 OK' },
  { type: 'ok' as const, text: '匹配到 m3u8 地址' },
  { type: 'hit' as const, text: '解析成功：https://.../index.m3u8' },
  { type: 'ok' as const, text: 'hls.js 加载完成 · 起播' },
]);

function pickEp(id: number) {
  currentEp.value = id;
}
function prevEp() {
  if (currentEp.value > 1) currentEp.value--;
}
function nextEp() {
  if (currentEp.value < episodes.value.length) currentEp.value++;
}
function noop() {}
</script>

<style scoped>
.player-layout { display: flex; gap: 18px; }
.player-main { flex: 1; min-width: 0; }
.player-shell {
  aspect-ratio: 16/9; border-radius: 14px; background: #000;
  position: relative; overflow: hidden; border: 1px solid var(--line);
  display: flex; align-items: center; justify-content: center;
}
.player-shell .video-ph { position: absolute; inset: 0; background: radial-gradient(ellipse at center, #182446 0%, #05070d 75%); }
.play-core { position: relative; z-index: 2; display: flex; flex-direction: column; align-items: center; gap: 14px; color: var(--muted); }
.play-core .big {
  width: 72px; height: 72px; border-radius: 50%;
  background: linear-gradient(135deg, var(--acc), var(--cy));
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; box-shadow: 0 8px 40px var(--acc-glow); transition: transform 0.2s;
}
.play-core .big:hover { transform: scale(1.08); }
.play-core .big svg { width: 30px; height: 30px; color: #fff; }
.ctrl-bar {
  position: absolute; bottom: 0; left: 0; right: 0;
  padding: 10px 16px; background: linear-gradient(transparent, rgba(0,0,0,.85));
  display: flex; align-items: center; gap: 12px; z-index: 3;
}
.ctrl-bar .time { font-family: var(--mono); font-size: 11px; color: #dfe5f0; }
.ctrl-bar .track {
  flex: 1; height: 4px; border-radius: 2px;
  background: rgba(255,255,255,.2); position: relative; cursor: pointer;
}
.ctrl-bar .track i {
  position: absolute; left: 0; top: 0; bottom: 0; width: 38%;
  border-radius: 2px; background: linear-gradient(90deg, var(--acc), var(--cy));
}
.ctrl-bar .track i::after {
  content: ''; position: absolute; right: -5px; top: 50%;
  transform: translateY(-50%); width: 10px; height: 10px;
  border-radius: 50%; background: #fff; box-shadow: 0 0 8px var(--cy);
}
.ctrl-ic { width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #dfe5f0; opacity: 0.85; }
.ctrl-ic:hover { opacity: 1; }
.ctrl-ic svg { width: 17px; height: 17px; }
.player-side { width: 300px; flex-shrink: 0; }
.next-ep {
  padding: 10px 12px; border-radius: 10px;
  background: rgba(108,124,255,.1); border: 1px solid rgba(108,124,255,.25);
  font-size: 12px; display: flex; align-items: center; gap: 8px;
  margin-bottom: 10px; cursor: pointer;
}
.sniff-log {
  margin-top: 12px; padding: 10px 12px;
  font-family: var(--mono); font-size: 10.5px; line-height: 1.7;
  color: var(--muted); background: #0a0e15;
  border-radius: 10px; border: 1px solid var(--line);
}
.sniff-log .ok { color: var(--green); }
.sniff-log .hit { color: var(--gold); }
.ep-list-side { max-height: 320px; overflow-y: auto; margin-top: 10px; }
.ep-item-side {
  padding: 8px 10px; border-radius: 6px; font-size: 12px;
  cursor: pointer; transition: background 0.15s;
  display: flex; justify-content: space-between; align-items: center; gap: 8px;
}
.ep-item-side:hover { background: var(--bg3); }
.ep-item-side.on { background: rgba(108,124,255,.15); color: #fff; }
.ep-item-side .dur { font-size: 10px; color: var(--faint); font-family: var(--mono); flex-shrink: 0; }
</style>
