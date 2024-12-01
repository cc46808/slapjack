export class AlertService {
    constructor() {
      this.channels = new Set();
    }
  
    addChannel(channel) {
      this.channels.add(channel);
    }
  
    async sendAlert(alert) {
      const promises = Array.from(this.channels).map(channel =>
        channel.send({
          level: alert.level,
          message: alert.message,
          timestamp: Date.now(),
          context: alert.context
        })
      );
  
      await Promise.all(promises);
    }
  }