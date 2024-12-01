export class LoadBalancer {
    constructor(redis) {
      this.redis = redis;
      this.nodes = new Map();
      this.setupHealthChecks();
    }
  
    async registerNode(nodeId, capacity) {
      await this.redis.hSet('nodes', nodeId, JSON.stringify({
        capacity,
        connections: 0,
        lastHeartbeat: Date.now()
      }));
    }
  
    async getOptimalNode() {
      const nodes = await this.redis.hGetAll('nodes');
      const activeNodes = Object.entries(nodes)
        .map(([id, data]) => ({
          id,
          ...JSON.parse(data)
        }))
        .filter(node => Date.now() - node.lastHeartbeat < 30000)
        .sort((a, b) => (a.connections / a.capacity) - (b.connections / b.capacity));
  
      return activeNodes[0]?.id;
    }
  
    setupHealthChecks() {
      setInterval(async () => {
        const nodes = await this.redis.hGetAll('nodes');
        for (const [nodeId, data] of Object.entries(nodes)) {
          const nodeData = JSON.parse(data);
          if (Date.now() - nodeData.lastHeartbeat > 30000) {
            await this.redis.hDel('nodes', nodeId);
          }
        }
      }, 10000);
    }
  }