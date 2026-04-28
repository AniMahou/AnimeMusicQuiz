-- ============================================
-- ANIME MUSIC QUIZ - DATABASE SCHEMA (FIXED)
-- ============================================

-- ============================================
-- 1. USERS TABLE (extends Supabase auth.users)
-- ============================================

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  mal_token TEXT,
  mal_refresh_token TEXT,
  mal_username TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. USER ANIME CACHE
-- ============================================

CREATE TABLE IF NOT EXISTS public.user_anime (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  anime_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  image_url TEXT,
  status TEXT NOT NULL,
  score INTEGER,
  episodes_watched INTEGER,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, anime_id)
);

-- Create indexes (without CONCURRENTLY)
CREATE INDEX IF NOT EXISTS idx_user_anime_user_id ON user_anime(user_id);
CREATE INDEX IF NOT EXISTS idx_user_anime_anime_id ON user_anime(anime_id);

-- ============================================
-- 3. LOBBIES
-- ============================================

CREATE TABLE IF NOT EXISTS public.lobbies (
  code TEXT PRIMARY KEY,
  owner_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  settings JSONB DEFAULT '{"rounds": 25, "timePerRound": 30}'::JSONB,
  status TEXT DEFAULT 'waiting',
  current_game_id INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_status CHECK (status IN ('waiting', 'active', 'ended'))
);

-- ============================================
-- 4. LOBBY PLAYERS
-- ============================================

CREATE TABLE IF NOT EXISTS public.lobby_players (
  lobby_code TEXT REFERENCES public.lobbies(code) ON DELETE CASCADE,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  score DECIMAL(10, 2) DEFAULT 0,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (lobby_code, user_id)
);

CREATE INDEX IF NOT EXISTS idx_lobby_players_lobby_code ON lobby_players(lobby_code);

-- ============================================
-- 5. GAMES
-- ============================================

CREATE TABLE IF NOT EXISTS public.games (
  id SERIAL PRIMARY KEY,
  lobby_code TEXT REFERENCES public.lobbies(code) ON DELETE CASCADE,
  rounds_total INTEGER DEFAULT 25,
  current_round INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  CONSTRAINT valid_game_status CHECK (status IN ('active', 'ended'))
);

-- ============================================
-- 6. GAME ROUNDS
-- ============================================

CREATE TABLE IF NOT EXISTS public.game_rounds (
  id SERIAL PRIMARY KEY,
  game_id INTEGER REFERENCES public.games(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  anime_id INTEGER NOT NULL,
  song_url TEXT,
  correct_user_id UUID REFERENCES public.user_profiles(id),
  points_awarded DECIMAL(10, 2),
  answered_at TIMESTAMPTZ,
  UNIQUE(game_id, round_number)
);

CREATE INDEX IF NOT EXISTS idx_game_rounds_game_id ON game_rounds(game_id);

-- ============================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_anime ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lobbies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lobby_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_rounds ENABLE ROW LEVEL SECURITY;

-- USER PROFILES
CREATE POLICY "Users can view their own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- USER ANIME
CREATE POLICY "Users can manage their own anime"
  ON public.user_anime FOR ALL
  USING (auth.uid() = user_id);

-- LOBBIES
CREATE POLICY "Anyone can view lobbies"
  ON public.lobbies FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create lobbies"
  ON public.lobbies FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Only lobby owner can update"
  ON public.lobbies FOR UPDATE
  USING (auth.uid() = owner_id);

-- LOBBY PLAYERS
CREATE POLICY "Anyone can view lobby players"
  ON public.lobby_players FOR SELECT
  USING (true);

CREATE POLICY "Users can join lobbies"
  ON public.lobby_players FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave lobbies"
  ON public.lobby_players FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 8. HELPER FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER update_lobbies_updated_at
  BEFORE UPDATE ON public.lobbies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 9. INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_user_anime_user_status 
  ON user_anime(user_id, status, anime_id);

CREATE INDEX IF NOT EXISTS idx_lobbies_status 
  ON lobbies(status);

CREATE INDEX IF NOT EXISTS idx_game_rounds_correct_user 
  ON game_rounds(correct_user_id);