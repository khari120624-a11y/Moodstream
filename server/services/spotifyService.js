import axios from 'axios';
import { moods } from '../utils/moodMapper.js';

let cachedToken = null;
let tokenExpiresAt = null;

// Helper to get Spotify Access Token
const getSpotifyAccessToken = async () => {
  const clientId = process.env.SPOTIFY_CLIENT_ID?.trim();
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    console.log('Spotify credentials missing. Falling back to local/iTunes catalog.');
    return null;
  }

  // Use cached token if valid
  if (cachedToken && tokenExpiresAt && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  try {
    const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${authHeader}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    cachedToken = response.data.access_token;
    tokenExpiresAt = Date.now() + (response.data.expires_in - 60) * 1000;
    
    console.log('Successfully authenticated with Spotify API.');
    return cachedToken;
  } catch (error) {
    console.error('Spotify Auth Error:', error.response?.data || error.message);
    return null;
  }
};

/**
 * Fetch tracks from iTunes Search API (no key required, robust fallback)
 * @param {string} query - The search term
 * @param {number} limit - Max results
 */
export const getiTunesTracks = async (query, limit = 12) => {
  try {
    console.log(`[NETWORK FALLBACK] Querying iTunes Search API for: "${query}"`);
    const response = await axios.get('https://itunes.apple.com/search', {
      params: {
        term: query,
        limit: limit,
        media: 'music',
      },
      timeout: 6000,
    });

    const results = response.data.results || [];
    
    return results.map((item) => {
      // Guess if track is Indian based on metadata search terms
      const isIndian = 
        query.toLowerCase().includes('hindi') || 
        query.toLowerCase().includes('bollywood') || 
        query.toLowerCase().includes('punjabi') || 
        query.toLowerCase().includes('indian') ||
        query.toLowerCase().includes('salaar') ||
        query.toLowerCase().includes('pushpa') ||
        query.toLowerCase().includes('puspha') ||
        item.artistName.toLowerCase().includes('rahman') ||
        item.artistName.toLowerCase().includes('arijit') ||
        item.artistName.toLowerCase().includes('shreya') ||
        item.artistName.toLowerCase().includes('badshah') ||
        item.artistName.toLowerCase().includes('diljit') ||
        item.trackName.toLowerCase().includes('salaar') ||
        item.trackName.toLowerCase().includes('pushpa') ||
        item.trackName.toLowerCase().includes('puspha') ||
        item.collectionName?.toLowerCase().includes('bollywood');

      return {
        spotifyId: 'itunes_' + item.trackId,
        title: item.trackName,
        artist: item.artistName,
        album: item.collectionName || 'Single',
        imageUrl: item.artworkUrl100?.replace('100x100bb', '400x400bb') || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
        previewUrl: item.previewUrl,
        mood: 'search',
        language: isIndian ? 'indian' : 'english',
      };
    });
  } catch (error) {
    console.error('iTunes Search API failed:', error.message);
    return [];
  }
};

/**
 * Fetch tracks from Spotify based on mood
 * @param {string} mood - The mood name
 * @returns {Promise<Array>} - Array of tracks
 */
export const getTracksByMood = async (mood) => {
  const normalizedMood = mood.toLowerCase();
  const moodConfig = moods[normalizedMood];

  if (!moodConfig) {
    throw new Error(`Mood "${mood}" is not supported.`);
  }

  const token = await getSpotifyAccessToken();
  const itunesQuery = moodConfig.itunesQuery || moodConfig.spotifyQuery;

  // If no Spotify token, try iTunes search for the mood pop/ambient query
  if (!token) {
    const itunesTracks = await getiTunesTracks(itunesQuery, 12);
    if (itunesTracks.length > 0) {
      // Map to the active mood
      return itunesTracks.map(t => ({ ...t, mood: normalizedMood }));
    }
    return moodConfig.fallbackSongs;
  }

  try {
    const response = await axios.get('https://api.spotify.com/v1/search', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      params: {
        q: moodConfig.spotifyQuery,
        type: 'track',
        limit: 12,
      },
    });

    const items = response.data.tracks?.items || [];
    const tracks = items.map((item) => {
      const fallbackPreviewList = moodConfig.fallbackSongs.map(s => s.previewUrl);
      const randomFallbackPreview = fallbackPreviewList[Math.floor(Math.random() * fallbackPreviewList.length)];
      
      return {
        spotifyId: item.id,
        title: item.name,
        artist: item.artists.map((artist) => artist.name).join(', '),
        album: item.album.name,
        imageUrl: item.album.images[0]?.url || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
        previewUrl: item.preview_url || randomFallbackPreview,
        mood: normalizedMood,
        language: normalizedMood === 'romantic' || normalizedMood === 'happy' ? 'english' : 'indian' // basic distribution
      };
    });

    if (tracks.length === 0) {
      const itunesTracks = await getiTunesTracks(itunesQuery, 12);
      if (itunesTracks.length > 0) return itunesTracks.map(t => ({ ...t, mood: normalizedMood }));
      return moodConfig.fallbackSongs;
    }

    return tracks;

  } catch (error) {
    console.error('Spotify Search API Error:', error.message);
    console.log('Attempting iTunes fallback...');
    const itunesTracks = await getiTunesTracks(itunesQuery, 12);
    if (itunesTracks.length > 0) {
      return itunesTracks.map(t => ({ ...t, mood: normalizedMood }));
    }
    return moodConfig.fallbackSongs;
  }
};

/**
 * Search tracks by keyword
 * @param {string} query - The search query
 * @returns {Promise<Array>} - Array of matching tracks
 */
export const searchTracks = async (query) => {
  const token = await getSpotifyAccessToken();

  // If no Spotify token, search iTunes
  if (!token) {
    const itunesTracks = await getiTunesTracks(query, 15);
    if (itunesTracks.length > 0) return itunesTracks;
    return searchLocalFallback(query);
  }

  try {
    const response = await axios.get('https://api.spotify.com/v1/search', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      params: {
        q: query,
        type: 'track',
        limit: 15,
      },
    });

    const items = response.data.tracks?.items || [];
    const tracks = items.map((item) => {
      const allFallbacks = Object.values(moods).flatMap((m) => m.fallbackSongs);
      const randomFallbackPreview = allFallbacks[Math.floor(Math.random() * allFallbacks.length)].previewUrl;

      const isIndian = 
        query.toLowerCase().includes('hindi') || 
        query.toLowerCase().includes('bollywood') || 
        query.toLowerCase().includes('punjabi') || 
        query.toLowerCase().includes('sitar') ||
        query.toLowerCase().includes('des') ||
        item.name.toLowerCase().includes('tum hi ho') ||
        item.artists.some((a) => /arr|rahman|arijit|shreya|neh|badsh|dilji/i.test(a.name));

      return {
        spotifyId: item.id,
        title: item.name,
        artist: item.artists.map((artist) => artist.name).join(', '),
        album: item.album.name,
        imageUrl: item.album.images[0]?.url || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
        previewUrl: item.preview_url || randomFallbackPreview,
        mood: 'search',
        language: isIndian ? 'indian' : 'english',
      };
    });

    if (tracks.length === 0) {
      const itunesTracks = await getiTunesTracks(query, 15);
      if (itunesTracks.length > 0) return itunesTracks;
      return searchLocalFallback(query);
    }

    return tracks;
  } catch (error) {
    console.error('Spotify Search API error:', error.message);
    console.log('Attempting iTunes fallback...');
    const itunesTracks = await getiTunesTracks(query, 15);
    if (itunesTracks.length > 0) return itunesTracks;
    return searchLocalFallback(query);
  }
};

// Calculate Levenshtein Distance between two strings
const getLevenshteinDistance = (s1, s2) => {
  const len1 = s1.length;
  const len2 = s2.length;
  const matrix = Array.from({ length: len1 + 1 }, () => Array(len2 + 1).fill(0));

  for (let i = 0; i <= len1; i++) matrix[i][0] = i;
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }
  return matrix[len1][len2];
};

// Calculate match score for fuzzy matching
const getFuzzyScore = (track, query) => {
  const title = track.title.toLowerCase();
  const artist = track.artist.toLowerCase();
  const album = track.album?.toLowerCase() || '';
  const q = query.toLowerCase().trim();

  // 1. Direct substring checks (highest priority)
  if (title.includes(q)) return 100 - title.indexOf(q);
  if (artist.includes(q)) return 80 - artist.indexOf(q);
  if (album.includes(q)) return 60 - album.indexOf(q);

  // 2. Word-by-word similarity check
  const qWords = q.split(/\s+/).filter(w => w.length >= 2);
  if (qWords.length === 0) return 0;

  const tWords = title.split(/\s+/);
  const aWords = artist.split(/\s+/);
  let totalScore = 0;

  for (const qw of qWords) {
    let bestWordScore = 0;
    // Check in title words
    for (const tw of tWords) {
      if (tw.includes(qw)) {
        bestWordScore = Math.max(bestWordScore, 20);
      } else {
        const dist = getLevenshteinDistance(qw, tw);
        const maxLen = Math.max(qw.length, tw.length);
        const similarity = 1 - dist / maxLen;
        if (similarity > 0.5) {
          bestWordScore = Math.max(bestWordScore, similarity * 15);
        }
      }
    }
    // Check in artist words
    for (const aw of aWords) {
      if (aw.includes(qw)) {
        bestWordScore = Math.max(bestWordScore, 15);
      } else {
        const dist = getLevenshteinDistance(qw, aw);
        const maxLen = Math.max(qw.length, aw.length);
        const similarity = 1 - dist / maxLen;
        if (similarity > 0.5) {
          bestWordScore = Math.max(bestWordScore, similarity * 10);
        }
      }
    }
    totalScore += bestWordScore;
  }

  return totalScore;
};

// Helper for local search when both Spotify and iTunes are offline
const searchLocalFallback = (query) => {
  const allTracks = Object.values(moods).flatMap((m) => m.fallbackSongs);

  const seen = new Set();
  const uniqueTracks = allTracks.filter((track) => {
    const key = `${track.title.toLowerCase()}-${track.artist.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const scoredTracks = uniqueTracks
    .map((track) => ({
      track,
      score: getFuzzyScore(track, query),
    }))
    .filter((item) => item.score > 0);

  // Sort by score descending
  scoredTracks.sort((a, b) => b.score - a.score);

  return scoredTracks.map((item) => item.track);
};
