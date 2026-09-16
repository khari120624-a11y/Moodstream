import React from 'react';
import { Play, Pause, Heart, Trash2, Clock, Tv, Music } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const TrackTable = ({
  tracks = [],
  currentTrack,
  isPlaying,
  onPlayClick,
  savedTracks = [],
  onSaveToggle,
  isPlaylistView = false,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const isSongSaved = (song) => {
    return savedTracks.some(
      (t) =>
        (song.spotifyId && t.spotifyId === song.spotifyId) ||
        (!song.spotifyId && t.title?.toLowerCase() === song.title?.toLowerCase() && t.artist?.toLowerCase() === song.artist?.toLowerCase())
    );
  };

  const handleHeartClick = (e, song) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    onSaveToggle(song);
  };

  const handlePlayVideo = (e, song) => {
    e.stopPropagation();
    onPlayClick({ ...song, playVideo: true });
  };

  if (!tracks || tracks.length === 0) {
    return null;
  }

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <table className="spotify-track-table">
        <thead>
          <tr>
            <th style={{ width: '40px', textAlign: 'center' }}>#</th>
            <th>Title</th>
            <th style={{ display: 'table-cell' }}>Album</th>
            <th style={{ width: '100px', textAlign: 'center' }}>
              <Clock size={16} />
            </th>
            <th style={{ width: '100px', textAlign: 'right', paddingRight: '20px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tracks.map((song, index) => {
            const isCurrent = currentTrack && (
              (currentTrack.spotifyId && currentTrack.spotifyId === song.spotifyId) ||
              (!currentTrack.spotifyId && currentTrack.title === song.title && currentTrack.artist === song.artist)
            );

            const saved = isSongSaved(song);

            return (
              <tr
                key={song._id || song.spotifyId || song.title + index}
                className={`spotify-track-row ${isCurrent ? 'active' : ''}`}
                onClick={() => onPlayClick(song)}
              >
                {/* Index / Play / Equalizer */}
                <td style={{ textAlign: 'center', width: '40px' }}>
                  {isCurrent && isPlaying ? (
                    <div className="playing" style={{ display: 'inline-flex', alignItems: 'flex-end', gap: '2px', height: '16px' }}>
                      <div className="equalizer-bar" />
                      <div className="equalizer-bar" />
                      <div className="equalizer-bar" />
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.9rem', color: isCurrent ? '#1db954' : 'var(--text-muted)' }}>
                      {index + 1}
                    </span>
                  )}
                </td>

                {/* Title & Artist & Cover Art */}
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      backgroundColor: '#181818',
                      flexShrink: 0,
                    }}>
                      <img
                        src={song.imageUrl || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200'}
                        alt={song.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{
                        fontSize: '0.925rem',
                        fontWeight: 600,
                        color: isCurrent ? '#1db954' : '#ffffff',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {song.title}
                      </div>
                      <div style={{
                        fontSize: '0.8rem',
                        color: 'var(--text-secondary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {song.artist}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Album */}
                <td style={{
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '200px',
                }}>
                  {song.album || 'Single'}
                </td>

                {/* Duration */}
                <td style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  3:30
                </td>

                {/* Action Buttons */}
                <td style={{ textAlign: 'right', paddingRight: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                    {/* Video toggle */}
                    <button
                      onClick={(e) => handlePlayVideo(e, song)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: (isCurrent && currentTrack?.playVideo) ? '#1db954' : 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '6px',
                        borderRadius: '50%',
                        transition: 'var(--transition-smooth)',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#1db954'}
                      onMouseLeave={(e) => e.currentTarget.style.color = (isCurrent && currentTrack?.playVideo) ? '#1db954' : 'var(--text-muted)'}
                      title="Play Video"
                    >
                      <Tv size={16} />
                    </button>

                    {/* Like / Delete button */}
                    {isPlaylistView ? (
                      <button
                        onClick={(e) => { e.stopPropagation(); onSaveToggle(song); }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: '6px',
                          borderRadius: '50%',
                          transition: 'var(--transition-smooth)',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                        title="Remove from Playlist"
                      >
                        <Trash2 size={16} />
                      </button>
                    ) : (
                      <button
                        onClick={(e) => handleHeartClick(e, song)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: saved ? '#1db954' : 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: '6px',
                          borderRadius: '50%',
                          transition: 'var(--transition-smooth)',
                        }}
                        onMouseEnter={(e) => {
                          if (!saved) e.currentTarget.style.color = '#ffffff';
                        }}
                        onMouseLeave={(e) => {
                          if (!saved) e.currentTarget.style.color = 'var(--text-muted)';
                        }}
                        title={saved ? "Saved to Library" : "Save to Library"}
                      >
                        <Heart size={16} fill={saved ? '#1db954' : 'none'} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TrackTable;
