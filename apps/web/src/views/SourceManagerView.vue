<template>
  <div class="disc-layout">
    <div class="disc-main card">
      <div class="src-header">
        <div class="src-toolbar">
          <button class="btn primary" @click="() => {}">＋ 导入源</button>
          <button class="btn" @click="$router.push('/workshop')">＋ 新建源</button>
          <button class="btn">⌕ 源体检（批量）</button>
          <button class="btn">↧ 备份/导出</button>
          <button class="btn">↑ WebDAV 同步</button>
          <div class="src-count">
            <span>共 <b style="color:var(--text)">87</b> 源</span>
            <span class="tag green">健康 84</span>
            <span class="tag orange">缓慢 2</span>
            <span class="tag red">失效 1</span>
          </div>
        </div>

        <div class="catbar" style="margin-top:2px">
          <span class="cat-label">源分类</span>
          <div v-for="c in cats" :key="c.key" class="cat-chip" :class="{ on: activeCat === c.key }"
            @click="activeCat = c.key">
            {{ c.label }} <span class="n">{{ c.count }}</span>
          </div>
          <div style="margin-left:auto">
            <button class="btn sm ghost">⊞ 分组</button>
          </div>
        </div>
      </div>
      <div class="disc-sep"></div>
      <div class="disc-content">
        <div v-for="s in sources" :key="s.id" class="src-row">
          <div class="si">{{ s.icon }}</div>
          <div class="nm">
            <b>{{ s.name }} <span class="tag">{{ s.kind }}</span></b>
            <div class="u">{{ s.url }}</div>
          </div>
          <div class="health">
            <div class="ht">
              <span>{{ s.health }}%</span>
              <span :style="{ color: s.color }">{{ s.status }}</span>
            </div>
            <div class="hbar"><i :style="{ width: s.health + '%', background: s.color }"></i></div>
          </div>
          <div class="src-actions">
            <div class="iconbtn" title="编辑" @click="$router.push('/workshop')">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
              </svg>
            </div>
            <div class="iconbtn" title="体检">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-3 10h-2v2h-2v-2h-2v-2h2V9h2v2h2v2z" />
              </svg>
            </div>
            <div class="iconbtn" title="删除">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const activeCat = ref('all');
const cats = [
  { key: 'all', label: '全部', count: 87 },
  { key: 'book', label: '书源', count: 41 },
  { key: 'comic', label: '漫画', count: 8 },
  { key: 'video', label: '影视', count: 23 },
  { key: 'rss', label: 'RSS', count: 9 },
  { key: 'live', label: '直播', count: 6 },
  { key: 'parse', label: '解析', count: 14 },
];
const sources = [
  { id: 1, icon: '📚', name: '笔趣阁·示例源', url: 'https://www.xbiquge.la', kind: 'legado', health: 96, status: '健康', color: 'var(--green)' },
  { id: 2, icon: '🎬', name: '量子资源', url: 'https://api.liangzi.vip', kind: 'tvbox', health: 92, status: '健康', color: 'var(--green)' },
  { id: 3, icon: '🎥', name: '非凡CMS', url: 'https://feifan-cms.example.com', kind: 'cms', health: 68, status: '缓慢', color: 'var(--orange)' },
  { id: 4, icon: '📺', name: 'IPTV·港澳台', url: 'https://iptv.example.org/ta.m3u', kind: 'iptv', health: 100, status: '健康', color: 'var(--green)' },
  { id: 5, icon: '📡', name: '少数派·效率', url: 'https://sspai.com/feed', kind: 'rss', health: 0, status: '失效', color: 'var(--red)' },
];
// TODO(M1/M2): sourceManager store 对接 @omniflow/core repo；批量体检走 engine.run + 健康度加权
</script>

<style scoped>
.disc-layout { display: flex; gap: 18px; height: calc(100vh - 100px); }
.disc-main { flex: 1; min-width: 410px; display: flex; flex-direction: column; overflow-y: auto; padding: 0; }
.disc-main .disc-sep { margin: 12px 0 0; }
.disc-sep { height: 1px; background: var(--line); flex-shrink: 0; }
.disc-content { flex: 1; overflow-y: auto; padding: 14px 16px; min-height: 0; }

.src-header { padding: 14px 16px 0; flex-shrink: 0; display: flex; gap: 12px; flex-direction: column; }
.src-header .src-toolbar { margin-bottom: 0; }
.src-toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.src-count { margin-left: auto; display: flex; gap: 14px; color: var(--muted); font-size: 12px; align-items: center; }

.src-row {
  display: flex; align-items: center; gap: 14px; padding: 13px 16px; border-radius: 12px;
  margin-bottom: 8px; background: var(--bg2); border: 1px solid var(--line); transition: all .15s;
}
.src-row:hover { border-color: var(--line2); }
.src-row .si {
  width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center;
  justify-content: center; font-size: 16px; flex-shrink: 0; background: var(--bg3); border: 1px solid var(--line);
}
.src-row .nm { flex: 1; min-width: 0; }
.src-row .nm b { font-size: 13.5px; display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.src-row .nm .u {
  font-size: 11px; color: var(--faint); font-family: var(--mono); margin-top: 2px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.health { width: 130px; flex-shrink: 0; }
.health .ht {
  font-size: 10.5px; color: var(--muted); display: flex; justify-content: space-between;
  font-family: var(--mono); margin-bottom: 5px;
}
.hbar { height: 4px; border-radius: 2px; background: var(--bg4); overflow: hidden; }
.hbar i { display: block; height: 100%; border-radius: 2px; }

.iconbtn {
  width: 34px; height: 34px; border-radius: 9px; border: 1px solid var(--line);
  background: var(--bg3); display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: var(--muted); transition: all .18s;
}
.iconbtn:hover { color: var(--text); border-color: var(--line2); }
.iconbtn svg { width: 17px; height: 17px; }
.src-actions { display: flex; gap: 6px; margin-left: 4px; }
.src-actions .iconbtn { width: 30px; height: 30px; }
.src-actions .iconbtn svg { width: 15px; height: 15px; }
</style>
