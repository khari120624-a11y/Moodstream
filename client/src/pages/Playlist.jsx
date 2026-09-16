import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import TrackTable from '../components/TrackTable';
import api from '../services/api';
import { Heart, Music, LogIn, Play, Search, AlertCircle } from 'lucide-react';

const Playlist = ({ playTrack, currentTrack, isPlaying }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [playlistTracks, setPlaylistTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterQuery, setFilterQuery] = useState('');

  useEffect(() => {
    const fetchPlaylist = async () => {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        const response = await api.get('/music/playlist');
        setPlaylistTracks(response.data);
      } catch (err) {
        console.error('Error fetching playlist:', err);
        setError('Could not retrieve your saved library.');
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylist();
  }, [user]);

  const handlePlayClick = (song) => {
    playTrack(song, playlistTracks);
  };

  const handlePlayAll = () => {
    if (playlistTracks.length > 0) {
      playTrack(playlistTracks[0], playlistTracks);
    }
  };

  const handleRemoveTrack = async (song) => {
    try {
      const deleteId = song._id || song.spotifyId;
      const response = await api.delete(`/music/playlist/${deleteId}`);
      setPlaylistTracks(response.data);
    } catch (err) {
      console.error('Error removing track:', err);
    }
  };

  const displayedTracks = playlistTracks.filter((t) =>
    t.title?.toLowerCase().includes(filterQuery.toLowerCase()) ||
    t.artist?.toLowerCase().includes(filterQuery.toLowerCase())
  );

  if (!user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 120px)', padding: '20px' }}>
        <div className="glass-panel" style={{ maxWidth: '480px', padding: '40px', textAlign: 'center' }}>
          <div style={{
            background: 'linear-gradient(135deg, #450af5 0%, #8e8ee5 100%)',
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px auto',
            color: 'white',
          }}>
            <Heart size={32} fill="white" />
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '10px' }}>Your Library</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '28px' }}>
            Log in to save songs, access your liked tracks, and build personal playlists on Moodstream.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px' }}>
            <Link to="/login" className="glow-button">
              <LogIn size={18} /> Log In
            </Link>
            <Link to="/register" className="spotify-pill">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: currentTrack ? '140px' : '60px', width: '100%' }}>
      {/* Spotify Header Gradient Banner */}
      <div style={{
        background: 'linear-gradient(180deg, #450af5 0%, #121212 100%)',
        padding: '40px 32px 24px 32px',
        display: 'flex',
        alignItems: 'flex-end',
        gap: '24px',
      }}>
        <div style={{
          width: '160px',
          height: '160px',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #450af5 0%, #8e8ee5 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          flexShrink: 0,
        }}>
          <Heart size={64} fill="white" />
        </div>

        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'white', letterSpacing: '0.05em' }}>
            Playlist
          </span>
          <h1 style={{ fontSize: '3rem', fontWeight: 900, color: 'white', margin: '4px 0 12px 0', letterSpacing: '-0.03em' }}>
            Liked Songs
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.8)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <strong style={{ color: 'white' }}>{user.username}</strong> • {playlistTracks.length} {playlistTracks.length === 1 ? 'song' : 'songs'}
          </p>
        </div>
      </div>

      {/* Playlist Actions Row */}
      <div style={{ padding: '24px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {playlistTracks.length > 0 && (
            <button
              onClick={handlePlayAll}
              style={{
                backgroundColor: '#1db954',
                border: 'none',
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 8px 20px rgba(29, 185, 84, 0.4)',
                transition: 'transform 0.15s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.06)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              title="Play All"
            >
              <Play size={24} fill="#000000" color="#000000" style={{ marginLeft: '3px' }} />
            </button>
          )}
        </div>

        {/* Filter Input */}
        {playlistTracks.length > 0 && (
          <div style={{ position: 'relative', width: '240px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search in playlist..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                borderRadius: '20px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: 'white',
                fontSize: '0.85rem',
                outline: 'none',
              }}
            />
          </div>
        )}
      </div>

      {/* Track Table Content */}
      <div style={{ padding: '0 32px' }}>
        {loading ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading tracks...
          </div>
        ) : displayedTracks.length > 0 ? (
          <TrackTable
            tracks={displayedTracks}
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            onPlayClick={handlePlayClick}
            savedTracks={playlistTracks}
            onSaveToggle={handleRemoveTrack}
            isPlaylistView={true}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            <Music size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <h3>Songs you save will appear here</h3>
            <p style={{ marginTop: '8px', fontSize: '0.9rem' }}>Find songs on Home or search your favorite artists!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Playlist;
