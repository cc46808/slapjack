// slapjack/server/src/server.js
import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import { rateLimitMiddleware } from './middleware/rateLimiter.js';
import { WebSocketManager } from './services/WebSocketManager.js';
import { GameManager } from './services/GameManager.js';
import { RedisManager } from './services/RedisManager.js';
import { SecurityManager } from './services/SecurityManager.js';
import { MonitoringService } from './services/MonitoringService.js';
import { CONFIG } from './config/index.js';
import { Logger } from './utils/Logger.js';

const app = express();
const server = createServer(app);

// Initialize services
const monitoringService = new MonitoringService();
const redis = new RedisManager();
const gameManager = new GameManager(monitoringService);
const securityManager = new SecurityManager();
const wsManager = new WebSocketManager(server, gameManager);

// Middleware
app.use(cors(CONFIG.server.cors));
app.use(express.json());
app.use(rateLimitMiddleware('global'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Error handling
app.use((err, req, res, next) => {
  Logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = CONFIG.server.port;
server.listen(PORT, () => {
  Logger.info(`Server running on port ${PORT}`);
});

// Graceful shutdown
const cleanup = async () => {
  Logger.info('Shutting down gracefully...');
  try {
    await redis.disconnect();
    await gameManager.cleanup();
    server.close();
    process.exit(0);
  } catch (error) {
    Logger.error('Error during cleanup:', error);
    process.exit(1);
  }
};
// Add periodic metrics collection
setInterval(() => {
  monitoringService.incrementMetric('uptime', process.uptime());
  const memoryUsage = process.memoryUsage();
  monitoringService.incrementMetric('memoryUsage', memoryUsage.heapUsed / 1024 / 1024); // Convert to MB
}, 5000);

process.on('SIGTERM', cleanup);
process.on('SIGINT', cleanup);