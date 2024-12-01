export const CONFIG = {
    server: {
      port: process.env.PORT || 3001,
      host: process.env.HOST || 'localhost'
    },
    game: {
      maxPlayers: 4,
      minPlayers: 2,
      slapCooldown: 500,
      turnTimeout: 30000,
      aiDelay: {
        min: 1000,
        max: 2500
      }
    },
    redis: {
      url: process.env.REDIS_URL,
      prefix: 'slapjack:'
    },
    security: {
      jwtSecret: process.env.JWT_SECRET,
      tokenExpiration: '1h'
    }
  };