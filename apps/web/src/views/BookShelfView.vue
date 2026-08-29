<template>
  <div class="bs-layout">
    <div class="bs-side card">
      <div class="bs-head">书库分组</div>
      <div class="bs-sep"></div>
      <div class="bs-body">
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
          <div class="bs-title">{{ activeGroupName }}书籍 <span class="tag green">{{ filteredBooks.length }}本</span></div>
          <div class="sort-chip" :class="{ on: sort === 'recent' }" @click="sort = 'recent'">最近阅读</div>
          <div class="sort-chip" :class="{ on: sort === 'name' }" @click="sort = 'name'">书名</div>
          <div class="sort-chip" :class="{ on: sort === 'time' }" @click="sort = 'time'">加入时间</div>
        </div>
        <div class="bs-sep"></div>
      </div>
      <div class="book-grid">
        <div v-if="!filteredBooks.length" class="empty">该分组下暂无书籍</div>
        <div v-for="b in filteredBooks" :key="b.title" class="book-card">
          <div class="poster" :class="b.cover">
            <div class="ph">
              <div class="t">{{ b.title }}</div>
              <div class="s">{{ b.status }}</div>
            </div>
          </div>
          <div class="nm">{{ b.title }}<span v-if="b.kind === 'comic'" class="tag gold" style="padding:0 4px;margin-left:4px">漫</span></div>
          <div class="st">{{ b.author }} · {{ b.chapter }}</div>
          <div class="prog-line"><i :style="{ width: b.progress + '%' }"></i></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const noop = () => {};
const activeGroup = ref('all');
const sort = ref('recent');

interface BookGroup { id: string; name: string; icon: string; count: number }
interface Book {
  title: string; author: string; chapter: string; status: string;
  group: string; cover: string; kind: string; progress: number;
}

const groups: BookGroup[] = [
  { id: 'all', name: '全部', icon: '≡', count: 10 },
  { id: '未分组', name: '未分组', icon: '○', count: 5 },
  { id: '玄幻', name: '玄幻', icon: '▣', count: 2 },
  { id: '科幻', name: '科幻', icon: '▣', count: 3 },
  { id: '灵异', name: '灵异', icon: '▣', count: 1 },
];

const books: Book[] = [
  { title: '诡秘之主', author: '爱潜水的乌贼', chapter: '第 892 章', status: '阅读中 46%', group: '未分组', cover: 'p1', kind: 'book', progress: 46 },
  { title: '大奉打更人', author: '卖报小郎君', chapter: '第 1,203 章', status: '已读完', group: '玄幻', cover: 'p4', kind: 'book', progress: 100 },
  { title: '深海余烬', author: '远瞳', chapter: '第 47 章', status: '阅读中 12%', group: '科幻', cover: 'p6', kind: 'book', progress: 12 },
  { title: '电锯人', author: '藤本树', chapter: '第 148 话', status: '已读完', group: '未分组', cover: 'p3', kind: 'comic', progress: 100 },
  { title: '灵境行者', author: '卖报小郎君', chapter: '第 217 章', status: '阅读中 78%', group: '玄幻', cover: 'p2', kind: 'book', progress: 78 },
  { title: '隐秘死角', author: '闭嘴听我唱', chapter: '第 55 章', status: '未开始', group: '未分组', cover: 'p5', kind: 'book', progress: 0 },
  { title: '三体', author: '刘慈欣', chapter: '第 1 章', status: '未开始', group: '科幻', cover: 'p7', kind: 'book', progress: 0 },
  { title: '我有一座冒险屋', author: '我会修空调', chapter: '第 1,058 章', status: '阅读中 33%', group: '未分组', cover: 'p3', kind: 'book', progress: 33 },
  { title: '深夜书屋', author: '纯洁滴小龙', chapter: '第 180 章', status: '已读完', group: '灵异', cover: 'p1', kind: 'book', progress: 100 },
  { title: '走进不科学', author: '新海临风', chapter: '第 88 章', status: '阅读中 5%', group: '科幻', cover: 'p5', kind: 'book', progress: 5 },
];

const activeGroupName = computed(() => {
  const g = groups.find(x => x.id === activeGroup.value);
  return g ? g.name : '全部';
});

const filteredBooks = computed(() => {
  let list = books.slice();
  if (activeGroup.value !== 'all') list = list.filter(b => b.group === activeGroup.value);
  if (sort.value === 'name') list.sort((a, b) => a.title.localeCompare(b.title, 'zh'));
  else if (sort.value === 'time') list.reverse();
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
