import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Library, Heart, Sparkles, Radio, Plus, Music, Compass } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ onMoodSelect, selectedMood }) => {
  const location = useLocation();
  const { user } = useAuth();
  const isActive = (path) => location.pathname === path;

  const moodPlaylists = [
    { key: 'happy', name: 'Happy Vibes ☀️', color: '#ff9933' },
    { key: 'sad', name: 'Rainy Sad Melodies 🌧️', color: '#26d0ce' },
    { key: 'energetic', name: 'High Energy Workout ⚡', color: '#f12711' },
    { key: 'chill', name: 'Chill Waves 🌊', color: '#38ef7d' },
    { key: 'focused', name: 'Deep Focus & Study 🧠', color: '#d76d77' },
    { key: 'romantic', name: 'Romantic Moments 💖', color: '#e65c00' },
  ];

  return (
    <aside className="spotify-sidebar">
      {/* Brand Header */}
      <Link to="/" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        textDecoration: 'none',
        color: 'white',
        padding: '4px 12px 12px 12px',
      }}>
        <div style={{
          backgroundColor: '#1db954',
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#000000',
          boxShadow: '0 0 15px rgba(29, 185, 84, 0.4)',
        }}>
          <Music size={20} fill="#000000" />
        </div>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: '1.35rem',
          letterSpacing: '-0.02em',
          color: '#ffffff',
        }}>
          MoodStream
        </span>
      </Link>

      {/* Primary Main Links */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <Link to="/" className={`sidebar-nav-item ${isActive('/') ? 'active' : ''}`}>
          <Home size={22} />
          <span>Home</span>
        </Link>
        <Link to="/playlist" className={`sidebar-nav-item ${isActive('/playlist') ? 'active' : ''}`}>
          <Library size={22} />
          <span>Your Library</span>
        </Link>
        <Link to="/vibe-room" className={`sidebar-nav-item ${isActive('/vibe-room') ? 'active' : ''}`}>
          <Radio size={22} />
          <span>Vibe Room</span>
        </Link>
        <Link to="/future-assessment" className={`sidebar-nav-item ${isActive('/future-assessment') ? 'active' : ''}`}>
          <Sparkles size={22} />
          <span>Future Vibe</span>
        </Link>
      </div>

      <hr style={{ borderColor: 'rgba(255, 255, 255, 0.08)', margin: '4px 0' }} />

      {/* Library & Playlists Section */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 12px',
          color: 'var(--text-secondary)',
        }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Playlists & Moods
          </span>
          <Plus size={18} style={{ cursor: 'pointer' }} title="Create Playlist" />
        </div>

        {/* Liked Songs Special Card */}
        <Link
          to="/playlist"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '8px 12px',
            borderRadius: '6px',
            textDecoration: 'none',
            color: 'white',
            backgroundColor: isActive('/playlist') ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
            transition: 'var(--transition-smooth)',
          }}
          className="sidebar-nav-item"
        >
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '4px',
            background: 'linear-gradient(135deg, #450af5 0%, #8e8ee5 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            flexShrink: 0,
          }}>
            <Heart size={16} fill="white" />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Liked Songs
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Playlist • {user ? user.username : 'User'}
            </div>
          </div>
        </Link>

        {/* Mood Playlists List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {moodPlaylists.map((m) => (
            <div
              key={m.key}
              onClick={() => onMoodSelect && onMoodSelect(m.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '8px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                color: selectedMood === m.key ? '#1db954' : 'var(--text-secondary)',
                backgroundColor: selectedMood === m.key ? 'rgba(29, 185, 84, 0.12)' : 'transparent',
                transition: 'var(--transition-smooth)',
                fontSize: '0.875rem',
                fontWeight: selectedMood === m.key ? 700 : 500,
              }}
              onMouseEnter={(e) => {
                if (selectedMood !== m.key) e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.backgroundColor = selectedMood === m.key ? 'rgba(29, 185, 84, 0.12)' : 'rgba(255,255,255,0.05)';
              }}
              onMouseLeave={(e) => {
                if (selectedMood !== m.key) e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.backgroundColor = selectedMood === m.key ? 'rgba(29, 185, 84, 0.12)' : 'transparent';
              }}
            >
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: m.color,
                display: 'inline-block',
                flexShrink: 0,
              }} />
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {m.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
