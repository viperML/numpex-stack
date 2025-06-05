import { Cache } from '../utils/cache';
import { RateLimiter } from '../utils/rateLimiter';

interface Package {
  licenses: string[];
  repo: string;
  version: string;
  visiblename: string;
  summary: string;
  status: string;
}

class RepologyService {
  private cache: Cache<Package[]>;
  private rateLimiter: RateLimiter;
  private readonly CACHE_TTL = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

  constructor() {
    this.cache = new Cache<Package[]>('repology-packages');
    this.rateLimiter = new RateLimiter(1); // 1 request per second
  }

  private getCacheKey(project: string): string {
    return `project:${project}`;
  }

  async fetchPackageData(project: string): Promise<Package[]> {
    const cacheKey = this.getCacheKey(project);
    
    // Try to get from cache first
    const cachedData = await this.cache.get(cacheKey);
    if (cachedData) {
      console.log(`Cache hit for project: ${project}`);
      return cachedData;
    }

    console.log(`Cache miss for project: ${project}, fetching from API...`);
    
    // Apply rate limiting before making the request
    await this.rateLimiter.waitIfNeeded();

    const url = new URL(`https://repology.org/api/v1/project/${project}`);

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "numpex-stack/1.0",
        }
      });

      if (!response.ok) {
        console.error(`Failed to fetch data for ${project}: ${response.status}`);
        return [];
      }

      const data: Package[] = await response.json();
      
      // Cache the successful response
      await this.cache.set(cacheKey, data, this.CACHE_TTL);
      
      return data;
    } catch (error) {
      console.error(`Error fetching data for ${project}:`, error);
      return [];
    }
  }

  async fetchMultipleProjects(projects: string[]): Promise<Array<{ project: string; packages: Package[] }>> {
    console.log(`Fetching data for ${projects.length} projects...`);
    
    const results = [];
    
    // Process projects sequentially to respect rate limiting
    for (const project of projects) {
      const packages = await this.fetchPackageData(project);
      results.push({
        project,
        packages
      });
    }
    
    console.log('Finished fetching all project data');
    return results;
  }

  async clearCache(): Promise<void> {
    await this.cache.clear();
    console.log('Cache cleared');
  }

  async cleanupExpiredCache(): Promise<void> {
    await this.cache.cleanup();
    console.log('Expired cache entries cleaned up');
  }
}

export { RepologyService, type Package };
