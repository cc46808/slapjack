export class PerformanceProfiler {
    constructor() {
      this.profiles = new Map();
      this.startTime = process.hrtime();
    }
  
    startProfile(name) {
      const start = process.hrtime();
      return () => this.endProfile(name, start);
    }
  
    endProfile(name, start) {
      const [seconds, nanoseconds] = process.hrtime(start);
      const duration = seconds * 1000 + nanoseconds / 1e6;
  
      if (!this.profiles.has(name)) {
        this.profiles.set(name, {
          count: 0,
          totalTime: 0,
          min: Infinity,
          max: -Infinity
        });
      }
  
      const profile = this.profiles.get(name);
      profile.count++;
      profile.totalTime += duration;
      profile.min = Math.min(profile.min, duration);
      profile.max = Math.max(profile.max, duration);
    }
  
    getProfiles() {
      const result = {};
      for (const [name, profile] of this.profiles) {
        result[name] = {
          avgTime: profile.totalTime / profile.count,
          min: profile.min,
          max: profile.max,
          count: profile.count
        };
      }
      return result;
    }
  }