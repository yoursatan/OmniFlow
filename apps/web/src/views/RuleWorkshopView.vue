<template>
  <div class="omni-card workshop">
    <h2>规则工坊 · 屏 #09（子视图 · 新建源 / 编辑源）</h2>
    <p class="omni-muted">
      三栏布局：<b>左</b> 已保存源列表 + 规则字段树（中文 + 英文标识）；
      <b>中</b> 源码 / 可视化切换 + 8 种语法片段 + 保存/导出/格式化/回滚；
      <b>右</b> 段-步分步调试器。
    </p>

    <el-row :gutter="14" class="workshop-3cols">
      <!-- 左栏：源列表 + 字段树 -->
      <el-col :span="5" class="col">
        <div class="col-title">已保存源</div>
        <el-input v-model="s" size="small" placeholder="筛选源名…" clearable style="margin-bottom: 8px;">
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <div class="src-list">
          <div v-for="src in sources" :key="src.key" class="src-row" :class="{ active: src.key === 'demo' }">
            <div class="nm">{{ src.name }}</div>
            <div class="mt omni-muted">{{ src.kind }} · {{ src.group }}</div>
          </div>
        </div>
        <div class="col-title" style="margin-top: 14px;">规则字段树</div>
        <el-tree :data="fieldTree" default-expand-all :props="{ label: 't' }" />
      </el-col>

      <!-- 中栏：编辑器 -->
      <el-col :span="12" class="col">
        <div class="toolbar">
          <el-radio-group v-model="mode" size="default">
            <el-radio-button label="code">源码</el-radio-button>
            <el-radio-button label="visual">可视化</el-radio-button>
          </el-radio-group>
          <div class="segments">
            <span class="omni-muted" style="margin-right: 8px;">片段：</span>
            <el-tag v-for="seg in snippets" :key="seg" size="small" effect="plain" round class="seg">{{ seg }}</el-tag>
          </div>
          <el-space style="margin-left: auto;">
            <el-button :icon="RefreshLeft">回滚</el-button>
            <el-button :icon="MagicStick">格式化</el-button>
            <el-button :icon="Download">导出</el-button>
            <el-button type="primary" :icon="Check">保存</el-button>
          </el-space>
        </div>
        <div class="monaco-placeholder">
          <div class="cmt omni-muted">// Monaco 编辑器占位（M6 接入 monaco-editor + 自定义 DSL 高亮/补全）</div>
          <pre style="margin:0">{{ codeSample }}</pre>
        </div>
      </el-col>

      <!-- 右栏：段-步调试器 -->
      <el-col :span="7" class="col">
        <div class="col-title">
          段-步调试器
          <el-tag size="small" style="margin-left: 6px;" type="warning">v2 流水线</el-tag>
        </div>
        <el-space style="margin-bottom: 10px;">
          <el-button size="small" type="primary" :icon="VideoPlay">运行</el-button>
          <el-button size="small" :icon="DArrowRight">单步</el-button>
          <el-button size="small" :icon="VideoPause">暂停</el-button>
          <el-button size="small" :icon="Delete">清空</el-button>
        </el-space>
        <el-steps direction="vertical" :active="2" finish-status="success">
          <el-step title="段 1 · init" description="baseUrl / headers 设定…  耗时 3ms ✅" />
          <el-step title="段 2 · 搜索 (searchUrl)" description="分页变量填充 + 请求发出 → 200 OK  耗时 56ms ✅" />
          <el-step title="步骤 2.1 · $.result 列表选择" status="process" description="展开中…">
            <div class="step-detail omni-muted">
              <div>输入 JSON (1.2KB)：<el-tag size="small">application/json</el-tag></div>
              <div>cheerio 选择器：<code>{{ '$.result' }}</code></div>
              <div>中间结果：Array(20) · 等待 inspector 展开</div>
            </div>
          </el-step>
          <el-step title="段 3 · 详情页" description="（待执行）" />
          <el-step title="段 4 · 正文 / 播放源" description="（待执行）" />
        </el-steps>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  Search, RefreshLeft, MagicStick, Download, Check, VideoPlay, VideoPause, DArrowRight, Delete
} from '@element-plus/icons-vue';

const s = ref('');
const sources = [
  { key: 'demo',  name: '演示书源',       kind: 'Legado A', group: '默认分组' },
  { key: 't1',    name: '某 CMS 影视',    kind: 'TVBox C',  group: '影视分组' },
  { key: 't2',    name: 'RSS · InfoQ 中', kind: 'RSS D',    group: '订阅' },
];
const fieldTree = [
  { t: '基础字段', children: [
    { t: 'key (唯一键)' }, { t: 'name (中文名)' }, { t: 'kind (SourceKind)' }, { t: 'baseUrl' }, { t: 'group' },
  ] },
  { t: '段-步 RulePipeline', children: [
    { t: 'search (搜索段)' }, { t: 'detail (详情段)' }, { t: 'toc (章节目录段)' },
    { t: 'content (正文段/播放源段)' }, { t: 'checkin (签到段, 可选)' },
  ] },
  { t: 'JS 沙箱配置', children: [{ t: 'sandbox.version' }, { t: 'sandbox.requires' }] },
];

const mode = ref<'code' | 'visual'>('code');
const snippets = ['@css:', '@json:', '$.', '{{ }}', '@js:', 'replace(,)', 'grep:', 'encodeURI'];
const codeSample = `# OmniFlow 规则草稿（占位，M6 Monaco 渲染）
key      = demo-book-source
name     = 演示书源
kind     = legado
baseUrl  = https://example.com

[search]
1. GET      \${baseUrl}/search?q=\${key}
2. @json    $.data.list  => books[]
3. map      name: $.title,  author: $.author,  bookId: $.id

[detail @ bookId]
1. GET      \${baseUrl}/book/\${bookId}
2. @css     #intro  => intro
3. @css     ul.chapters li => chapters[]

[content @ chapterId]
1. GET      \${baseUrl}/read/\${chapterId}
2. @css     div.content  =>  text
`;
// TODO(M6): 接入 Monaco Editor，DSL 高亮 + 自动补全；与 core/engine DebugSession 对接分步调试
</script>

<style scoped>
.workshop-3cols .col { background: var(--bg-1); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px; height: 74vh; min-height: 620px; display: flex; flex-direction: column; }
.col-title { font-size: 13px; font-weight: 700; color: var(--text-1); margin-bottom: 10px; }
.src-row { padding: 8px 10px; border-radius: 6px; margin-bottom: 4px; border: 1px solid transparent; }
.src-row:hover { background: var(--bg-3); }
.src-row.active { background: var(--brand-soft); border-color: var(--brand); }
.src-row .nm { font-weight: 600; }
.src-row .mt { font-size: 11px; margin-top: 2px; }
.toolbar { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; flex-wrap: wrap; }
.segments { display: inline-flex; align-items: center; flex-wrap: wrap; }
.seg { margin-right: 4px; margin-bottom: 2px; }
.monaco-placeholder {
  flex: 1; background: #0c0e14; border: 1px solid var(--border); border-radius: 8px;
  padding: 14px; font-family: ui-monospace, 'JetBrains Mono', Consolas, monospace; font-size: 12.5px; line-height: 1.6;
  overflow: auto;
}
.cmt { margin-bottom: 8px; }
.step-detail { margin-top: 8px; padding: 8px 10px; background: var(--bg-2); border-radius: 6px; font-size: 12px; }
</style>
