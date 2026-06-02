import { getTracksByMood, searchTracks } from '../services/spotifyService.js';
import { dbPlaylist as Playlist } from '../utils/dbManager.js';

/**
 * @desc    Get recommended tracks for a specific mood
 * @route   GET /api/music/mood/:mood
 * @access  Public
 */
export const getSongsByMood = async (req, res) => {
  const { mood } = req.params;

  try {
    const tracks = await getTracksByMood(mood);
    res.json(tracks);
  } catch (error) {
    console.error(`Error fetching songs for mood "${mood}":`, error.message);
    res.status(400).json({ message: error.message || 'Error fetching tracks' });
  }
};

/**
 * @desc    Get current user's saved playlist
 * @route   GET /api/music/playlist
 * @access  Private
 */
export const getUserPlaylist = async (req, res) => {
  try {
    let playlist = await Playlist.findOne({ user: req.user.id });
    
    // If user doesn't have a playlist document yet, return empty list
    if (!playlist) {
      return res.json([]);
    }

    // Sort tracks by addition date descending (newest additions first)
    const sortedTracks = [...playlist.tracks].sort((a, b) => b.addedAt - a.addedAt);
    res.json(sortedTracks);
  } catch (error) {
    console.error('Error fetching user playlist:', error.message);
    res.status(500).json({ message: 'Server error retrieving playlist' });
  }
};

/**
 * @desc    Save a track to user's playlist
 * @route   POST /api/music/playlist
 * @access  Private
 */
export const saveSongToPlaylist = async (req, res) => {
  const { spotifyId, title, artist, album, imageUrl, previewUrl, mood } = req.body;

  if (!title || !artist) {
    return res.status(400).json({ message: 'Song title and artist are required' });
  }

  try {
    // Find user's playlist or create one
    let playlist = await Playlist.findOne({ user: req.user.id });

    if (!playlist) {
      playlist = new Playlist({
        user: req.user.id,
        tracks: [],
      });
    }

    // Check if song already exists in playlist by spotifyId or combination of title and artist
    const alreadySaved = playlist.tracks.some(
      (track) => 
        (spotifyId && track.spotifyId === spotifyId) || 
        (track.title.toLowerCase() === title.toLowerCase() && track.artist.toLowerCase() === artist.toLowerCase())
    );

    if (alreadySaved) {
      return res.status(400).json({ message: 'Song is already in your playlist' });
    }

    // Add track to playlist
    playlist.tracks.push({
      spotifyId,
      title,
      artist,
      album,
      imageUrl,
      previewUrl,
      mood,
    });

    await playlist.save();
    
    // Return sorted tracks
    const sortedTracks = [...playlist.tracks].sort((a, b) => b.addedAt - a.addedAt);
    res.status(201).json(sortedTracks);
  } catch (error) {
    console.error('Error saving song to playlist:', error.message);
    res.status(500).json({ message: 'Server error saving track' });
  }
};

/**
 * @desc    Delete a track from user's playlist
 * @route   DELETE /api/music/playlist/:trackId
 * @access  Private
 */
export const deleteSongFromPlaylist = async (req, res) => {
  const { trackId } = req.params;

  try {
    const playlist = await Playlist.findOne({ user: req.user.id });

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    // Filter out the track
    const trackIndex = playlist.tracks.findIndex(
      (track) => track._id.toString() === trackId || track.spotifyId === trackId
    );

    if (trackIndex === -1) {
      return res.status(404).json({ message: 'Track not found in playlist' });
    }

    playlist.tracks.splice(trackIndex, 1);
    await playlist.save();

    const sortedTracks = [...playlist.tracks].sort((a, b) => b.addedAt - a.addedAt);
    res.json(sortedTracks);
  } catch (error) {
    console.error('Error deleting song from playlist:', error.message);
    res.status(500).json({ message: 'Server error deleting track' });
  }
};

/**
 * @desc    Search tracks by query string
 * @route   GET /api/music/search
 * @access  Public
 */
export const searchSongs = async (req, res) => {
  const { q } = req.query;

  try {
    if (!q) {
      return res.status(400).json({ message: 'Search query parameter (q) is required' });
    }

    const tracks = await searchTracks(q);
    res.json(tracks);
  } catch (error) {
    console.error(`Error searching tracks for query "${q}":`, error.message);
    res.status(500).json({ message: 'Server error searching tracks' });
  }
};

/**
 * @desc    Search YouTube for a track to get its video ID (for playing full songs)
 * @route   GET /api/music/youtube-id
 * @access  Public
 */
export const getYouTubeId = async (req, res) => {
  const { title, artist } = req.query;

  if (!title || !artist) {
    return res.status(400).json({ message: 'Title and artist parameters are required' });
  }

  try {
    const query = `${title} ${artist} audio`;
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    
    // Import axios dynamically if needed, but it is already imported at the top
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    });

    const html = await response.text();
    
    // Extract videoRenderer videoId
    const regex = /"videoRenderer":\s*\{"videoId":\s*"([^"]+)"/g;
    const match = regex.exec(html);

    if (match && match[1]) {
      return res.json({ videoId: match[1] });
    }

    // Backup regex to find any 11-char videoId
    const backupRegex = /"videoId":\s*"([^"]+)"/g;
    let backupMatch;
    while ((backupMatch = backupRegex.exec(html)) !== null) {
      if (backupMatch[1] && backupMatch[1].length === 11) {
        return res.json({ videoId: backupMatch[1] });
      }
    }

    res.status(404).json({ message: 'YouTube video ID not found' });
  } catch (error) {
    console.error('YouTube ID fetch failed:', error.message);
    res.status(500).json({ message: 'Server error retrieving video ID' });
  }
};
