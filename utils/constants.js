/**
 * APP CONSTANTS
 * Configuration values used across the app
 */

// Game settings
export const GAME_SETTINGS = {
    DEFAULT_ROUNDS: 25,           // Default number of rounds
    MIN_ROUNDS: 5,                // Minimum allowed
    MAX_ROUNDS: 50,               // Maximum allowed
    TIME_PER_ROUND: 30,           // Seconds to guess
    SCORE_CORRECT: 1,             // Points for correct answer
    SCORE_WRONG: -0.25,           // Points for wrong answer
    SCORE_TIMEOUT: 0,             // Points for no answer
  }
  
  // Lobby settings
  export const LOBBY_SETTINGS = {
    CODE_LENGTH: 6,               // Characters in lobby code
    MAX_PLAYERS: 10,              // Max players per lobby
    CODE_CHARACTERS: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  }
  
  // API endpoints
  export const API_ENDPOINTS = {
    MAL: {
      OAUTH: 'https://myanimelist.net/v2/oauth/authorize',
      TOKEN: 'https://myanimelist.net/v2/oauth/token',
      ANIME_LIST: 'https://api.myanimelist.net/v2/users/@me/animelist',
    },
    JIKAN: 'https://api.jikan.moe/v4',
    ANIMETHEMES: 'https://api.animethemes.moe',
  }
  
  // Anime status mapping (MAL values)
  export const ANIME_STATUS = {
    1: 'watching',
    2: 'completed',
    3: 'on_hold',
    4: 'dropped',
    6: 'plan_to_watch',
  }
  
  // Error messages
  export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Network error. Please check your connection.',
    UNAUTHORIZED: 'Please log in to continue.',
    LOBBY_NOT_FOUND: 'Lobby not found. Check the code and try again.',
    LOBBY_FULL: 'This lobby is full. Please try another one.',
    GAME_IN_PROGRESS: 'Game already in progress. Please wait for it to end.',
    NO_COMMON_ANIME: 'No common anime found between players. Try adding more anime to your list!',
    MAL_SYNC_FAILED: 'Failed to sync MyAnimeList. Please try again.',
  }