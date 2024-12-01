import { Pool } from 'pg';
import { Logger } from '../utils/Logger.js';

export class DatabaseService {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 20
    });

    this.pool.on('error', (err) => {
      Logger.error('Unexpected database error:', err);
    });
  }

  async query(text, params) {
    const start = Date.now();
    try {
      const result = await this.pool.query(text, params);
      const duration = Date.now() - start;
      Logger.debug('Executed query', { text, duration, rows: result.rowCount });
      return result;
    } catch (error) {
      Logger.error('Query error:', error);
      throw error;
    }
  }

  async transaction(callback) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async recordGameCompletion(gameData) {
    return this.transaction(async (client) => {
      // Record game
      const gameResult = await client.query(
        `INSERT INTO games (id, start_time, end_time, winner_id)
         VALUES ($1, $2, $3, $4) 
         RETURNING id`,
        [gameData.id, gameData.startTime, gameData.endTime, gameData.winnerId]
      );

      // Record player stats
      for (const player of gameData.players) {
        await client.query(
          `INSERT INTO player_stats
           (player_id, game_id, cards_won, successful_slaps)
           VALUES ($1, $2, $3, $4)`,
          [player.id, gameResult.rows[0].id, player.cardsWon, player.successfulSlaps]
        );
      }

      return gameResult.rows[0];
    });
  }
}