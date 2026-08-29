<template>
  <div class="studio">
    <div class="st-left">
      <div class="src-picker">
        <div class="n"><span class="tag acc">{{ currentSrc?.type }}</span><b>{{ currentSrc?.name }}</b></div>
        <div class="u">{{ currentSrc?.url }}</div>
      </div>
      <input class="disc-search" placeholder="筛选已保存的源…" :value="srcFilter" @input="srcFilter = ($event.target as HTMLInputElement).value">
      <div class="st-src-list">
        <div
          v-for="(src, i) in filteredSources"
          :key="i"
          class="st-src-item"
          :class="{ on: src.on }"
          @click="pickSrc(i)"
        >
          <span class="st-src-t">{{ src.type }}</span>
          <span class="st-src-n">{{ src.name }}</span>
        </div>
      </div>
      <template v-for="group in fieldGroups" :key="group.group">
        <div class="field-group">{{ group.label }}</div>
        <div
          v-for="item in group.items"
          :key="group.group + '.' + item.field"
          class="field-item"
          :class="{ on: currentField === group.group + '.' + item.field }"
          @click="pickField(group.group + '.' + item.field)"
        >
          <span class="k">{{ item.label }} <i>{{ item.field }}</i></span>
          <span class="itype">{{ item.itype }}</span>
        </div>
      </template>
    </div>

    <div class="st-mid">
      <div class="editor-head">
        <span class="tag cy" style="font-family:var(--mono)">{{ currentField }}</span>
        <div class="se-tabs">
          <div class="se-tab" :class="{ on: editorMode === 'code' }" @click="editorMode = 'code'">源码</div>
          <div class="se-tab" :class="{ on: editorMode === 'vis' }" @click="editorMode = 'vis'">可视化</div>
        </div>
      </div>
      <div class="snippet-row">
        <span class="sl">语法</span>
        <div
          v-for="snip in snippets"
          :key="snip.key"
          class="snippet-tag"
          :class="{ on: snip.on }"
          @click="pickSnippet(snip.key)"
        >{{ snip.label }}</div>
      </div>
      <div class="code-area" :class="{ on: editorMode === 'code' }">
        <div v-for="(line, i) in codeLines" :key="i" class="code-line">
          <span class="ln">{{ i + 1 }}</span>
          <span class="cd"><span v-for="(tok, j) in line" :key="j" :class="tok.cls">{{ tok.text }}</span></span>
        </div>
      </div>
      <div class="vis-view" :class="{ on: editorMode === 'vis' }">
        <div v-for="(row, i) in visRows" :key="i" class="vis-row">
          <span class="vk">{{ row.k }}</span>
          <span class="vr">{{ row.r }}</span>
          <span class="vo">{{ row.o }}</span>
        </div>
      </div>
      <div class="st-toolbar">
        <button class="btn sm primary" @click="noop">▶ 调试运行</button>
        <button class="btn sm" @click="noop">💾 保存</button>
        <button class="btn sm" @click="noop">↧ 导出</button>
        <button class="btn sm" @click="noop">⌥ 格式化</button>
        <button class="btn sm" @click="noop">↺ 回滚</button>
        <button class="btn sm" @click="noop">? 语法帮助</button>
        <span style="margin-left:auto;font-size:11px;color:var(--faint);font-family:var(--mono)">Monaco · omniflow-rule DSL</span>
      </div>
    </div>

    <div class="st-right">
      <div class="dbg-head">
        <div class="t">调试器 · 分步执行 <span class="tag green">就绪</span></div>
        <div class="st"><span>管道: search</span><span>引擎: <b>CSS</b></span><span>源: <b>笔趣阁</b></span><span>耗时: <b>0ms</b></span></div>
      </div>
      <div class="dbg-steps">
        <div
          v-for="(step, i) in debugSteps"
          :key="i"
          class="step"
          :class="[step.state, { open: openStep === i }]"
        >
          <div class="sh" @click="openStep = openStep === i ? -1 : i">
            <span class="n">{{ step.num }}</span>
            <span class="ic">
              <svg v-if="step.state === 'done'" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
              <svg v-else-if="step.state === 'run'" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" /></svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9" /></svg>
            </span>
            <span class="tt">{{ step.title }}</span>
            <span class="ms">{{ step.ms }}</span>
            <span class="chev">▸</span>
          </div>
          <div class="sb">
            <div class="kv"><span class="k">详情:</span><span class="v">{{ step.detail }}</span></div>
          </div>
        </div>
      </div>
      <div class="st-toolbar">
        <button class="btn sm" @click="noop">下一步 ▸</button>
        <button class="btn sm" @click="noop">◎ 断点</button>
        <button class="btn sm ghost" @click="noop">⟲ 重置</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const srcFilter = ref('');
const savedSources = ref([
  { type: 'legado', name: '笔趣阁·示例源', url: 'https://www.xbiquge.la', on: true },
  { type: 'cms', name: '量子资源', url: 'https://api.liangzi.cc', on: false },
  { type: 'tvbox', name: 'TVBox 影视', url: 'https://tvbox.example', on: false },
  { type: 'drpy', name: 'drpy 演示', url: 'https://drpy.example', on: false },
  { type: 'eso', name: '海阔视界', url: 'https://eso.example', on: false },
]);
const currentSrc = computed(() => savedSources.value.find((s) => s.on) ?? savedSources.value[0]);
const filteredSources = computed(() =>
  savedSources.value.filter((s) => s.name.toLowerCase().includes(srcFilter.value.toLowerCase()))
);

interface FieldItem { label: string; field: string; itype: string }
const fieldGroups = ref<{ label: string; group: string; items: FieldItem[] }[]>([
  {
    label: '◈ 搜索 ruleSearch', group: 'ruleSearch',
    items: [
      { label: '列表', field: 'bookList', itype: 'jsoup' },
      { label: '书名', field: 'name', itype: 'css' },
      { label: '作者', field: 'author', itype: 'jsoup' },
      { label: '详情URL', field: 'bookUrl', itype: 'css' },
      { label: '封面', field: 'coverUrl', itype: 'regex' },
      { label: '简介', field: 'intro', itype: 'css' },
    ],
  },
  {
    label: '◈ 详情 ruleBookInfo', group: 'ruleBookInfo',
    items: [
      { label: '书名', field: 'name', itype: 'css' },
      { label: '作者', field: 'author', itype: 'css' },
      { label: '最新章节', field: 'lastChapter', itype: 'xpath' },
      { label: '简介', field: 'intro', itype: 'css' },
      { label: '目录URL', field: 'tocUrl', itype: 'jsoup' },
    ],
  },
  {
    label: '◈ 目录 ruleToc', group: 'ruleToc',
    items: [
      { label: '章节列表', field: 'chapterList', itype: 'css' },
      { label: '章节名', field: 'chapterName', itype: 'css' },
      { label: '章节URL', field: 'chapterUrl', itype: 'css' },
      { label: '下一目录', field: 'nextTocUrl', itype: 'js' },
    ],
  },
  {
    label: '◈ 正文 ruleContent', group: 'ruleContent',
    items: [
      { label: '正文内容', field: 'content', itype: 'js' },
      { label: '下一章', field: 'nextContentUrl', itype: 'js' },
    ],
  },
]);
const currentField = ref('ruleSearch.bookList');

const snippets = ref([
  { key: 'jsoup', label: 'JSoup', on: false },
  { key: 'css', label: '@css:', on: true },
  { key: 'xpath', label: '// XPath', on: false },
  { key: 'jsonpath', label: '$. JsonPath', on: false },
  { key: 'regex', label: ': 正则', on: false },
  { key: 'js', label: '@js:', on: false },
  { key: 'tpl', label: '{{ }} 模板', on: false },
  { key: 'mix', label: '✦ 混合', on: false },
]);
const editorMode = ref<'code' | 'vis'>('code');

interface CodeToken { cls: string; text: string }
const codeLines = ref<CodeToken[][]>([
  [{ cls: 'c-com', text: '# ruleSearch.bookList · 列表选择器（CSS 语法）' }],
  [{ cls: 'c-rule', text: '@css:' }, { cls: 'c-str', text: '.search-list .item' }, { cls: 'c-fn', text: ' => ' }, { cls: 'c-var', text: 'books[]' }],
  [{ cls: 'c-com', text: '# 字段映射（子规则）' }],
  [{ cls: 'c-key', text: 'name' }, { cls: 'c-fn', text: ': ' }, { cls: 'c-str', text: '.title@text' }],
  [{ cls: 'c-key', text: 'author' }, { cls: 'c-fn', text: ': ' }, { cls: 'c-str', text: '.author@text' }],
  [{ cls: 'c-key', text: 'bookUrl' }, { cls: 'c-fn', text: ': ' }, { cls: 'c-str', text: 'a@href' }],
  [{ cls: 'c-key', text: 'coverUrl' }, { cls: 'c-fn', text: ': ' }, { cls: 'c-str', text: 'img@src' }],
  [{ cls: 'c-key', text: 'intro' }, { cls: 'c-fn', text: ': ' }, { cls: 'c-str', text: '.intro@text' }],
  [{ cls: 'c-com', text: '# 翻页（下一页 URL）' }],
  [{ cls: 'c-key', text: 'nextUrl' }, { cls: 'c-fn', text: ': ' }, { cls: 'c-str', text: '.pager a.next@href' }],
]);
const visRows = ref([
  { k: 'bookList', r: '.search-list .item', o: 'Array(20)' },
  { k: 'name', r: '.title@text', o: '三体' },
  { k: 'author', r: '.author@text', o: '刘慈欣' },
  { k: 'bookUrl', r: 'a@href', o: '/book/123' },
  { k: 'coverUrl', r: 'img@src', o: 'https://.../cover.jpg' },
  { k: 'intro', r: '.intro@text', o: '纳米科学家汪淼…' },
]);

interface DebugStep { state: 'done' | 'run' | 'pending'; num: string; title: string; ms: string; detail: string }
const debugSteps = ref<DebugStep[]>([
  { state: 'done', num: '01', title: '段 1 · init', ms: '3ms', detail: 'baseUrl / headers 设定 ✓' },
  { state: 'done', num: '02', title: '段 2 · searchUrl', ms: '56ms', detail: 'GET /search.php?q=三体 → 200 OK' },
  { state: 'run', num: '02.1', title: '段 2.1 · bookList', ms: '—', detail: 'CSS 选择器匹配中…' },
  { state: 'pending', num: '03', title: '段 3 · 详情', ms: '—', detail: '（待执行）' },
  { state: 'pending', num: '04', title: '段 4 · 正文', ms: '—', detail: '（待执行）' },
]);
const openStep = ref(2);

function pickSrc(i: number) {
  savedSources.value.forEach((s, idx) => { s.on = idx === i; });
}
function pickField(field: string) {
  currentField.value = field;
}
function pickSnippet(key: string) {
  snippets.value.forEach((s) => { s.on = s.key === key; });
}
function noop() {}
</script>

<style scoped>
.studio { display: flex; height: calc(100vh - 100px); border: 1px solid var(--line); border-radius: 16px; overflow: hidden; background: var(--bg2); }
.st-left { width: 260px; flex-shrink: 0; border-right: 1px solid var(--line); overflow-y: auto; padding: 12px; }
.src-picker { padding: 10px; border-radius: 10px; background: var(--bg3); border: 1px solid var(--line); margin-bottom: 10px; }
.src-picker .n { font-size: 13px; font-weight: 700; display: flex; align-items: center; gap: 8px; }
.src-picker .u { font-size: 10px; color: var(--faint); font-family: var(--mono); margin-top: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.disc-search {
  width: 100%; background-color: var(--bg3);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%238b93a7'%3E%3Cpath d='M15.5 14h-.8l-.3-.3a6.5 6.5 0 1 0-.7.7l.3.3v.8l5 5 1.5-1.5-5-5zm-6 0a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9z'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: 11px center; background-size: 15px 15px;
  border: 1px solid var(--line); border-radius: 8px; padding: 8px 11px 8px 34px;
  color: var(--text); font-size: 12px; outline: none; font-family: var(--font); flex-shrink: 0;
}
.disc-search:focus { border-color: var(--acc-dim); }
.st-src-list { max-height: 130px; overflow-y: auto; margin-bottom: 10px; }
.st-src-item { display: flex; align-items: center; gap: 8px; padding: 6px 8px; border-radius: 7px; cursor: pointer; font-size: 11.5px; margin-bottom: 3px; }
.st-src-item:hover { background: var(--bg3); }
.st-src-item.on { background: rgba(108,124,255,.16); color: #fff; }
.st-src-item .st-src-t { font-size: 9px; padding: 1px 5px; border-radius: 4px; background: var(--bg4); color: var(--muted); text-transform: uppercase; }
.st-src-item.on .st-src-t { background: var(--acc); color: #fff; }
.st-src-item .st-src-n { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.field-group { margin: 10px 2px 6px; font-size: 10px; color: var(--faint); letter-spacing: 1.2px; }
.field-item { display: flex; align-items: center; gap: 8px; padding: 7px 9px; border-radius: 8px; cursor: pointer; font-size: 12px; color: #c4cad8; transition: background 0.15s; }
.field-item:hover { background: var(--bg3); }
.field-item.on { background: rgba(108,124,255,.16); color: #fff; box-shadow: inset 2px 0 0 var(--acc); }
.field-item .k { font-size: 12px; flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.field-item .k i { font-style: normal; font-family: var(--mono); font-size: 10px; color: var(--muted); margin-left: 4px; }
.field-item .itype { margin-left: auto; font-size: 9px; padding: 1px 6px; border-radius: 4px; background: var(--bg4); color: var(--muted); flex-shrink: 0; }
.st-mid { flex: 1; display: flex; flex-direction: column; min-width: 0; border-right: 1px solid var(--line); }
.st-mid .editor-head { display: flex; align-items: center; gap: 8px; padding: 10px 14px; border-bottom: 1px solid var(--line); background: var(--bg3); }
.se-tabs { display: flex; gap: 4px; margin-left: auto; }
.se-tab { font-size: 11px; font-family: var(--mono); padding: 4px 10px; border-radius: 6px; cursor: pointer; color: var(--muted); transition: all 0.15s; border: 1px solid transparent; }
.se-tab:hover { color: var(--text); }
.se-tab.on { background: var(--bg4); color: var(--cy); border-color: var(--line2); }
.snippet-row { display: flex; gap: 6px; padding: 9px 14px; border-bottom: 1px solid var(--line); background: var(--bg3); flex-wrap: wrap; align-items: center; }
.snippet-row .sl { font-size: 10px; color: var(--faint); letter-spacing: 1px; }
.snippet-tag { font-size: 10.5px; padding: 3px 9px; border-radius: 6px; background: var(--bg4); color: var(--muted); cursor: pointer; font-family: var(--mono); border: 1px solid transparent; transition: all 0.15s; }
.snippet-tag:hover { color: var(--text); border-color: var(--line2); }
.snippet-tag.on { background: rgba(34,211,238,.12); color: var(--cy); border-color: rgba(34,211,238,.3); }
.code-area { flex: 1; overflow: auto; padding: 16px 18px; font-family: var(--mono); font-size: 12.5px; line-height: 1.75; background: #0b0f16; min-height: 0; display: none; }
.code-area.on { display: block; }
.code-line { display: flex; white-space: pre; }
.code-line .ln { width: 34px; flex-shrink: 0; color: #3d4658; text-align: right; padding-right: 14px; user-select: none; }
.code-line .cd { flex: 1; }
.c-key { color: #c792ea; } .c-str { color: #a5d6a7; } .c-fn { color: #82aaff; } .c-num { color: #f78c6c; }
.c-rule { color: #22d3ee; } .c-com { color: #546e8a; font-style: italic; }
.c-attr { color: #ffcb6b; } .c-var { color: #f07178; }
.vis-view { flex: 1; overflow: auto; padding: 16px 18px; background: #0b0f16; min-height: 0; display: none; }
.vis-view.on { display: block; }
.vis-row { display: flex; align-items: center; gap: 12px; padding: 11px 12px; border-radius: 9px; background: var(--bg2); border: 1px solid var(--line); margin-bottom: 8px; }
.vis-row .vk { font-family: var(--mono); font-size: 12px; color: var(--cy); width: 130px; flex-shrink: 0; }
.vis-row .vr { flex: 1; font-family: var(--mono); font-size: 11.5px; color: #aeb8cc; background: var(--bg3); padding: 6px 10px; border-radius: 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.vis-row .vo { font-family: var(--mono); font-size: 11px; color: var(--green); width: 150px; flex-shrink: 0; text-align: right; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.st-right { width: 330px; flex-shrink: 0; display: flex; flex-direction: column; background: var(--bg2); }
.dbg-head { padding: 12px 14px; border-bottom: 1px solid var(--line); background: var(--bg3); }
.dbg-head .t { font-size: 13px; font-weight: 700; display: flex; align-items: center; gap: 8px; }
.dbg-head .st { font-size: 10.5px; color: var(--muted); font-family: var(--mono); margin-top: 6px; display: flex; gap: 12px; flex-wrap: wrap; }
.dbg-head .st b { color: var(--green); }
.dbg-steps { flex: 1; overflow-y: auto; padding: 12px 10px; }
.step { border-radius: 10px; margin-bottom: 8px; border: 1px solid var(--line); background: var(--bg3); overflow: hidden; transition: border-color 0.2s, box-shadow 0.2s; }
.step.done { border-color: rgba(52,211,153,.35); }
.step.run { border-color: var(--acc); box-shadow: 0 0 0 1px var(--acc), 0 0 20px var(--acc-glow); }
.step .sh { display: flex; align-items: center; gap: 10px; padding: 9px 12px; cursor: pointer; }
.step .sh .n { font-family: var(--mono); font-size: 10px; color: var(--faint); width: 22px; }
.step .sh .ic { width: 18px; height: 18px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
.step .sh .ic svg { width: 15px; height: 15px; }
.step .sh .tt { font-size: 12px; font-weight: 600; flex: 1; }
.step .sh .ms { font-family: var(--mono); font-size: 10px; color: var(--muted); }
.step .sh .chev { color: var(--faint); font-size: 10px; transition: transform 0.2s; }
.step.open .sh .chev { transform: rotate(90deg); }
.step .sb { display: none; border-top: 1px dashed var(--line2); padding: 10px 12px; font-family: var(--mono); font-size: 10.5px; line-height: 1.7; color: var(--muted); background: #0a0e15; }
.step.open .sb { display: block; }
.kv { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 6px; }
.kv .k { color: var(--faint); }
.kv .v { color: #aeb8cc; word-break: break-all; }
.st-toolbar { display: flex; gap: 8px; padding: 10px; border-top: 1px solid var(--line); background: var(--bg3); flex-wrap: wrap; }
</style>
