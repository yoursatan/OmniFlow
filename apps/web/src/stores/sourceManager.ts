import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
  UnifiedSource, SourceKind, SourceFormat, SourceHealth, RulePipeline,
} from '@omniflow/shared';

/**
 * 源管理 store。字段严格对齐 @omniflow/shared：
 *  - id 唯一 / kind / format / homeUrl / search / detail / toc / content (必需)
 *  - health: { score, successRate, avgLatencyMs, lastSuccessAt, lastFailureAt, consecutiveFailures }
 */

type Row = UnifiedSource & {
  // 表展示的 UI 辅助字段（非 IR）
  lastRunAt?: string;
};

export const useSourceManager = defineStore('sourceManager', () => {
  const sources = ref<Row[]>([]);
  const keyword = ref('');
  const kindFilter = ref<SourceKind | 'all'>('all');
  const groupFilter = ref<string | null>(null);

  const visibleSources = computed(() => sources.value.filter((s) => {
    if (kindFilter.value !== 'all' && s.kind !== kindFilter.value) return false;
    if (groupFilter.value && s.group !== groupFilter.value) return false;
    if (keyword.value) {
      const k = keyword.value.toLowerCase();
      return s.name.toLowerCase().includes(k) || s.id.toLowerCase().includes(k);
    }
    return true;
  }));

  const groups = computed(() => Array.from(new Set(sources.value.map((s) => s.group).filter(Boolean) as string[])));

  const summary = computed(() => ({
    total: sources.value.length,
    enabled: sources.value.filter((s) => s.enabled).length,
    healthy: sources.value.filter((s) => (s.health?.score ?? 0) >= 80).length,
  }));

  async function loadAll(): Promise<void> {
    // M1: sources.value = await repo.sources.list()
    sources.value = [
      mockRow({
        id: 'demo-book-source', name: '演示书源',
        kind: 'book', format: 'legado3_book',
        homeUrl: 'https://example.com',
        group: '默认分组',
        health: healthMock(94),
        lastRunAt: '2026-08-29 10:21',
      }),
      mockRow({
        id: 'cms-movies-1', name: '某 CMS 影视配置',
        kind: 'video', format: 'tvbox1_plus_video',
        homeUrl: 'https://cms.example.net',
        group: '影视分组',
        health: healthMock(76),
        lastRunAt: '2026-08-29 10:19',
      }),
      mockRow({
        id: 'rss-infoq-cn', name: 'InfoQ RSS',
        kind: 'rss', format: 'rss',
        homeUrl: 'https://feed.infoq.cn',
        group: '订阅',
        health: healthMock(100),
        lastRunAt: '2026-08-29 09:00',
      }),
    ] as Row[];
  }

  async function createFromPipeline(
    draft: { name: string; id: string; kind: SourceKind; format: SourceFormat; pipelines: Partial<Record<'search'|'detail'|'toc'|'content', RulePipeline>> }
  ): Promise<string> {
    // M1: const id = await repo.sources.upsert(draft); return id;
    void draft;
    return 'TODO-ID';
  }

  async function remove(id: string) {
    sources.value = sources.value.filter((s) => s.id !== id);
  }

  function toggleEnabled(id: string) {
    const s = sources.value.find((x) => x.id === id);
    if (s) s.enabled = !s.enabled;
  }

  async function healthCheckAll(): Promise<void> {
    // M1: engine.health(pool)
  }

  void loadAll();

  return {
    sources, keyword, kindFilter, groupFilter,
    visibleSources, groups, summary,
    loadAll, createFromPipeline, remove, toggleEnabled, healthCheckAll,
  };
});

// ================ helpers ================
function healthMock(score: number): SourceHealth {
  return {
    score,
    successRate: Math.max(0, Math.min(1, score / 100)),
    avgLatencyMs: 60 + Math.floor(Math.random() * 400),
    lastSuccessAt: new Date(Date.now() - 86400000 * Math.random()).toISOString(),
    consecutiveFailures: score >= 60 ? 0 : Math.ceil((60 - score) / 15),
  };
}

function emptyPipeline(name: string): RulePipeline {
  return { name, segments: [] };
}

function mockRow(
  p: {
    id: string; name: string; kind: SourceKind; format: SourceFormat;
    homeUrl?: string; group?: string; health: SourceHealth; lastRunAt?: string;
  }
): Row {
  return {
    id: p.id,
    name: p.name,
    kind: p.kind,
    format: p.format,
    homeUrl: p.homeUrl ?? '',
    group: p.group ?? '默认分组',
    version: 1,
    explore:  emptyPipeline('explore'),
    search:   emptyPipeline('search'),
    detail:   emptyPipeline('detail'),
    toc:      emptyPipeline('toc'),
    content:  emptyPipeline('content'),
    enabled:  true,
    health:   p.health,
    tags: [],
    lastRunAt: p.lastRunAt,
  };
}
