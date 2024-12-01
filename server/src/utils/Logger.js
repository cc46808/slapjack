// slapjack/server/src/utils/Logger.js
export class Logger {
    static levels = {
      ERROR: 0,
      WARN: 1,
      INFO: 2,
      DEBUG: 3
    };
  
    static level = process.env.LOG_LEVEL || Logger.levels.INFO;
  
    static formatMessage(level, message, ...args) {
      const timestamp = new Date().toISOString();
      const extraInfo = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : arg
      ).join(' ');
      
      return `[${timestamp}] [${level}] ${message} ${extraInfo}`;
    }
  
    static error(message, ...args) {
      if (Logger.level >= Logger.levels.ERROR) {
        console.error(Logger.formatMessage('ERROR', message, ...args));
      }
    }
  
    static warn(message, ...args) {
      if (Logger.level >= Logger.levels.WARN) {
        console.warn(Logger.formatMessage('WARN', message, ...args));
      }
    }
  
    static info(message, ...args) {
      if (Logger.level >= Logger.levels.INFO) {
        console.info(Logger.formatMessage('INFO', message, ...args));
      }
    }
  
    static debug(message, ...args) {
      if (Logger.level >= Logger.levels.DEBUG) {
        console.debug(Logger.formatMessage('DEBUG', message, ...args));
      }
    }
  }