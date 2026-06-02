import React from 'react';
import { Play, Pause, Heart, Trash2, Music, Tv } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const SongCard = ({
  song,
  currentTrack,
  isPlaying,
  onPlayClick,
  isSaved,
  onSaveToggle,
  isPlaylistView = false,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const isCurrentTrack = currentTrack && (
    (currentTrack.spotifyId && currentTrack.spotifyId === song.spotifyId) ||
    (!currentTrack.spotifyId && currentTrack.title === song.title && currentTrack.artist === song.artist)
  );

  const handlePlay = () => {
    onPlayClick(song);
  };

  const handlePlayVideo = (e) => {
    e.stopPropagation();
    onPlayClick({ ...song, playVideo: true });
  };

  const handleHeartClick = (e) => {
    e.stopPropagation();
    if (!user) {
      // Redirect to login if user is not authenticated
      navigate('/login');
      return;
    }
    onSaveToggle(song);
  };

  return (
    <div
      className="glass-card"
      style={{
        padding: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        transition: 'var(--transition-smooth)',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.35)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-glass)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.2)';
      }}
    >
      {/* Album Cover Art / Play Overlay */}
      <div
        style={{
          position: 'relative',
          width: '56px',
          height: '56px',
          borderRadius: '8px',
          overflow: 'hidden',
          backgroundColor: '#1e293b',
          flexShrink: 0,
          cursor: 'pointer',
        }}
        onClick={handlePlay}
      >
        {song.imageUrl ? (
          <img
            src={song.imageUrl}
            alt={song.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
          }}>
            <Music size={24} />
          </div>
        )}

        {/* Hover / Play State Overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.5)',
            display: isCurrentTrack ? 'flex' : 'none',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'var(--transition-smooth)',
          }}
          className="play-overlay"
        >
          {isCurrentTrack && isPlaying ? (
            <Pause size={20} style={{ color: 'white' }} />
          ) : (
            <Play size={20} style={{ color: 'white', fill: 'white' }} />
          )}
        </div>
        
        {/* Force show play button on hover if not currently active */}
        <style>{`
          div:hover > .play-overlay {
            display: flex !important;
          }
        `}</style>
      </div>

      {/* Song Metadata */}
      <div style={{
        flexGrow: 1,
        minWidth: 0,
      }}>
        <h4
          style={{
            fontSize: '0.95rem',
            fontWeight: 600,
            color: isCurrentTrack ? '#818cf8' : 'white',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            marginBottom: '2px',
          }}
        >
          {song.title}
        </h4>
        <p
          style={{
            fontSize: '0.825rem',
            color: 'var(--text-secondary)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {song.artist}
        </p>
      </div>

      {/* Playing indicator animation */}
      {isCurrentTrack && isPlaying && (
        <div 
          className="playing"
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: '3px',
            height: '24px',
            marginRight: '8px',
          }}
        >
          <div className="equalizer-bar" style={{ '--accent': '#818cf8' }} />
          <div className="equalizer-bar" style={{ '--accent': '#818cf8' }} />
          <div className="equalizer-bar" style={{ '--accent': '#818cf8' }} />
          <div className="equalizer-bar" style={{ '--accent': '#818cf8' }} />
        </div>
      )}

      {/* Action Buttons (Save/Delete/Video) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
      }}>
        {/* Play Video button */}
        <button
          onClick={handlePlayVideo}
          style={{
            background: 'none',
            border: 'none',
            color: (isCurrentTrack && currentTrack?.playVideo) ? '#818cf8' : 'var(--text-muted)',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'var(--transition-smooth)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#818cf8';
            e.currentTarget.style.background = 'rgba(129, 140, 248, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = (isCurrentTrack && currentTrack?.playVideo) ? '#818cf8' : 'var(--text-muted)';
            e.currentTarget.style.background = 'none';
          }}
          title="Play Video Song"
        >
          <Tv size={18} />
        </button>

        {isPlaylistView ? (
          <button
            onClick={() => onSaveToggle(song)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'var(--transition-smooth)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#ef4444';
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-muted)';
              e.currentTarget.style.background = 'none';
            }}
            title="Remove from Playlist"
          >
            <Trash2 size={18} />
          </button>
        ) : (
          <button
            onClick={handleHeartClick}
            style={{
              background: 'none',
              border: 'none',
              color: isSaved ? '#ef4444' : 'var(--text-muted)',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'var(--transition-smooth)',
            }}
            onMouseEnter={(e) => {
              if (!isSaved) e.currentTarget.style.color = '#f87171';
              e.currentTarget.style.background = 'rgba(244, 63, 94, 0.08)';
            }}
            onMouseLeave={(e) => {
              if (!isSaved) e.currentTarget.style.color = 'var(--text-muted)';
              e.currentTarget.style.background = 'none';
            }}
            title={isSaved ? "Saved to Playlist" : "Save to Playlist"}
          >
            <Heart size={18} style={{ fill: isSaved ? '#ef4444' : 'none' }} />
          </button>
        )}
      </div>
    </div>
  );
};

export default SongCard;
