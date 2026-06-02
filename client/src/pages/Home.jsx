import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MoodCard from '../components/MoodCard';
import SongCard from '../components/SongCard';
import api from '../services/api';
import { Search, Globe, RefreshCw, AlertCircle, X, Music } from 'lucide-react';

const MOODS_CONFIG = {
  happy: {
    name: 'Happy',
    emoji: '☀️',
    color: 'linear-gradient(135deg, #FF9933 0%, #FF5577 100%)',
    accent: '#FF7744',
  },
  sad: {
    name: 'Sad',
    emoji: '🌧️',
    color: 'linear-gradient(135deg, #1A2980 0%, #26D0CE 100%)',
    accent: '#26D0CE',
  },
  energetic: {
    name: 'Energetic',
    emoji: '⚡',
    color: 'linear-gradient(135deg, #F12711 0%, #F5AF19 100%)',
    accent: '#F12711',
  },
  chill: {
    name: 'Chill',
    emoji: '🌊',
    color: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    accent: '#11998e',
  },
  focused: {
    name: 'Focused',
    emoji: '🧠',
    color: 'linear-gradient(135deg, #3A1C71 0%, #D76D77 50%, #FFAF7B 100%)',
    accent: '#D76D77',
  },
  romantic: {
    name: 'Romantic',
    emoji: '💖',
    color: 'linear-gradient(135deg, #e65c00 0%, #F9D423 100%)',
    accent: '#e65c00',
  },
};

const Home = ({ playTrack, currentTrack, isPlaying }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedMood, setSelectedMood] = useState(null);
  const [songs, setSongs] = useState([]);
  const [savedTracks, setSavedTracks] = useState([]);
  const [loadingSongs, setLoadingSongs] = useState(false);
  const [error, setError] = useState(null);

  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Language filter: 'all', 'english', 'indian'
  const [languageFilter, setLanguageFilter] = useState('all');

  const searchTimeoutRef = useRef(null);

  // Load user's saved playlist to synchronize active heart icons
  useEffect(() => {
    const fetchSavedPlaylist = async () => {
      if (!user) {
        setSavedTracks([]);
        return;
      }
      try {
        const response = await api.get('/music/playlist');
        setSavedTracks(response.data);
      } catch (err) {
        console.error('Error fetching user playlist:', err);
      }
    };

    fetchSavedPlaylist();
  }, [user]);

  // Debounced auto-search as user types
  useEffect(() => {
    if (!searchQuery.trim()) {
      if (isSearching) {
        setSearchResults([]);
        setIsSearching(false);
      }
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setSelectedMood(null);
      setSongs([]);
      setIsSearching(true);
      setLoadingSearch(true);
      setError(null);

      try {
        const response = await api.get(`/music/search?q=${encodeURIComponent(searchQuery)}`);
        setSearchResults(response.data);
      } catch (err) {
        console.error('Error searching songs:', err);
        setError('Search request failed. Please check your network.');
      } finally {
        setLoadingSearch(false);
      }
    }, 400);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Fetch songs when a mood is selected
  const handleMoodSelect = async (moodKey) => {
    setSelectedMood(moodKey);
    // Clear search states when switching to mood mode
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
    
    setLoadingSongs(true);
    setError(null);
    try {
      const response = await api.get(`/music/mood/${moodKey}`);
      setSongs(response.data);
    } catch (err) {
      console.error('Error fetching mood tracks:', err);
      setError('Could not retrieve tracks for this mood. Please try again.');
    } finally {
      setLoadingSongs(false);
    }
  };

  // Handle immediate form submit
  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    setSelectedMood(null);
    setSongs([]);
    setIsSearching(true);
    setLoadingSearch(true);
    setError(null);

    try {
      const response = await api.get(`/music/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchResults(response.data);
    } catch (err) {
      console.error('Error searching songs:', err);
      setError('Search request failed. Please check your network.');
    } finally {
      setLoadingSearch(false);
    }
  };

  // Clear search and return to landing state
  const clearSearch = () => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
    setError(null);
  };

  // Check if a song is already saved in the user's playlist
  const isSongSaved = (song) => {
    return savedTracks.some(
      (track) =>
        (song.spotifyId && track.spotifyId === song.spotifyId) ||
        (!song.spotifyId && track.title.toLowerCase() === song.title.toLowerCase() && track.artist.toLowerCase() === song.artist.toLowerCase())
    );
  };

  // Toggle saving/removing a song
  const handleSaveToggle = async (song) => {
    try {
      const alreadySaved = isSongSaved(song);

      if (alreadySaved) {
        const savedTrack = savedTracks.find(
          (track) =>
            (song.spotifyId && track.spotifyId === song.spotifyId) ||
            (!song.spotifyId && track.title.toLowerCase() === song.title.toLowerCase() && track.artist.toLowerCase() === song.artist.toLowerCase())
        );
        
        const deleteId = savedTrack._id || savedTrack.spotifyId;
        const response = await api.delete(`/music/playlist/${deleteId}`);
        setSavedTracks(response.data);
      } else {
        const response = await api.post('/music/playlist', {
          spotifyId: song.spotifyId,
          title: song.title,
          artist: song.artist,
          album: song.album,
          imageUrl: song.imageUrl,
          previewUrl: song.previewUrl,
          mood: song.mood || selectedMood || 'search',
        });
        setSavedTracks(response.data);
      }
    } catch (err) {
      console.error('Error toggling song save state:', err);
      alert(err.response?.data?.message || 'Failed to update playlist');
    }
  };

  const handlePlayClick = (song) => {
    const queue = isSearching ? searchResults : songs;
    // Pass current track and relevant queue
    playTrack(song, queue);
    navigate('/now-playing');
  };

  // Apply Language Filters
  const getFilteredSongs = (songList) => {
    if (languageFilter === 'all') return songList;
    return songList.filter((song) => song.language === languageFilter);
  };

  const displaySongs = isSearching ? getFilteredSongs(searchResults) : getFilteredSongs(songs);

  return (
    <div style={{
      padding: '40px 20px',
      maxWidth: '1200px',
      margin: '0 auto',
      minHeight: 'calc(100vh - 120px)',
      paddingBottom: currentTrack ? '140px' : '40px',
    }}>
      
      {/* Title Hero Banner */}
      <div style={{
        textAlign: 'center',
        marginBottom: '35px',
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 800,
          marginBottom: '10px',
          fontFamily: 'var(--font-display)',
          background: 'linear-gradient(to right, #ffffff, #c7d2fe)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          How is your energy today?
        </h1>
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '1.025rem',
          maxWidth: '500px',
          margin: '0 auto',
        }}>
          Search for songs directly or select a mood preset below to match your vibe.
        </p>
      </div>

      {/* SEARCH BAR & FILTERS SECTION */}
      <div style={{
        maxWidth: '680px',
        margin: '0 auto 40px auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
      }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '12px', width: '100%' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <span style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none',
            }}>
              <Search size={20} />
            </span>
            <input
              type="text"
              className="form-input"
              placeholder="Search songs, artists, or genres (e.g. 'Tum Hi Ho', 'Sunshine')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                paddingLeft: '50px',
                paddingRight: searchQuery ? '45px' : '16px',
                fontSize: '1.05rem',
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'rgba(22, 24, 30, 0.65)',
                width: '100%',
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                style={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'var(--transition-smooth)',
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                <X size={18} />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{
              borderRadius: '24px',
              padding: '0 24px',
              whiteSpace: 'nowrap',
              fontSize: '0.95rem',
              fontWeight: 600,
              background: 'linear-gradient(to right, #6366f1, #4f46e5)',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(99, 102, 241, 0.25)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.35)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(99, 102, 241, 0.25)';
            }}
          >
            Search
          </button>
        </form>

        {/* Segmented Language Toggles */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '10px',
          background: 'rgba(255,255,255,0.02)',
          padding: '6px',
          borderRadius: '30px',
          border: '1px solid var(--border-glass)',
          alignSelf: 'center',
        }}>
          {[
            { id: 'all', label: 'All Languages', icon: <Globe size={14} /> },
            { id: 'english', label: '🇬🇧 English', icon: null },
            { id: 'indian', label: '🇮🇳 Indian', icon: null },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setLanguageFilter(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                border: 'none',
                background: languageFilter === tab.id ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                border: languageFilter === tab.id ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                color: languageFilter === tab.id ? '#a5b4fc' : 'var(--text-secondary)',
                padding: '6px 16px',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
                transition: 'var(--transition-smooth)',
              }}
              onMouseEnter={(e) => {
                if (languageFilter !== tab.id) {
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                }
              }}
              onMouseLeave={(e) => {
                if (languageFilter !== tab.id) {
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mood Grid Presets (visible when not active searching) */}
      {!isSearching && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '20px',
          marginBottom: '50px',
        }}>
          {Object.entries(MOODS_CONFIG).map(([key, value]) => (
            <MoodCard
              key={key}
              moodKey={key}
              moodData={value}
              isSelected={selectedMood === key}
              onClick={() => handleMoodSelect(key)}
            />
          ))}
        </div>
      )}

      {/* SONGS / RECOMMENDATION BOX */}
      {(selectedMood || isSearching) && (
        <div
          className="glass-panel"
          style={{
            padding: '30px',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.06)',
            boxShadow: isSearching
              ? '0 20px 40px rgba(0,0,0,0.3)'
              : `0 20px 40px rgba(0,0,0,0.3), 0 0 50px ${MOODS_CONFIG[selectedMood].accent}10`,
          }}
        >
          {/* Section Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            borderBottom: '1px solid var(--border-glass)',
            paddingBottom: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '1.8rem' }}>
                {isSearching ? '🔍' : MOODS_CONFIG[selectedMood].emoji}
              </span>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'white' }}>
                  {isSearching ? `Search Results for "${searchQuery}"` : `${MOODS_CONFIG[selectedMood].name} Mix`}
                </h3>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                  {isSearching
                    ? `Displaying matching tracks (${displaySongs.length} found)`
                    : 'Fresh soundtracks custom curated for your vibe'}
                </p>
              </div>
            </div>

            {(loadingSongs || loadingSearch) && (
              <span style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#818cf8',
                fontSize: '0.9rem',
              }}>
                <RefreshCw size={16} className="spin-slow" style={{ animationDuration: '2s' }} />
                Refreshing...
              </span>
            )}
          </div>

          {/* Error display */}
          {error && (
            <div className="alert-box alert-danger" style={{ justifyContent: 'center' }}>
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          {/* Loading spinner */}
          {(loadingSongs && songs.length === 0) || (loadingSearch && searchResults.length === 0) ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '60px 0',
              color: 'var(--text-secondary)',
            }}>
              <RefreshCw size={36} className="spin-slow" style={{ animationDuration: '2.5s', marginBottom: '15px', color: '#818cf8' }} />
              <p>Analyzing audio wavelengths...</p>
            </div>
          ) : displaySongs.length === 0 ? (
            /* Empty State */
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '60px 20px',
              color: 'var(--text-secondary)',
              textAlign: 'center',
            }}>
              <Music size={40} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
              <p style={{ fontSize: '1rem', color: 'white', marginBottom: '6px' }}>No songs found</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '360px' }}>
                There are no tracks matching your current filters. Try changing the language filter, or search for other keywords.
              </p>
            </div>
          ) : (
            /* Results display grid */
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px',
            }}>
              {displaySongs.map((song) => (
                <SongCard
                  key={song.spotifyId || song.title}
                  song={song}
                  currentTrack={currentTrack}
                  isPlaying={isPlaying}
                  onPlayClick={handlePlayClick}
                  isSaved={isSongSaved(song)}
                  onSaveToggle={handleSaveToggle}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
