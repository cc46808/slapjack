import { Logger } from '../utils/Logger.js';

export const errorRecovery = async (err, req, res, next) => {
  Logger.error('Error occurred:', err);

  if (err.type === 'game-state-corruption') {
    try {
      const gameId = req.params.gameId;
      await req.app.gameManager.recoverGameState(gameId);
      next();
    } catch (recoveryError) {
      Logger.error('Recovery failed:', recoveryError);
      next(recoveryError);
    }
  } else {
    next(err);
  }
};