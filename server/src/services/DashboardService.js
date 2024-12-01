export class DashboardService {
    constructor(gameManager, monitoringService) {
      this.gameManager = gameManager;
      this.monitoringService = monitoringService;
    }
  
    async getDashboardData() {
      return {
        realtime: await this.getRealtimeMetrics(),
        historical: await this.getHistoricalMetrics(),
        system: await this.getSystemMetrics()
      };
    }
  
    async getRealtimeMetrics() {
      return {
        activeGames: this.gameManager.games.size,
        connectedPlayers: this.gameManager.playerGameMap.size,
        ...this.monitoringService.getMetrics()
      };
    }
  
    async getHistoricalMetrics() {
      // Implementation for historical metrics
      return {};
    }
  
    async getSystemMetrics() {
      return {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage()
      };
    }
  }