<template>
  <div class="comic-wrap">
    <div class="comic-topbar">
      <button class="btn sm ghost" @click="noop">☰ 章节</button>
      <div class="ct-mid">电锯人 · <span>第 {{ currentChapter }} 话 · 暗之恶魔</span></div>
      <span class="tag cy">{{ modeTag }}</span>
    </div>
    <div class="comic-page" :class="mode">
      <div class="comic-panel left">
        <div style="text-align:center;color:var(--muted)">
          <div style="font-size:48px;margin-bottom:10px">📖</div>
          <div>第 {{ currentChapter }} 话 · 左页</div>
          <div style="font-size:11px;margin-top:6px">点击或按 → 翻页</div>
        </div>
      </div>
      <div class="comic-panel right">
        <div style="text-align:center;color:var(--muted)">
          <div style="font-size:48px;margin-bottom:10px">📖</div>
          <div>第 {{ currentChapter }} 话 · 右页</div>
          <div style="font-size:11px;margin-top:6px">第 {{ currentPage }} / {{ totalPages }} 页</div>
        </div>
      </div>
    </div>
    <div class="comic-ctl">
      <button class="btn sm" @click="flipChapter(-1)">‹ 上一话</button>
      <button class="btn sm" @click="flipChapter(1)">下一话 ›</button>
      <div class="sep"></div>
      <div class="comic-mode">
        <button :class="{ on: mode === 'dual' }" @click="pickMode('dual')">双页</button>
        <button :class="{ on: mode === 'single' }" @click="pickMode('single')">单页</button>
        <button :class="{ on: mode === 'scroll' }" @click="pickMode('scroll')">条漫</button>
      </div>
      <div style="margin-left:auto;display:flex;gap:8px;align-items:center">
        <span style="font-size:12px;color:var(--muted);font-family:var(--mono)">{{ currentPage }}/{{ totalPages }}</span>
        <input type="range" min="1" :max="totalPages" :value="currentPage" style="width:130px" @input="gotoPage(+($event.target as HTMLInputElement).value)">
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
defineProps<{ id: string }>();

const mode = ref<'dual' | 'single' | 'scroll'>('dual');
const currentPage = ref(1);
const totalPages = ref(32);
const currentChapter = ref(148);
const modeTag = computed(() => mode.value === 'dual' ? '双页模式' : mode.value === 'single' ? '单页模式' : '条漫模式');

function pickMode(m: 'dual' | 'single' | 'scroll') {
  mode.value = m;
}
function flipChapter(dir: number) {
  currentChapter.value = Math.max(1, currentChapter.value + dir);
  currentPage.value = 1;
}
function gotoPage(p: number) {
  currentPage.value = Math.max(1, Math.min(totalPages.value, p));
}
function noop() {}
</script>

<style scoped>
.comic-wrap { height: calc(100vh - 122px); display: flex; flex-direction: column; align-items: center; }
.comic-topbar { display: flex; align-items: center; width: min(900px, 100%); margin-bottom: 12px; gap: 10px; }
.comic-topbar .ct-mid { flex: 1; text-align: center; font-size: 13px; color: var(--muted); }
.comic-page { width: min(900px, 100%); flex: 1; display: flex; gap: 4px; align-items: center; justify-content: center; overflow: hidden; }
.comic-page.dual .comic-panel { height: 100%; flex: 1; }
.comic-page.single .comic-panel:last-child { display: none; }
.comic-page.single .comic-panel { flex: 0 0 62%; }
.comic-page.scroll { flex-direction: column; gap: 10px; overflow-y: auto; align-items: stretch; justify-content: flex-start; }
.comic-page.scroll .comic-panel { height: 420px; flex: none; }
.comic-panel { border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 12px; color: var(--muted); border: 1px solid var(--line); }
.comic-panel.left { background: linear-gradient(90deg, #1a1f2e, #151b26); }
.comic-panel.right { background: linear-gradient(90deg, #151b26, #1a1f2e); }
.comic-ctl { display: flex; gap: 10px; margin-top: 14px; align-items: center; width: min(900px, 100%); }
.comic-ctl .sep { width: 1px; height: 18px; background: var(--line2); }
.comic-mode { display: flex; gap: 4px; background: var(--bg3); border-radius: 8px; padding: 3px; }
.comic-mode button { padding: 5px 12px; font-size: 12px; border-radius: 6px; background: transparent; border: none; color: var(--muted); cursor: pointer; font-family: var(--font); }
.comic-mode button.on { background: var(--bg4); color: #fff; }
</style>
