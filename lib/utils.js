/**
 * UTILITY FUNCTIONS
 * Reusable helpers used across the app
 */

// Generate a random 6-digit lobby code
// Example: "A3F9K2" or "7B4D1E"
export function generateLobbyCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = ''
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return code
  }
  
  // Delay execution (useful for loading states)
  export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
  
  // Format time as MM:SS
  // Example: 125 seconds → "02:05"
  export function formatTime(seconds) {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  
  // Shuffle array (Fisher-Yates algorithm)
  // Used for randomizing rounds
  export function shuffleArray(array) {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }
  
  // Get anime title from MAL response (handles English/Japanese/Romaji)
  export function getAnimeTitle(anime) {
    return anime.title || 
           anime.english_title || 
           anime.japanese_title || 
           'Unknown Anime'
  }
  
  // Debounce function (prevents too many API calls)
  // Example: search input that calls API only after user stops typing
  export function debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }