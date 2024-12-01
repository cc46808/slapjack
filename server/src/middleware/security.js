import jwt from 'jsonwebtoken';
import { CONFIG } from '../config/index.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Missing token' });
    }

    const decoded = jwt.verify(token, CONFIG.security.jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const wsAuthenticate = (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }

    const decoded = jwt.verify(token, CONFIG.security.jwtSecret);
    socket.user = decoded;
    next();
  } catch (error) {
    next(new Error('Invalid token'));
  }
};