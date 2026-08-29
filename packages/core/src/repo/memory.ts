/* ==========================================================
 * MemoryRepo — 内存仓库实现
 * 用于测试和 Web 无持久化场景
 * 实现 OmniRepo 接口（@omniflow/shared/engine.ts）
 * ========================================================== */

import type { OmniRepo, UnifiedSource, SourceHealth } from '@omniflow/shared'

interface CacheEntry {
  value: unknown
  expiresAt?: number
}

interface FavoriteEntry {
  itemId: string
  addedAt: string
  payload: Record<string, unknown>
}

interface HistoryEntry {
  itemId: string
  watchedAt: string
  payload: Record<string, unknown>
}

export class MemoryRepo implements OmniRepo {
  private sources: Map<string, UnifiedSource> = new Map()
  private favorites: FavoriteEntry[] = []
  private history: HistoryEntry[] = []
  private cache: Map<string, CacheEntry> = new Map()

  // ——— 源管理 ———

  async listSources(options?: {
    kind?: string
    format?: string
    enabledOnly?: boolean
  }): Promise<UnifiedSource[]> {
    let list = Array.from(this.sources.values())
    if (options?.kind) list = list.filter(s => s.kind === options.kind)
    if (options?.format) list = list.filter(s => s.format === options.format)
    if (options?.enabledOnly) list = list.filter(s => s.enabled !== false)
    return list.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
  }

  async getSource(id: string): Promise<UnifiedSource | undefined> {
    return this.sources.get(id)
  }

  async upsertSources(sources: UnifiedSource[]): Promise<void> {
    for (const s of sources) {
      this.sources.set(s.id, s)
    }
  }

  async removeSources(ids: string[]): Promise<void> {
    for (const id of ids) {
      this.sources.delete(id)
    }
  }

  async updateSourceHealth(id: string, health: SourceHealth): Promise<void> {
    const source = this.sources.get(id)
    if (source) {
      source.health = health
    }
  }

  // ——— 收藏 ———

  async addFavorite(itemId: string, payload: Record<string, unknown>): Promise<void> {
    this.favorites.push({ itemId, addedAt: new Date().toISOString(), payload })
  }

  async removeFavorite(itemId: string): Promise<void> {
    this.favorites = this.favorites.filter(f => f.itemId !== itemId)
  }

  async listFavorites(options?: {
    kind?: string
    groupId?: string
  }): Promise<Array<{ itemId: string; addedAt: string } & Record<string, unknown>>> {
    let list = [...this.favorites]
    if (options?.kind) {
      list = list.filter(f => f.payload['kind'] === options.kind)
    }
    return list.map(f => ({
      itemId: f.itemId,
      addedAt: f.addedAt,
      ...f.payload,
    }))
  }

  // ——— 历史 ———

  async recordHistory(itemId: string, payload: Record<string, unknown>): Promise<void> {
    this.history.unshift({ itemId, watchedAt: new Date().toISOString(), payload })
    if (this.history.length > 1000) {
      this.history = this.history.slice(0, 1000)
    }
  }

  async listHistory(limit = 50): Promise<Array<{ itemId: string; watchedAt: string } & Record<string, unknown>>> {
    return this.history.slice(0, limit).map(h => ({
      itemId: h.itemId,
      watchedAt: h.watchedAt,
      ...h.payload,
    }))
  }

  // ——— 缓存 ———

  async cacheGet<T = unknown>(key: string): Promise<{ value: T; expiresAt?: string } | undefined> {
    const entry = this.cache.get(key)
    if (!entry) return undefined
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return undefined
    }
    return {
      value: entry.value as T,
      expiresAt: entry.expiresAt ? new Date(entry.expiresAt).toISOString() : undefined,
    }
  }

  async cacheSet(key: string, value: unknown, ttlSec?: number): Promise<void> {
    const expiresAt = ttlSec ? Date.now() + ttlSec * 1000 : undefined
    this.cache.set(key, { value, expiresAt })
  }

  async cacheInvalidate(pattern: string): Promise<void> {
    const re = new RegExp(pattern)
    for (const key of this.cache.keys()) {
      if (re.test(key)) this.cache.delete(key)
    }
  }

  // ——— 测试辅助 ———

  clear(): void {
    this.sources.clear()
    this.favorites = []
    this.history = []
    this.cache.clear()
  }
}
