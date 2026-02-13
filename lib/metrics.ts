/**
 * Metrics tracking utility
 * Tracks application metrics like counters, timings, and gauges
 * Can be integrated with monitoring services like Datadog, New Relic, etc.
 */

interface MetricTags {
  [key: string]: string | number | boolean;
}

class MetricsService {
  private enabled: boolean;

  constructor() {
    this.enabled = process.env.ENABLE_METRICS === 'true';
  }

  /**
   * Increment a counter metric
   */
  increment(metric: string, tags?: MetricTags): void {
    if (!this.enabled) return;

    // In production, send to your metrics service
    // Example: datadog.increment(metric, 1, tags);
    
    console.log(`[METRIC] Counter: ${metric}`, tags);
  }

  /**
   * Decrement a counter metric
   */
  decrement(metric: string, tags?: MetricTags): void {
    if (!this.enabled) return;

    console.log(`[METRIC] Counter: ${metric} (decrement)`, tags);
  }

  /**
   * Record a timing metric (in milliseconds)
   */
  timing(metric: string, value: number, tags?: MetricTags): void {
    if (!this.enabled) return;

    console.log(`[METRIC] Timing: ${metric} = ${value}ms`, tags);
  }

  /**
   * Record a gauge metric (arbitrary value)
   */
  gauge(metric: string, value: number, tags?: MetricTags): void {
    if (!this.enabled) return;

    console.log(`[METRIC] Gauge: ${metric} = ${value}`, tags);
  }

  /**
   * Record a histogram metric
   */
  histogram(metric: string, value: number, tags?: MetricTags): void {
    if (!this.enabled) return;

    console.log(`[METRIC] Histogram: ${metric} = ${value}`, tags);
  }

  /**
   * Start a timer and return a function to stop it
   */
  startTimer(metric: string, tags?: MetricTags): () => void {
    const startTime = Date.now();
    
    return () => {
      const duration = Date.now() - startTime;
      this.timing(metric, duration, tags);
    };
  }

  /**
   * Measure async operation duration
   */
  async measure<T>(
    metric: string,
    operation: () => Promise<T>,
    tags?: MetricTags
  ): Promise<T> {
    const stopTimer = this.startTimer(metric, tags);
    
    try {
      const result = await operation();
      stopTimer();
      return result;
    } catch (error) {
      stopTimer();
      this.increment(`${metric}.error`, tags);
      throw error;
    }
  }

  /**
   * Record multiple metrics at once
   */
  batch(operations: Array<() => void>): void {
    if (!this.enabled) return;
    
    operations.forEach(op => op());
  }
}

// Export singleton instance
export const metrics = new MetricsService();

/**
 * Common metric names for the application
 */
export const MetricNames = {
  // Scraping metrics
  SCRAPING_SUCCESS: 'scraping.success',
  SCRAPING_FAILURE: 'scraping.failure',
  SCRAPING_DURATION: 'scraping.duration',
  SCRAPING_TIMEOUT: 'scraping.timeout',
  
  // Database metrics
  DB_QUERY_DURATION: 'db.query.duration',
  DB_INSERT_DURATION: 'db.insert.duration',
  DB_UPDATE_DURATION: 'db.update.duration',
  DB_ERROR: 'db.error',
  
  // API metrics
  API_REQUEST: 'api.request',
  API_RESPONSE_TIME: 'api.response_time',
  API_ERROR: 'api.error',
  
  // Rate limiting
  RATE_LIMIT_HIT: 'rate_limit.hit',
  RATE_LIMIT_EXCEEDED: 'rate_limit.exceeded',
  
  // Browser metrics
  BROWSER_LAUNCH_TIME: 'browser.launch_time',
  BROWSER_CLOSE_ERROR: 'browser.close_error',
  PAGE_LOAD_TIME: 'page.load_time',
};
