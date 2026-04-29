// lib/mal.js
// MyAnimeList API wrapper functions

// Base URLs
const MAL_API_URL = 'https://api.myanimelist.net/v2'
const MAL_OAUTH_URL = 'https://myanimelist.net/v1/oauth2'

// Fetch user's anime list
export async function fetchUserAnimeList(accessToken, status = 'completed') {
  try {
    const response = await fetch(
      `${MAL_API_URL}/users/@me/animelist?fields=id,title,main_picture,num_episodes,list_status&limit=1000&status=${status}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    )
    
    if (!response.ok) {
      throw new Error(`MAL API error: ${response.status}`)
    }
    
    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Error fetching MAL anime list:', error)
    return []
  }
}

// Refresh expired access token
export async function refreshMALToken(refreshToken) {
  try {
    const response = await fetch(`${MAL_OAUTH_URL}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: process.env.MAL_CLIENT_ID,
        client_secret: process.env.MAL_CLIENT_SECRET,
      }),
    })
    
    if (!response.ok) {
      throw new Error('Token refresh failed')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error refreshing MAL token:', error)
    return null
  }
}

// Get anime details by ID
export async function getAnimeDetails(animeId) {
  try {
    const response = await fetch(
      `https://api.jikan.moe/v4/anime/${animeId}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    
    if (!response.ok) {
      throw new Error(`Jikan API error: ${response.status}`)
    }
    
    const data = await response.json()
    return data.data
  } catch (error) {
    console.error('Error fetching anime details:', error)
    return null
  }
}

// Sync user's MAL list to our database
export async function syncMALAnimeList(userId, accessToken, refreshToken) {
  try {
    // Fetch anime from MAL
    const animeList = await fetchUserAnimeList(accessToken)
    
    if (!animeList.length) {
      return { success: false, message: 'No anime found in MAL list' }
    }
    
    // Prepare data for insertion
    const animeData = animeList.map(item => ({
      user_id: userId,
      anime_id: item.node.id,
      title: item.node.title,
      image_url: item.node.main_picture?.medium || null,
      status: item.list_status?.status || 'completed',
      score: item.list_status?.score || 0,
      episodes_watched: item.list_status?.num_episodes_watched || 0,
      updated_at: new Date().toISOString(),
    }))
    
    // This will be used with Supabase - we'll implement the actual sync in a later prompt
    return { success: true, count: animeData.length }
  } catch (error) {
    console.error('Error syncing MAL list:', error)
    return { success: false, message: error.message }
  }
}