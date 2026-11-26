interface CacheEntry<T> {
  expiresAt: number;
  value: T;
}

/**
 * Bounded in-memory TTL cache for external API responses.
 * Periodically prunes expired keys and evicts the oldest entry at capacity.
 */
export class TtlCache<T> {
  private readonly store = new Map<string, CacheEntry<T>>();
  private readonly ttlMs: number;
  private readonly maxEntries: number;
  private readonly now: () => number;

  constructor(
    ttlMs: number = 5 * 60 * 1000,
    maxEntries: number = 200,
    nowFn: () => number = () => Date.now()
  ) {
    this.ttlMs = ttlMs;
    this.maxEntries = maxEntries;
    this.now = nowFn;
  }

  get(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;

    if (this.now() >= entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }

    return entry.value;
  }

  set(key: string, value: T): void {
    const currentTime = this.now();

    if (this.store.size >= this.maxEntries && !this.store.has(key)) {
      this.pruneExpired(currentTime);
      if (this.store.size >= this.maxEntries) {
        const oldestKey = this.store.keys().next().value;
        if (oldestKey !== undefined) {
          this.store.delete(oldestKey);
        }
      }
    }

    // Re-insert so insertion order reflects recency
    if (this.store.has(key)) {
      this.store.delete(key);
    }

    this.store.set(key, {
      expiresAt: currentTime + this.ttlMs,
      value,
    });
  }

  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  clear(): void {
    this.store.clear();
  }

  get size(): number {
    return this.store.size;
  }

  private pruneExpired(currentTime: number): void {
    for (const [key, entry] of this.store.entries()) {
      if (currentTime >= entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }
}
