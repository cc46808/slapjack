import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { CONFIG } from '../config/index.js';

export class SecurityManager {
  generateToken(payload) {
    return jwt.sign(payload, CONFIG.security.jwtSecret, {
      expiresIn: CONFIG.security.tokenExpiration
    });
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, CONFIG.security.jwtSecret);
    } catch (error) {
      return null;
    }
  }

  hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return { hash, salt };
  }

  verifyPassword(password, hash, salt) {
    const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return hash === verifyHash;
  }

  generateGameToken(gameId, playerId) {
    return this.generateToken({ gameId, playerId });
  }
}