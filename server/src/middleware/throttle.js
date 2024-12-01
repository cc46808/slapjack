export class RequestThrottler {
    constructor(options = {}) {
      this.windowMs = options.windowMs || 60000;
      this.maxRequests = options.maxRequests || 100;
      this.clients = new Map();
    }
  
    middleware() {
      return (req, res, next) => {
        const now = Date.now();
        const key = req.ip;
  
        if (!this.clients.has(key)) {
          this.clients.set(key, []);
        }
  
        const requests = this.clients.get(key);
        const windowStart = now - this.windowMs;
  
        // Remove old requests
        while (requests.length && requests[0] < windowStart) {
          requests.shift();
        }
  
        if (requests.length >= this.maxRequests) {
          return res.status(429).json({
            error: 'Too many requests',
            retryAfter: Math.ceil((requests[0] + this.windowMs - now) / 1000)
          });
        }
  
        requests.push(now);
        next();
      };
    }
  }