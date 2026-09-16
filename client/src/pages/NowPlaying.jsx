import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Pause, SkipForward, SkipBack, Music, Sparkles, Heart } from 'lucide-react';
import SongCard from '../components/SongCard';
import { detectSongMood } from '../services/songClassifier';

const MOOD_EMOJIS = {
  happy: '☀️ Happy',
  sad: '🌧️ Sad',
  energetic: '⚡ Energetic',
  chill: '🌊 Chill',
  focused: '🧠 Focused',
  romantic: '💖 Romantic',
};

const NowPlaying = ({ currentTrack, isPlaying, playTrack, queue = [], queueIndex = -1 }) => {
  const navigate = useNavigate();

  if (!currentTrack) {
    return (
      <div style={{
        padding: '60px 20px',
        textAlign: 'center',
        color: '#b3b3b3',
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Music size={48} style={{ color: '#727272', marginBottom: '16px' }} />
        <h2 style={{ color: 'white', marginBottom: '8px' }}>No song is currently playing</h2>
        <p style={{ marginBottom: '20px' }}>Select any song from Home to start listening with automatic mood recommendations.</p>
        <button
          onClick={() => navigate('/')}
          className="spotify-pill active"
          style={{ padding: '10px 24px', fontSize: '0.95rem' }}
        >
          Explore Music
        </button>
      </div>
    );
  }

  const trackMood = detectSongMood(currentTrack);
  const upcomingQueue = queue.slice(queueIndex + 1);

  return (
    <div style={{
      maxWidth: '1000px',
      margin: '0 auto',
      padding: '24px 16px 120px 16px',
      color: '#ffffff',
    }}>
      {/* Top Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'rgba(255,255,255,0.07)',
            border: 'none',
            borderRadius: '20px',
            color: 'white',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 600,
          }}
        >
          <ArrowLeft size={18} /> Back
        </button>

        <span style={{
          backgroundColor: 'rgba(29, 185, 84, 0.15)',
          color: '#1db954',
          border: '1px solid rgba(29, 185, 84, 0.3)',
          padding: '6px 14px',
          borderRadius: '20px',
          fontSize: '0.85rem',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          <Sparkles size={14} /> Mood Autoplay Active
        </span>
      </div>

      {/* Main Track Details Hero */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        marginBottom: '40px',
        backgroundColor: '#181818',
        borderRadius: '16px',
        padding: '32px 20px',
        boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
      }}>
        <div style={{
          width: '220px',
          height: '220px',
          borderRadius: '12px',
          overflow: 'hidden',
          marginBottom: '20px',
          boxShadow: '0 12px 28px rgba(0,0,0,0.6)',
        }}>
          <img
            src={currentTrack.imageUrl || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400'}
            alt={currentTrack.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>

        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '6px', lineHeight: 1.2 }}>
          {currentTrack.title}
        </h1>
        <p style={{ fontSize: '1.05rem', color: '#b3b3b3', marginBottom: '12px' }}>
          {currentTrack.artist}
        </p>

        {/* Mood Badge */}
        <span style={{
          backgroundColor: '#282828',
          color: '#ffffff',
          padding: '4px 12px',
          borderRadius: '12px',
          fontSize: '0.8rem',
          fontWeight: 600,
          textTransform: 'capitalize',
        }}>
          Vibe: {MOOD_EMOJIS[trackMood] || trackMood}
        </span>
      </div>

      {/* UPCOMING MOOD AUTOPLAY QUEUE */}
      <div style={{ marginTop: '30px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '4px' }}>
              Playing Next (Based on {MOOD_EMOJIS[trackMood] || trackMood} Mood)
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#b3b3b3' }}>
              These tracks will automatically play next based on your selected song's vibe.
            </p>
          </div>
        </div>

        {upcomingQueue.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {upcomingQueue.map((song, idx) => (
              <SongCard
                key={`${song.spotifyId || song.title}-${idx}`}
                song={song}
                currentTrack={currentTrack}
                isPlaying={isPlaying}
                onPlayClick={(selected) => playTrack(selected, queue)}
                isSaved={false}
                onSaveToggle={() => {}}
              />
            ))}
          </div>
        ) : (
          <p style={{ color: '#b3b3b3', fontStyle: 'italic' }}>
            Generating additional mood recommendations...
          </p>
        )}
      </div>
    </div>
  );
};

export default NowPlaying;
