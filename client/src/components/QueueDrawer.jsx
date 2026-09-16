import React from 'react';
import { X, Play, Trash2, ListMusic, Music } from 'lucide-react';

const QueueDrawer = ({
  isOpen,
  onClose,
  queue = [],
  queueIndex = -1,
  currentTrack,
  isPlaying,
  onPlayTrack,
  onRemoveFromQueue,
  onClearQueue,
}) => {
  if (!isOpen) return null;

  const nowPlayingTrack = currentTrack || (queueIndex >= 0 ? queue[queueIndex] : null);
  const upNextTracks = queueIndex >= 0 ? queue.slice(queueIndex + 1) : queue;

  return (
    <div className="drawer-panel" style={{ transform: isOpen ? 'translateX(0)' : 'translateX(100%)' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px',
        borderBottom: '1px solid var(--border-glass)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ListMusic size={22} style={{ color: '#1db954' }} />
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Play Queue</h2>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '50%',
            display: 'flex',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
        >
          <X size={20} />
        </button>
      </div>

      {/* Queue Content Scroll Container */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        {/* NOW PLAYING SECTION */}
        <div style={{ marginBottom: '28px' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Now Playing
          </h3>

          {nowPlayingTrack ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: 'rgba(29, 185, 84, 0.12)',
              border: '1px solid rgba(29, 185, 84, 0.3)',
            }}>
              <img
                src={nowPlayingTrack.imageUrl || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200'}
                alt={nowPlayingTrack.title}
                style={{ width: '48px', height: '48px', borderRadius: '6px', objectFit: 'cover' }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1db954', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {nowPlayingTrack.title}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {nowPlayingTrack.artist}
                </div>
              </div>
              {isPlaying && (
                <div className="playing" style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '18px' }}>
                  <div className="equalizer-bar" style={{ backgroundColor: '#1db954' }} />
                  <div className="equalizer-bar" style={{ backgroundColor: '#1db954' }} />
                  <div className="equalizer-bar" style={{ backgroundColor: '#1db954' }} />
                </div>
              )}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No track selected.</p>
          )}
        </div>

        {/* UP NEXT SECTION */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Next Up ({upNextTracks.length})
            </h3>
            {upNextTracks.length > 0 && onClearQueue && (
              <button
                onClick={onClearQueue}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                Clear Queue
              </button>
            )}
          </div>

          {upNextTracks.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {upNextTracks.map((track, i) => (
                <div
                  key={track._id || track.spotifyId || track.title + i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    transition: 'var(--transition-smooth)',
                    cursor: 'pointer',
                  }}
                  className="spotify-track-row"
                  onClick={() => onPlayTrack(track, queue)}
                >
                  <img
                    src={track.imageUrl || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200'}
                    alt={track.title}
                    style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {track.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {track.artist}
                    </div>
                  </div>
                  {onRemoveFromQueue && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveFromQueue(queueIndex + 1 + i);
                      }}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              <Music size={32} style={{ marginBottom: '8px', opacity: 0.5 }} />
              <p>Your queue is empty. Songs you click will be queued automatically!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QueueDrawer;
