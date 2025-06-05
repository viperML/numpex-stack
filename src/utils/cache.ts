import fs from 'fs/promises';
import path from 'path';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

interface CacheStorage<T> {
  [key: string]: CacheEntry<T>;
}

class Cache<T> {
  private storage: CacheStorage<T> = {};
  private cacheDir: string;
  private cacheFile: string;

  constructor(cacheKey: string = 'default') {
    this.cacheDir = path.join(process.cwd(), '.cache');
    this.cacheFile = path.join(this.cacheDir, `${cacheKey}.json`);
    this.loadFromDisk();
  }

  private async loadFromDisk(): Promise<void> {
    try {
      await fs.mkdir(this.cacheDir, { recursive: true });
      const data = await fs.readFile(this.cacheFile, 'utf-8');
      this.storage = JSON.parse(data);
    } catch (error) {
      // Cache file doesn't exist or is invalid, start with empty storage
      this.storage = {};
    }
  }

  private async saveToDisk(): Promise<void> {
    try {
      await fs.mkdir(this.cacheDir, { recursive: true });
      await fs.writeFile(this.cacheFile, JSON.stringify(this.storage, null, 2));
    } catch (error) {
      console.error('Failed to save cache to disk:', error);
    }
  }

  async get(key: string): Promise<T | null> {
    const entry = this.storage[key];
    
    if (!entry) {
      return null;
    }

    const now = Date.now();
    const isExpired = now - entry.timestamp > entry.ttl;

    if (isExpired) {
      delete this.storage[key];
      await this.saveToDisk();
      return null;
    }

    return entry.data;
  }

  async set(key: string, data: T, ttlMs: number): Promise<void> {
    this.storage[key] = {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    };
    
    await this.saveToDisk();
  }

  async clear(): Promise<void> {
    this.storage = {};
    await this.saveToDisk();
  }

  async cleanup(): Promise<void> {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of Object.entries(this.storage)) {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      delete this.storage[key];
    }

    if (keysToDelete.length > 0) {
      await this.saveToDisk();
    }
  }
}

export { Cache };
