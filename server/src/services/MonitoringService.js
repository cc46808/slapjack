import { EventEmitter } from 'events';
import { Logger } from '../utils/Logger.js';

export class MonitoringService extends EventEmitter {
  constructor() {
    super();
    this.metrics = new Map();
    this.startTime = Date.now();
    this.setupMetrics();
  }

  setupMetrics() {
    // Game metrics
    this.metrics.set('activeGames', 0);
    this.metrics.set('connectedPlayers', 0);
    this.metrics.set('totalGames', 0);
    this.metrics.set('averageGameDuration', 0);
    
    // System metrics
    this.metrics.set('uptime', 0);
    this.metrics.set('memoryUsage', 0);
    this.metrics.set('lastUpdate', this.startTime);

    // Performance metrics
    this.metrics.set('websocketLatency', 0);
    this.metrics.set('activeConnections', 0);

    setInterval(() => this.reportMetrics(), 60000);
  }

  recordLatency(latency) {
    this.metrics.set('websocketLatency', latency);
  }

  incrementMetric(name, value = 1) {
    const current = this.metrics.get(name) || 0;
    this.metrics.set(name, current + value);
  }
  
  // Add this method
  decrementMetric(name, value = 1) {
    const current = this.metrics.get(name) || 0;
    this.metrics.set(name, current - value);
  }

  recordGameDuration(duration) {
    const total = this.metrics.get('totalGames');
    const currentAvg = this.metrics.get('averageGameDuration');
    const newAvg = (currentAvg * total + duration) / (total + 1);
    this.metrics.set('averageGameDuration', newAvg);
    this.incrementMetric('totalGames');
  }

reportMetrics() {
    const metrics = {
      game: {
        active: this.metrics.get('activeGames'),
        total: this.metrics.get('totalGames'),
        players: this.metrics.get('connectedPlayers'),
        avgDuration: this.metrics.get('averageGameDuration')
      },
      system: {
        uptime: this.metrics.get('uptime'),
        memory: this.metrics.get('memoryUsage'),
        lastUpdate: Date.now()
      },
      performance: {
        wsLatency: this.metrics.get('websocketLatency'),
        connections: this.metrics.get('activeConnections')
      }
    };

    Logger.info('System Metrics:', metrics);
    this.emit('metrics', metrics);
  }

  getMetrics() {
    return Object.fromEntries(this.metrics);
  }
}