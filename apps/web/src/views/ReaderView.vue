<template>
  <div class="reader-wrap">
    <div class="reader-topbar">
      <button class="btn sm ghost" @click="tocOpen = !tocOpen">☰ 目录</button>
      <div class="rt-mid">诡秘之主 · <span>第{{ currentChapter }}章 · {{ currentTitle }}</span></div>
      <button class="btn sm ghost" @click="noop">🔖 书签</button>
    </div>
    <div class="reader-page" :class="currentTheme" @click="flipPage(1)">
      <div class="toc-drawer" :class="{ open: tocOpen }" @click.stop>
        <div class="th">📑 目录 · 共 1,432 章 <span class="x" @click="tocOpen = false">✕</span></div>
        <div class="tl">
          <div
            v-for="ch in toc"
            :key="ch.id"
            class="toc-item"
            :class="{ on: ch.id === currentChapter }"
            @click="pickChapter(ch.id)"
          >{{ ch.title }}</div>
        </div>
      </div>
      <div class="reader-title">第{{ currentChapter }}章 · {{ currentTitle }}</div>
      <div class="reader-body">{{ readerContent }}</div>
      <div class="reader-foot">
        <span>第 {{ pagePos }} / 12 页</span>
        <span>书源：笔趣阁 · legado 规则</span>
        <span>08-28 20:12</span>
      </div>
    </div>
    <div class="reader-ctl">
      <button class="btn sm" @click="flipPage(-1)">‹ 上一页</button>
      <button class="btn sm" @click="flipPage(1)">下一页 ›</button>
      <div class="sep"></div>
      <button class="btn sm ghost" @click="rdFont(-1)">A⁻</button>
      <button class="btn sm ghost" @click="rdFont(1)">A⁺</button>
      <div class="sep"></div>
      <span style="font-size:12px;color:var(--muted)">行距</span>
      <button class="btn sm ghost" @click="rdLine(-0.15)">－</button>
      <button class="btn sm ghost" @click="rdLine(0.15)">＋</button>
      <div class="sep"></div>
      <button class="btn sm ghost" @click="noop">⇄ 换源</button>
      <button class="btn sm ghost" @click="noop">🔈 朗读</button>
      <div class="theme-dots">
        <div class="theme-dot dark" :class="{ on: currentTheme === 'dark' }" title="深色" @click="rdTheme('dark')"></div>
        <div class="theme-dot paper" :class="{ on: currentTheme === 'paper' }" title="纸黄" @click="rdTheme('paper')"></div>
        <div class="theme-dot light" :class="{ on: currentTheme === 'light' }" title="浅色" @click="rdTheme('light')"></div>
        <div class="theme-dot green" :class="{ on: currentTheme === 'green' }" title="护眼绿" @click="rdTheme('green')"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
defineProps<{ id: string }>();

const tocOpen = ref(false);
const currentTheme = ref<'dark' | 'paper' | 'light' | 'green'>('dark');
const fontSize = ref(17);
const lineHeight = ref(2.05);
const currentChapter = ref(891);
const pagePos = ref(8);
const currentTitle = ref('灰雾之上');
const toc = ref(
  Array.from({ length: 20 }, (_, i) => ({
    id: 880 + i,
    title: `第${880 + i}章 · 章节标题${i + 1}`,
  }))
);
const readerContent = computed(() =>
  `　　这是一段示例正文。纳米材料学家汪淼盯着眼前那行倒计时，数字正在无声地跳动。523:14:09、523:14:08……\n　　他不知道这倒计时从何而来，也不知道它将通往何处。但他清楚，一旦倒计时归零，他眼前看到的一切都将化为虚无。\n　　「科学边界」——一个神秘的学术组织，聚集着世界上最顶尖的科学家。而他们中的许多人，已在倒计时归零的那一刻选择了死亡。\n　　史强递来一支烟，烟雾在昏暗的灯光下缓缓升腾。这个粗犷的刑警，是汪淼此刻唯一的依靠。\n　　「汪教授，」史强低声说，「宇宙在闪烁。」\n　　（字号 ${fontSize.value}px · 行距 ${lineHeight.value.toFixed(2)} 倍 · 当前主题 ${currentTheme.value}）`
);

function pickChapter(id: number) {
  currentChapter.value = id;
  pagePos.value = 1;
  tocOpen.value = false;
  const found = toc.value.find((c) => c.id === id);
  currentTitle.value = found?.title.replace(/^第\d+章 · /, '') ?? '';
}
function flipPage(dir: number) {
  pagePos.value = Math.max(1, Math.min(12, pagePos.value + dir));
}
function rdFont(delta: number) {
  fontSize.value = Math.max(12, Math.min(28, fontSize.value + delta));
}
function rdLine(delta: number) {
  lineHeight.value = Math.max(1.2, Math.min(2.4, +(lineHeight.value + delta).toFixed(2)));
}
function rdTheme(theme: 'dark' | 'paper' | 'light' | 'green') {
  currentTheme.value = theme;
}
function noop() {}
</script>

<style scoped>
.reader-wrap { height: calc(100vh - 122px); display: flex; flex-direction: column; align-items: center; }
.reader-topbar { display: flex; align-items: center; width: min(760px, 100%); margin-bottom: 12px; gap: 10px; }
.reader-topbar .rt-mid { flex: 1; text-align: center; font-size: 13px; color: var(--muted); }
.reader-page {
  width: min(760px, 100%); flex: 1; background: var(--bg2);
  border: 1px solid var(--line); border-radius: 16px;
  padding: 44px 54px; overflow: hidden; position: relative;
  display: flex; flex-direction: column; cursor: pointer;
  box-shadow: 0 12px 50px rgba(0,0,0,.35);
  transition: background 0.3s, color 0.3s;
}
.reader-page.paper { background: #f7f1e1; color: #3b3225; border-color: #e2d5b4; }
.reader-page.dark { background: var(--bg2); color: var(--text); }
.reader-page.light { background: #fff; color: #1a1a2e; border-color: #e5e7eb; }
.reader-page.green { background: #c7edcc; color: #2b3b2d; border-color: #a8d5ae; }
.reader-title { text-align: center; font-size: 15px; color: var(--muted); margin-bottom: 24px; letter-spacing: 2px; }
.reader-page.paper .reader-title { color: #8a7a5c; }
.reader-page.light .reader-title { color: #6b7280; }
.reader-page.green .reader-title { color: #4a6b4f; }
.reader-body {
  flex: 1; font-size: v-bind('fontSize + "px"');
  line-height: v-bind('lineHeight.toFixed(2)');
  text-align: justify; letter-spacing: 0.5px;
  white-space: pre-wrap; overflow: hidden;
}
.reader-page.paper .reader-body { color: #4a4032; }
.reader-page.light .reader-body { color: #1f2937; }
.reader-page.green .reader-body { color: #2b3b2d; }
.reader-foot { display: flex; justify-content: space-between; color: var(--faint); font-size: 11px; font-family: var(--mono); margin-top: 18px; }
.reader-page.paper .reader-foot, .reader-page.light .reader-foot, .reader-page.green .reader-foot { color: #8a8a7a; }
.reader-ctl { display: flex; gap: 10px; margin-top: 14px; align-items: center; width: min(760px, 100%); }
.reader-ctl .sep { width: 1px; height: 18px; background: var(--line2); }
.theme-dots { display: flex; gap: 8px; margin-left: auto; }
.theme-dot { width: 24px; height: 24px; border-radius: 50%; cursor: pointer; border: 2px solid transparent; transition: all 0.15s; }
.theme-dot:hover { transform: scale(1.1); }
.theme-dot.on { border-color: var(--acc); box-shadow: 0 0 0 2px rgba(108,124,255,.25); }
.theme-dot.dark { background: var(--bg2); }
.theme-dot.paper { background: #f7f1e1; }
.theme-dot.light { background: #fff; border-color: var(--line2); }
.theme-dot.green { background: #c7edcc; }
.theme-dot.light.on { border-color: var(--acc); }
.toc-drawer {
  position: absolute; top: 0; left: 0; bottom: 0; width: 280px;
  background: rgba(21,27,38,.97); backdrop-filter: blur(10px);
  border-right: 1px solid var(--line);
  transform: translateX(-100%); transition: transform 0.28s ease;
  z-index: 5; display: flex; flex-direction: column; overflow: hidden;
  border-radius: 16px 0 0 16px;
}
.toc-drawer.open { transform: translateX(0); }
.toc-drawer .th { padding: 14px 16px; border-bottom: 1px solid var(--line); display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; }
.toc-drawer .th .x { margin-left: auto; cursor: pointer; color: var(--muted); font-size: 15px; }
.toc-drawer .tl { flex: 1; overflow-y: auto; padding: 8px; }
.toc-item { padding: 9px 12px; border-radius: 7px; font-size: 12.5px; color: #c4cad8; cursor: pointer; }
.toc-item:hover { background: rgba(108,124,255,.1); }
.toc-item.on { background: rgba(108,124,255,.2); color: #fff; }
</style>
