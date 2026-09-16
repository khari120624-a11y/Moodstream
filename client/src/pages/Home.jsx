import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MoodCard from '../components/MoodCard';
import SongCard from '../components/SongCard';
import TrackTable from '../components/TrackTable';
import api from '../services/api';
import { Search, RefreshCw, X, Play, Music, Sparkles } from 'lucide-react';
import { categorizeTrack, isIndianTrack } from '../services/songClassifier';

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

const Home = ({
  playTrack,
  currentTrack,
  isPlaying,
  searchQuery,
  setSearchQuery,
  selectedMood,
  setSelectedMood,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [songs, setSongs] = useState([]);
  const [savedTracks, setSavedTracks] = useState([]);
  const [loadingSongs, setLoadingSongs] = useState(false);
  const [error, setError] = useState(null);

  // Search state
  const [searchResults, setSearchResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Filter Pills
  const [activeCategory, setActiveCategory] = useState('all');

  const searchTimeoutRef = useRef(null);

  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Load saved playlist to sync heart icons
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
        console.error('Error fetching playlist:', err);
      }
    };

    fetchSavedPlaylist();
  }, [user]);

  // Debounced Auto-Search
  useEffect(() => {
    if (!searchQuery || !searchQuery.trim()) {
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
        console.error('Error searching:', err);
        setError('Search request failed.');
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

  // Handle Mood Click
  const handleMoodSelect = async (moodKey) => {
    setSelectedMood(moodKey);
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);

    setLoadingSongs(true);
    setError(null);
    try {
      const response = await api.get(`/music/mood/${moodKey}`);
      const fetchedSongs = response.data;
      setSongs(fetchedSongs);

      if (fetchedSongs && fetchedSongs.length > 0) {
        playTrack(fetchedSongs[0], fetchedSongs);
      }
    } catch (err) {
      console.error('Error fetching mood tracks:', err);
      setError('Could not retrieve tracks for this mood.');
    } finally {
      setLoadingSongs(false);
    }
  };

  const clearSearch = () => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
    setError(null);
  };

  const isSongSaved = (song) => {
    return savedTracks.some(
      (track) =>
        (song.spotifyId && track.spotifyId === song.spotifyId) ||
        (!song.spotifyId && track.title?.toLowerCase() === song.title?.toLowerCase() && track.artist?.toLowerCase() === song.artist?.toLowerCase())
    );
  };

  const handleSaveToggle = async (song) => {
    try {
      const alreadySaved = isSongSaved(song);

      if (alreadySaved) {
        const savedTrack = savedTracks.find(
          (track) =>
            (song.spotifyId && track.spotifyId === song.spotifyId) ||
            (!song.spotifyId && track.title?.toLowerCase() === song.title?.toLowerCase() && track.artist?.toLowerCase() === song.artist?.toLowerCase())
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
      console.error('Error toggling song save:', err);
    }
  };

  const handlePlayClick = (song, activeList) => {
    const list = activeList || (isSearching ? searchResults : songs);
    playTrack(song, list);
  };

  // Quick picks list
  const quickPicks = [
    { id: 'qp-1', title: 'Trending Now Telugu', query: 'Trending Now Telugu', imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80' },
    { id: 'qp-2', title: 'Peddi (TELUGU)', query: 'Peddi Telugu', imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=300&q=80' },
    { id: 'qp-3', title: 'Ninnu Chuse Anandamlo', query: 'Ninnu Chuse Anandamlo Dacoit', imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=300&q=80' },
    { id: 'qp-4', title: 'OG Telugu songs', query: 'OG Telugu songs', imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=300&q=80' },
    { id: 'qp-5', title: 'Sarrainodu Hits', query: 'Sarrainodu songs', imageUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=300&q=80' },
    { id: 'qp-6', title: 'Hot Hits Telugu', query: 'Hot Hits Telugu', imageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=300&q=80' },
    { id: 'qp-7', title: 'Rubaroo Telugu', query: 'Rubaroo Dacoit', imageUrl: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?auto=format&fit=crop&w=300&q=80' },
    { id: 'qp-8', title: 'Liked Songs', isLikedSongs: true, imageUrl: null },
  ];

  // Jump Back In cards
  const jumpBackInItems = [
    { id: 'jbi-1', title: 'Telugu Mass BGM', subtitle: 'Mass Beats & Themes', tag: 'Playlist', query: 'Telugu mass BGM songs', imageUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=400&q=80' },
    { id: 'jbi-2', title: 'Singari', subtitle: 'Sai Abhyankkar', tag: 'Single', query: 'Singari Dude Telugu', imageUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=400&q=80' },
    { id: 'jbi-3', title: 'Chinnu', subtitle: 'G. V. Prakash Kumar', tag: 'Single', query: 'Chinnu Dude', imageUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=400&q=80' },
    { id: 'jbi-4', title: 'Madhuvaramae', subtitle: 'Sid Sriram', tag: 'Single', query: 'Madhuvaramae Leon James', imageUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=400&q=80' },
    { id: 'jbi-5', title: 'Magadheera Theme', subtitle: 'M. M. Keeravaani', tag: 'Playlist', query: 'Magadheera BGM', imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80' }
  ];

  return (
    <div style={{ padding: '24px', paddingBottom: currentTrack ? '140px' : '60px', width: '100%', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Category Pills Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', overflowX: 'auto' }}>
        <button onClick={() => setActiveCategory('all')} className={`spotify-pill ${activeCategory === 'all' ? 'active' : ''}`}>
          All
        </button>
        <button onClick={() => setActiveCategory('music')} className={`spotify-pill ${activeCategory === 'music' ? 'active' : ''}`}>
          Music
        </button>
        <button onClick={() => setActiveCategory('podcasts')} className={`spotify-pill ${activeCategory === 'podcasts' ? 'active' : ''}`}>
          Podcasts
        </button>
        <button onClick={() => setActiveCategory('moods')} className={`spotify-pill ${activeCategory === 'moods' ? 'active' : ''}`}>
          Moods
        </button>
      </div>

      {/* SEARCH RESULTS VIEW */}
      {isSearching ? (
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Search Results for "{searchQuery}"</h2>
            <button onClick={clearSearch} style={{ background: 'none', border: 'none', color: '#1db954', cursor: 'pointer', fontWeight: 700 }}>
              Close Search
            </button>
          </div>

          {loadingSearch ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <RefreshCw size={28} className="spin-slow" style={{ marginBottom: '12px' }} />
              <p>Searching tracks on Spotify...</p>
            </div>
          ) : searchResults.length > 0 ? (
            <TrackTable
              tracks={searchResults}
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              onPlayClick={(song) => handlePlayClick(song, searchResults)}
              savedTracks={savedTracks}
              onSaveToggle={handleSaveToggle}
            />
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>No results found.</p>
          )}
        </div>
      ) : (
        <>
          {/* GREETING & QUICK PICKS GRID */}
          <div style={{ marginBottom: '36px' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '18px', letterSpacing: '-0.02em' }}>
              {getGreeting()}
            </h1>

            <div className="quick-picks-grid">
              {quickPicks.map((item) => (
                <div
                  key={item.id}
                  className="quick-pick-card"
                  onClick={() => {
                    if (item.isLikedSongs) navigate('/playlist');
                    else setSearchQuery(item.query);
                  }}
                >
                  <div className="img-box">
                    {item.isLikedSongs ? (
                      <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #450af5 0%, #8e8ee5 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
                        <Music size={22} />
                      </div>
                    ) : (
                      <img src={item.imageUrl} alt={item.title} />
                    )}
                  </div>
                  <span className="title">{item.title}</span>
                  <div className="play-hover-btn">
                    <Play size={18} fill="#000000" color="#000000" style={{ marginLeft: '2px' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* JUMP BACK IN ROW */}
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '16px' }}>
              Jump back in
            </h2>
            <div className="scroll-row">
              {jumpBackInItems.map((item) => (
                <div
                  key={item.id}
                  className="media-card"
                  onClick={() => setSearchQuery(item.query)}
                >
                  <div className="art-container">
                    <img src={item.imageUrl} alt={item.title} />
                    <div className="play-btn-overlay">
                      <Play size={20} fill="#000000" color="#000000" style={{ marginLeft: '2px' }} />
                    </div>
                  </div>
                  <div className="type-tag">{item.tag}</div>
                  <div className="card-title">{item.title}</div>
                  <div className="card-subtitle">{item.subtitle}</div>
                </div>
              ))}
            </div>
          </div>

          {/* CHOOSE YOUR MOOD GRID */}
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '16px' }}>
              Choose your mood
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: '16px',
            }}>
              {Object.entries(MOODS_CONFIG).map(([key, config]) => (
                <MoodCard
                  key={key}
                  moodKey={key}
                  mood={config}
                  isSelected={selectedMood === key}
                  onSelect={handleMoodSelect}
                />
              ))}
            </div>
          </div>

          {/* SELECTED MOOD TRACKS TABLE */}
          {selectedMood && (
            <div style={{ marginBottom: '40px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, textTransform: 'capitalize' }}>
                  {MOODS_CONFIG[selectedMood]?.emoji} {selectedMood} Tracks
                </h2>
                <button
                  onClick={() => setSelectedMood(null)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  Close
                </button>
              </div>

              {loadingSongs ? (
                <div style={{ padding: '30px 0', color: 'var(--text-secondary)', textAlign: 'center' }}>
                  Loading tracks...
                </div>
              ) : (
                <TrackTable
                  tracks={songs}
                  currentTrack={currentTrack}
                  isPlaying={isPlaying}
                  onPlayClick={(song) => handlePlayClick(song, songs)}
                  savedTracks={savedTracks}
                  onSaveToggle={handleSaveToggle}
                />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Home;
