// slapjack/client/src/services/PerformanceMonitor.js
export class PerformanceMonitor {
    constructor() {
      this.metrics = new Map();
      this.startTime = performance.now();
    }
  
    measure(name, startMark, endMark) {
      performance.measure(name, startMark, endMark);
      const entries = performance.getEntriesByName(name);
      const duration = entries[entries.length - 1].duration;
      
      if (!this.metrics.has(name)) {
        this.metrics.set(name, []);
      }
      this.metrics.get(name).push(duration);
    }
  
    getMetrics() {
      const result = {};
      for (const [name, measurements] of this.metrics.entries()) {
        result[name] = {
          avg: measurements.reduce((a, b) => a + b, 0) / measurements.length,
          min: Math.min(...measurements),
          max: Math.max(...measurements)
        };
      }
      return result;
    }
  }