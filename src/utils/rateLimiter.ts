class RateLimiter {
  private lastRequestTime: number = 0;
  private minInterval: number;

  constructor(requestsPerSecond: number = 1) {
    this.minInterval = 1000 / requestsPerSecond; // Convert to milliseconds
  }

  async waitIfNeeded(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.minInterval) {
      const waitTime = this.minInterval - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }
}

export { RateLimiter };
