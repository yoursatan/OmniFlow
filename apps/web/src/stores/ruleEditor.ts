import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
  RulePipeline, RuleSegment, UnifiedSource, SourceKind, SourceFormat,
} from '@omniflow/shared';

/**
 * 规则工坊编辑状态（M6 对接 Monaco + DebugSession）。
 * 设计目标：
 *   - 支持「源码 / 可视化」双视图切换
 *   - 段-步 v2 结构的可变性：segment/steps 拖拽排序、字段补全、历史回滚
 *   - 右侧分步调试 DebugSession 的运行状态在此集中保存
 *
 * UnifiedSource 的规则管道分为 explore / search / detail / toc / content / sniff / feed。
 * ruleEditor 默认打开 search 管道，用户可切换 `activePipelineName` 编辑不同场景。
 */
export const useRuleEditor = defineStore('ruleEditor', () => {
  // ---- 正在编辑的源 ----
  const editingSource = ref<UnifiedSource | null>(null);
  const mode = ref<'code' | 'visual'>('visual');
  const dirty = ref(false);
  const history = ref<RulePipeline[]>([]);
  const activePipelineName = ref<'explore' | 'search' | 'detail' | 'toc' | 'content' | 'sniff' | 'feed'>('search');

  // ---- 正在编辑的管道（段-步 v2 结构） ----
  const pipeline = ref<RulePipeline>({
    name: 'search',
    segments: [
      emptySegment('init',   '初始化'),
      emptySegment('req',    '搜索请求'),
      emptySegment('parse',  '列表选择'),
      emptySegment('map',    '字段映射'),
    ],
  });

  // ---- 右侧调试器会话 ----
  const debugSession = ref<{
    running: boolean;
    currentSegmentIdx: number;
    currentStepIdx: number;
    log: Array<{ ts: number; level: 'info' | 'warn' | 'error'; text: string }>;
  }>({
    running: false, currentSegmentIdx: -1, currentStepIdx: -1, log: [],
  });

  // ---- 计算 ----
  const segmentsCount = computed(() => pipeline.value.segments.length);
  const totalSteps    = computed(() => pipeline.value.segments.reduce((n, s) => n + s.steps.length, 0));

  function pickPipeline(src: UnifiedSource, key: typeof activePipelineName.value): RulePipeline {
    switch (key) {
      case 'explore': return src.explore ?? mkEmpty('explore');
      case 'search':  return src.search;
      case 'detail':  return src.detail;
      case 'toc':     return src.toc;
      case 'content': return src.content;
      case 'sniff':   return src.sniff   ?? mkEmpty('sniff');
      case 'feed':    return src.feed    ?? mkEmpty('feed');
    }
  }

  // ---- Actions ----
  function loadFromSource(src: UnifiedSource) {
    editingSource.value = src;
    pipeline.value = structuredClone(pickPipeline(src, activePipelineName.value));
    history.value = [];
    dirty.value = false;
    debugSession.value = { running: false, currentSegmentIdx: -1, currentStepIdx: -1, log: [] };
  }

  function newBlankSource(
    name = '未命名规则',
    kind: SourceKind = 'book',
    format: SourceFormat = 'legado3_book',
  ) {
    const base = mkEmpty('content');
    const src: UnifiedSource = {
      id: 'src-' + Math.random().toString(36).slice(2, 10),
      name,
      kind,
      format,
      group: '默认分组',
      homeUrl: '',
      version: 1,
      explore:  mkEmpty('explore'),
      search:   mkEmpty('search'),
      detail:   mkEmpty('detail'),
      toc:      mkEmpty('toc'),
      content:  structuredClone(pipeline.value.name === 'content' ? pipeline.value : base) as RulePipeline,
      enabled:  true,
      tags: [],
    };
    loadFromSource(src);
  }

  function switchPipeline(next: typeof activePipelineName.value) {
    activePipelineName.value = next;
    if (editingSource.value) {
      pipeline.value = structuredClone(pickPipeline(editingSource.value, next));
    } else {
      pipeline.value = mkEmpty(next);
    }
  }

  function addSegment(label: string, id?: string) {
    pipeline.value.segments.push(emptySegment(id ?? `seg_${Date.now()}`, label));
    snapshot();
  }

  function removeSegment(idx: number) {
    pipeline.value.segments.splice(idx, 1);
    snapshot();
  }

  function runDebug() {
    debugSession.value = {
      running: true,
      currentSegmentIdx: 0,
      currentStepIdx: 0,
      log: [{ ts: Date.now(), level: 'info', text: `[Debugger] start session @ pipeline=${pipeline.value.name} (mock / M6 real)` }],
    };
  }
  function stepDebug() {
    const d = debugSession.value;
    if (!d.running) return;
    d.currentStepIdx++;
    d.log.push({ ts: Date.now(), level: 'info', text: `step → seg#${d.currentSegmentIdx} step#${d.currentStepIdx}` });
  }
  function stopDebug() {
    debugSession.value.running = false;
    debugSession.value.log.push({ ts: Date.now(), level: 'warn', text: '[Debugger] stop' });
  }

  function snapshot() {
    history.value.push(structuredClone(pipeline.value) as RulePipeline);
    if (history.value.length > 30) history.value.shift();
    dirty.value = true;
  }
  function rollback() {
    const last = history.value.pop();
    if (last) { pipeline.value = last; dirty.value = true; }
  }

  return {
    editingSource, mode, dirty, history, pipeline, debugSession,
    activePipelineName, segmentsCount, totalSteps,
    loadFromSource, newBlankSource, switchPipeline,
    addSegment, removeSegment,
    runDebug, stepDebug, stopDebug,
    snapshot, rollback,
  };
});

function mkEmpty(name: RulePipeline['name']): RulePipeline {
  return { name, segments: [] };
}

function emptySegment(id: string, label?: string): RuleSegment {
  return { id, label, steps: [] };
}
