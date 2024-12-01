CREATE TABLE players (
  id UUID PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP WITH TIME ZONE,
  games_played INTEGER DEFAULT 0,
  total_wins INTEGER DEFAULT 0
);

CREATE TABLE games (
  id UUID PRIMARY KEY,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP WITH TIME ZONE,
  winner_id UUID REFERENCES players(id),
  duration_seconds INTEGER,
  player_count INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'active'
);

CREATE TABLE game_players (
  game_id UUID REFERENCES games(id),
  player_id UUID REFERENCES players(id),
  cards_won INTEGER DEFAULT 0,
  successful_slaps INTEGER DEFAULT 0,
  total_slaps INTEGER DEFAULT 0,
  PRIMARY KEY (game_id, player_id)
);

CREATE TABLE game_events (
  id BIGSERIAL PRIMARY KEY,
  game_id UUID REFERENCES games(id),
  player_id UUID REFERENCES players(id),
  event_type VARCHAR(50) NOT NULL,
  event_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_game_events_game_id ON game_events(game_id);
CREATE INDEX idx_game_events_created_at ON game_events(created_at);
CREATE INDEX idx_players_username ON players(username);
CREATE INDEX idx_games_status ON games(status);