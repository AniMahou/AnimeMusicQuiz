users                    
├── id (PK)             -- Unique identifier
├── email               -- For login/notifications
├── mal_token           -- Access token for MALAPI
└── mal_username        -- Their MAL username

user_anime              -- Cache of user's MAL list
├── user_id (FK)        -- Which user
├── anime_id            -- MAL's anime ID (28977 for One Punch Man)
└── status              -- 'completed', 'watching', etc.

lobbies                 -- Active game rooms
├── code (PK)           -- 6-character code to share
├── owner_id (FK)       -- Who created it
├── settings (JSONB)    -- { rounds: 25, time: 30 }
└── status              -- 'waiting', 'active', 'ended'

lobby_players           -- Who is in which lobby
├── lobby_code (FK)     -- Which lobby
├── user_id (FK)        -- Which user
└── score               -- Current score in that lobby

games                   -- Completed/active games
├── lobby_code (FK)     -- Which lobby this game belongs to
└── started_at          -- When game started

game_rounds             -- Each round of a game
├── game_id (FK)        -- Which game
├── round_number        -- 1, 2, 3...
├── anime_id            -- Which anime (from MAL)
├── correct_user_id     -- Who answered correctly
└── points_awarded      -- How many points (+1 or -0.25)