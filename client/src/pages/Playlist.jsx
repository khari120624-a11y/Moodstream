import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import SongCard from '../components/SongCard';
import api from '../services/api';
import { Heart, Music, LogIn, Disc, AlertCircle } from 'lucide-react';

const Playlist = ({ playTrack, currentTrack, isPlaying }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [playlistTracks, setPlaylistTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
        setError('Could not retrieve your saved library. Please reload.');
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylist();
  }, [user]);

  const handlePlayClick = (song) => {
    // Play current track, and pass the entire playlist as the queue
    playTrack(song, playlistTracks);
    navigate('/now-playing');
  };

  const handleRemoveTrack = async (song) => {
    try {
      const deleteId = song._id || song.spotifyId;
      const response = await api.delete(`/music/playlist/${deleteId}`);
      setPlaylistTracks(response.data);
    } catch (err) {
      console.error('Error removing track:', err);
      alert('Could not remove song. Please try again.');
    }
  };

  // State 1: User is not logged in
  if (!user) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 120px)',
        padding: '20px',
      }}>
        <div className="glass-panel" style={{
          maxWidth: '500px',
          padding: '40px',
          textAlign: 'center',
          boxShadow: '0 15px 35px rgba(0,0,0,0.3)',
        }}>
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px auto',
            color: '#ef4444',
          }}>
            <Heart size={32} fill="currentColor" />
          </div>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.8rem',
            fontWeight: 800,
            marginBottom: '10px',
            color: 'white',
          }}>
            Personal Library
          </h2>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '0.95rem',
            lineHeight: 1.6,
            marginBottom: '30px',
          }}>
            Create an account or log in to curate your favorite mood-based music, compile personal playlists, and save tracks.
          </p>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '15px',
          }}>
            <Link to="/login" className="glow-button" style={{ padding: '10px 24px' }}>
              <LogIn size={18} /> Log In
            </Link>
            <Link to="/register" className="glass-card" style={{
              padding: '10px 24px',
              border: '1px solid var(--border-glass)',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.95rem',
              transition: 'var(--transition-smooth)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              e.currentTarget.style.borderColor = 'var(--border-glass-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'var(--border-glass)';
            }}
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // State 2: Loading State
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 120px)',
      }}>
        <Disc size={44} className="spin-slow" style={{ animationDuration: '3s', color: '#818cf8', marginBottom: '15px' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Loading your collection...</p>
      </div>
    );
  }

  // State 3: User logged in, showing tracks
  return (
    <div style={{
      padding: '40px 20px',
      maxWidth: '1200px',
      margin: '0 auto',
      minHeight: 'calc(100vh - 120px)',
      paddingBottom: currentTrack ? '140px' : '40px',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '40px',
        borderBottom: '1px solid var(--border-glass)',
        paddingBottom: '20px',
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #ef4444 0%, #ec4899 100%)',
          padding: '12px',
          borderRadius: '12px',
          color: 'white',
          boxShadow: '0 0 15px rgba(239, 68, 68, 0.4)',
        }}>
          <Heart size={24} fill="currentColor" />
        </div>
        <div>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 800,
            fontFamily: 'var(--font-display)',
          }}>
            My Playlist
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            You have saved <strong style={{ color: 'white' }}>{playlistTracks.length}</strong> {playlistTracks.length === 1 ? 'song' : 'songs'}
          </p>
        </div>
      </div>

      {error && (
        <div className="alert-box alert-danger">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Tracks display */}
      {playlistTracks.length === 0 ? (
        <div className="glass-panel" style={{
          padding: '60px 40px',
          textAlign: 'center',
          maxWidth: '600px',
          margin: '0 auto',
        }}>
          <Music size={48} style={{ color: 'var(--text-muted)', marginBottom: '20px' }} />
          <h3 style={{ fontSize: '1.25rem', color: 'white', marginBottom: '8px' }}>Your playlist is empty</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
            Songs you save while browsing moods will appear here.
          </p>
          <Link to="/" className="glow-button">
            Explore Moods
          </Link>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
        }}>
          {playlistTracks.map((song) => (
            <SongCard
              key={song._id || song.spotifyId || song.title}
              song={song}
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              onPlayClick={handlePlayClick}
              isSaved={true}
              onSaveToggle={handleRemoveTrack}
              isPlaylistView={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Playlist;
