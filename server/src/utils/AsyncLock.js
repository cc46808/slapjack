// slapjack/server/src/utils/AsyncLock.js
export class AsyncLock {
    constructor() {
      this.locks = new Map();
    }
  
    async acquire(key, fn) {
      if (!this.locks.has(key)) {
        this.locks.set(key, Promise.resolve());
      }
  
      const currentLock = this.locks.get(key);
      const newLock = currentLock.then(async () => {
        try {
          return await fn();
        } finally {
          if (this.locks.get(key) === newLock) {
            this.locks.delete(key);
          }
        }
      });
  
      this.locks.set(key, newLock);
      return newLock;
    }
  }