import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SongCard from '../components/SongCard';
import api from '../services/api';
import { Users, Plus, Play, Pause, LogOut, Copy, Check, Sparkles, RefreshCw, AlertCircle, Music, Globe } from 'lucide-react';
import { categorizeTrack, isIndianTrack } from '../services/songClassifier';

const MOODS_CONFIG = {
  happy: { name: 'Happy', emoji: '☀️', color: 'linear-gradient(135deg, #FF9933 0%, #FF5577 100%)', accent: '#FF7744' },
  sad: { name: 'Sad', emoji: '🌧️', color: 'linear-gradient(135deg, #1A2980 0%, #26D0CE 100%)', accent: '#26D0CE' },
  energetic: { name: 'Energetic', emoji: '⚡', color: 'linear-gradient(135deg, #F12711 0%, #F5AF19 100%)', accent: '#F12711' },
  chill: { name: 'Chill', emoji: '🌊', color: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', accent: '#11998e' },
  focused: { name: 'Focused', emoji: '🧠', color: 'linear-gradient(135deg, #3A1C71 0%, #D76D77 50%, #FFAF7B 100%)', accent: '#D76D77' },
  romantic: { name: 'Romantic', emoji: '💖', color: 'linear-gradient(135deg, #e65c00 0%, #F9D423 100%)', accent: '#e65c00' },
};

const VibeRoom = ({ playTrack, currentTrack, isPlaying }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State Management
  const [roomCode, setRoomCode] = useState(null);
  const [joinCode, setJoinCode] = useState('');
  const [roomStatus, setRoomStatus] = useState(null);
  const [myMood, setMyMood] = useState('chill');
  const [savedTracks, setSavedTracks] = useState([]);
  const [languageFilter, setLanguageFilter] = useState('all');
  const [indianSubFilter, setIndianSubFilter] = useState('all');
  const [copied, setCopied] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pollingActive, setPollingActive] = useState(false);

  // Sync references to prevent infinite playback loops
  const lastSyncedTrackRef = useRef(null);
  const pollingIntervalRef = useRef(null);

  // Fetch saved tracks for heart indicators
  useEffect(() => {
    const fetchSavedPlaylist = async () => {
      if (!user) return;
      try {
        const response = await api.get('/music/playlist');
        setSavedTracks(response.data);
      } catch (err) {
        console.error('Error fetching user playlist:', err);
      }
    };
    fetchSavedPlaylist();
  }, [user]);

  // Handle room status polling
  const fetchRoomStatus = async (code) => {
    try {
      const response = await api.get(`/room/status/${code}`);
      const data = response.data;
      setRoomStatus(data);

      // Synced Playback Logic
      if (data.currentTrack) {
        const isDifferentTrack = !currentTrack || (
          (data.currentTrack.spotifyId && data.currentTrack.spotifyId !== currentTrack.spotifyId) ||
          (!data.currentTrack.spotifyId && (data.currentTrack.title !== currentTrack.title || data.currentTrack.artist !== currentTrack.artist))
        );

        // If the track changed in the room compared to what we last synced, update local player
        const lastSyncedId = lastSyncedTrackRef.current?.spotifyId || lastSyncedTrackRef.current?.title;
        const roomTrackId = data.currentTrack.spotifyId || data.currentTrack.title;
        
        if (isDifferentTrack && lastSyncedId !== roomTrackId) {
          lastSyncedTrackRef.current = data.currentTrack;
          // Play the new room track using blended tracks list as queue
          playTrack(data.currentTrack, data.tracks);
        }
      }

      // Sync user's mood if different in db (e.g. loaded from lobby)
      const myMember = data.participants.find(p => p.user === user.id);
      if (myMember && myMember.mood !== myMood) {
        setMyMood(myMember.mood);
      }
    } catch (err) {
      console.error('Error polling room status:', err);
      if (err.response?.status === 404) {
        setError('Room has been closed or does not exist.');
        handleLeaveRoom();
      }
    }
  };

  // Setup / teardown polling interval
  useEffect(() => {
    if (pollingActive && roomCode) {
      // Poll immediately first
      fetchRoomStatus(roomCode);

      pollingIntervalRef.current = setInterval(() => {
        fetchRoomStatus(roomCode);
      }, 4000);
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [pollingActive, roomCode, currentTrack]);

  // Check auth
  if (!user) {
    return (
      <div style={{
        padding: '80px 20px',
        maxWidth: '600px',
        margin: '0 auto',
        textAlign: 'center',
        minHeight: 'calc(100vh - 120px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '20px',
      }}>
        <div className="glass-panel" style={{ padding: '40px', borderRadius: '24px' }}>
          <Users size={48} style={{ color: '#818cf8', marginBottom: '20px' }} />
          <h2 style={{ fontSize: '1.8rem', marginBottom: '12px' }}>Authentication Required</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.6' }}>
            To create or join collaborative **Vibe Rooms** and listen in sync with friends, please log in or register.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button onClick={() => navigate('/login')} className="glow-button" style={{ padding: '12px 28px' }}>
              Log In
            </button>
            <button onClick={() => navigate('/register')} className="glass-card" style={{
              padding: '12px 28px',
              border: '1px solid var(--border-glass)',
              color: 'white',
              borderRadius: '8px',
              cursor: 'pointer',
            }}>
              Sign Up
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Create Room handler
  const handleCreateRoom = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/room/create');
      const data = response.data;
      setRoomCode(data.roomCode);
      setRoomStatus(data);
      setPollingActive(true);
    } catch (err) {
      console.error(err);
      setError('Failed to create a vibe room. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Join Room handler
  const handleJoinRoom = async (e) => {
    e.preventDefault();
    if (!joinCode.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/room/join', { roomCode: joinCode.trim() });
      const data = response.data;
      setRoomCode(data.roomCode);
      setRoomStatus(data);
      setPollingActive(true);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to join the vibe room. Confirm the code is correct.');
    } finally {
      setLoading(false);
    }
  };

  // Change Mood handler
  const handleChangeMood = async (moodKey) => {
    setMyMood(moodKey);
    if (!roomCode) return;
    try {
      const response = await api.post('/room/mood', { roomCode, mood: moodKey });
      const newStatus = response.data;
      setRoomStatus(newStatus);
      
      // Auto-play the first blended track of the room and sync
      if (newStatus.tracks && newStatus.tracks.length > 0) {
        handlePlaySongAndSync(newStatus.tracks[0]);
      }
    } catch (err) {
      console.error('Error changing mood:', err);
    }
  };

  // Play a song and broadcast to room
  const handlePlaySongAndSync = async (song) => {
    // Play locally
    playTrack(song, roomStatus?.tracks || []);
    
    // Set sync reference
    lastSyncedTrackRef.current = song;

    // Broadcast playback to room
    if (!roomCode) return;
    try {
      await api.post('/room/sync', {
        roomCode,
        currentTrack: song,
        isPlaying: true,
      });
    } catch (err) {
      console.error('Error syncing playback:', err);
    }
  };

  // Leave Room handler
  const handleLeaveRoom = async () => {
    setPollingActive(false);
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    if (roomCode) {
      try {
        await api.post('/room/leave', { roomCode });
      } catch (err) {
        console.error('Error leaving room:', err);
      }
    }

    setRoomCode(null);
    setRoomStatus(null);
    setJoinCode('');
  };

  // Helper copy function
  const handleCopyCode = () => {
    if (!roomCode) return;
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Heart indicator syncs
  const isSongSaved = (song) => {
    return savedTracks.some(
      (track) =>
        (song.spotifyId && track.spotifyId === song.spotifyId) ||
        (!song.spotifyId && track.title.toLowerCase() === song.title.toLowerCase() && track.artist.toLowerCase() === song.artist.toLowerCase())
    );
  };

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
          mood: song.mood || 'vibe-room',
        });
        setSavedTracks(response.data);
      }
    } catch (err) {
      console.error('Error saving song:', err);
    }
  };

  const getFilteredSongs = (songList) => {
    if (!songList) return [];
    if (languageFilter === 'all') return songList;
    const isIndian = languageFilter === 'indian';
    let filtered = songList.filter((song) => {
      const isSongInd = isIndianTrack(song);
      return isIndian ? isSongInd : !isSongInd;
    });
    if (languageFilter === 'indian' && indianSubFilter !== 'all') {
      filtered = filtered.filter((song) => categorizeTrack(song) === indianSubFilter);
    }
    return filtered;
  };

  const displaySongs = getFilteredSongs(roomStatus?.tracks);

  return (
    <div style={{
      padding: '40px 20px',
      maxWidth: '900px',
      margin: '0 auto',
      minHeight: 'calc(100vh - 120px)',
      paddingBottom: currentTrack ? '140px' : '40px',
    }}>
      
      {/* 1. LOBBY VIEW (Not in a room) */}
      {!roomCode && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          {/* Header banner */}
          <div className="glass-panel" style={{
            padding: '50px 30px',
            textAlign: 'center',
            borderRadius: '24px',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute',
              top: '-60px',
              left: '-60px',
              width: '240px',
              height: '240px',
              background: 'radial-gradient(circle, rgba(168, 85, 247, 0.12) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />

            <div style={{
              display: 'inline-flex',
              background: 'rgba(168, 85, 247, 0.12)',
              padding: '16px',
              borderRadius: '50%',
              color: '#c084fc',
              marginBottom: '24px',
            }}>
              <Users size={36} />
            </div>

            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: 800,
              marginBottom: '15px',
              background: 'linear-gradient(to right, #ffffff, #c084fc)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Collaborative Vibe Room
            </h1>

            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '1.05rem',
              lineHeight: '1.6',
              maxWidth: '620px',
              margin: '0 auto 35px auto',
            }}>
              Connect with partners or friends in long distance. Create a shared room, update your moods in real-time, and listen to a custom playlist blended from all participants' vibes, fully synchronized.
            </p>

            {error && (
              <div className="alert-box alert-danger" style={{ maxWidth: '500px', margin: '0 auto 20px auto', justifyContent: 'center' }}>
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <div style={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: '24px',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              {/* Create Room Box */}
              <button
                onClick={handleCreateRoom}
                disabled={loading}
                className="glow-button"
                style={{
                  borderRadius: '30px',
                  padding: '14px 36px',
                  fontSize: '1.05rem',
                  background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
                  boxShadow: '0 0 20px rgba(168, 85, 247, 0.35)',
                  minWidth: '220px',
                }}
              >
                {loading ? <RefreshCw size={18} className="spin-slow" /> : <Plus size={18} />}
                Create Vibe Room
              </button>

              <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>OR</span>

              {/* Join Room Form */}
              <form onSubmit={handleJoinRoom} style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  placeholder="Enter 6-char Room Code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  style={{
                    padding: '12px 20px',
                    borderRadius: '30px',
                    border: '1px solid var(--border-glass)',
                    background: 'rgba(0,0,0,0.3)',
                    color: 'white',
                    fontSize: '1rem',
                    textAlign: 'center',
                    width: '210px',
                    textTransform: 'uppercase',
                  }}
                />
                <button
                  type="submit"
                  disabled={loading || !joinCode}
                  className="glass-card"
                  style={{
                    padding: '12px 24px',
                    borderRadius: '30px',
                    border: '1px solid rgba(255,255,255,0.12)',
                    background: 'rgba(255,255,255,0.05)',
                    color: 'white',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'var(--transition-smooth)',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                >
                  Join
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 2. ACTIVE ROOM VIEW */}
      {roomCode && roomStatus && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Header Panel */}
          <div className="glass-panel" style={{ padding: '24px 30px', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: 'rgba(168, 85, 247, 0.15)', padding: '10px', borderRadius: '12px', color: '#c084fc' }}>
                <Users size={22} />
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.08em', fontWeight: 600 }}>Active Vibe Room</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h2 style={{ fontSize: '1.4rem', color: 'white', fontWeight: 800 }}>{roomCode}</h2>
                  <button
                    onClick={handleCopyCode}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: copied ? '#10b981' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    title="Copy Room Code"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Sync active indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {roomStatus.currentTrack && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(16, 185, 129, 0.08)',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  fontSize: '0.8rem',
                  color: '#a7f3d0',
                }}>
                  <span className="equalizer-bar" style={{ animation: 'bounce-bar 0.7s infinite', height: '10px', width: '2px', background: '#10b981' }} />
                  Synced Playback Active
                </div>
              )}
              
              <button
                onClick={handleLeaveRoom}
                className="glass-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 18px',
                  borderRadius: '30px',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  background: 'rgba(239, 68, 68, 0.08)',
                  color: '#fca5a5',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  transition: 'var(--transition-smooth)',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.18)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'}
              >
                <LogOut size={15} />
                Leave Room
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }}>
            
            {/* Grid Layout: Participants & Mood Selector */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
              
              {/* Room Participants list */}
              <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontSize: '1.1rem', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Users size={16} style={{ color: '#c084fc' }} />
                  Room Members ({roomStatus.participants.length})
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {roomStatus.participants.map((member) => {
                    const moodKey = member.mood.toLowerCase();
                    const moodCfg = MOODS_CONFIG[moodKey] || { emoji: '🎵', color: 'rgba(255,255,255,0.05)', name: member.mood };
                    const isSelf = member.user === user.id;
                    const isHost = member.user === roomStatus.host;

                    return (
                      <div
                        key={member.user}
                        className="glass-card"
                        style={{
                          padding: '12px 16px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          borderRadius: '12px',
                          border: isSelf ? '1px solid rgba(168, 85, 247, 0.3)' : '1px solid var(--border-glass)',
                          background: isSelf ? 'rgba(168, 85, 247, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: '#10b981',
                            boxShadow: '0 0 8px #10b981',
                          }} />
                          <div>
                            <span style={{ fontWeight: 600, color: 'white', fontSize: '0.95rem' }}>
                              {member.username} {isSelf && <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>(You)</span>}
                            </span>
                            {isHost && (
                              <span style={{ display: 'block', fontSize: '0.75rem', color: '#c084fc', fontWeight: 600 }}>Room Host</span>
                            )}
                          </div>
                        </div>

                        {/* Member Mood badge */}
                        <span style={{
                          fontSize: '0.8rem',
                          background: moodCfg.color,
                          padding: '4px 10px',
                          borderRadius: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: 'white',
                          fontWeight: 600,
                          boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                        }}>
                          {moodCfg.emoji}
                          {moodCfg.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mood Broadcast Box */}
              <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontSize: '1.1rem', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={16} style={{ color: '#c084fc' }} />
                  Broadcast Your Current Vibe
                </h3>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                  Changing your mood instantly blends the room playlist to align with your current feeling!
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {Object.entries(MOODS_CONFIG).map(([key, cfg]) => {
                    const isSelected = myMood === key;
                    return (
                      <button
                        key={key}
                        onClick={() => handleChangeMood(key)}
                        style={{
                          border: isSelected ? `1px solid ${cfg.accent}` : '1px solid var(--border-glass)',
                          background: isSelected ? cfg.color : 'rgba(255, 255, 255, 0.02)',
                          color: isSelected ? 'white' : 'var(--text-secondary)',
                          padding: '10px 6px',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.775rem',
                          fontWeight: 600,
                          transition: 'all 0.2s',
                          boxShadow: isSelected ? `0 6px 15px ${cfg.accent}25` : 'none',
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.color = 'white';
                            e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.color = 'var(--text-secondary)';
                            e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                          }
                        }}
                      >
                        <span style={{ fontSize: '1.4rem' }}>{cfg.emoji}</span>
                        {cfg.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Room Synced Now Playing Box */}
            {roomStatus.currentTrack && (
              <div className="glass-panel" style={{
                padding: '20px 24px',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, rgba(22, 24, 30, 0.8) 0%, rgba(99, 102, 241, 0.05) 100%)',
                border: '1px solid rgba(99, 102, 241, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '15px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <img
                    src={roomStatus.currentTrack.imageUrl || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100'}
                    alt="Now Playing"
                    style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }}
                  />
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Shared Now Playing
                    </span>
                    <h4 style={{ color: 'white', fontSize: '1rem', fontWeight: 700 }}>{roomStatus.currentTrack.title}</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.825rem' }}>{roomStatus.currentTrack.artist}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="playing" style={{ display: 'flex', gap: '2px', height: '16px', alignItems: 'flex-end' }}>
                    <div className="equalizer-bar" style={{ '--accent': '#818cf8' }} />
                    <div className="equalizer-bar" style={{ '--accent': '#818cf8' }} />
                    <div className="equalizer-bar" style={{ '--accent': '#818cf8' }} />
                  </div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Synchronized for all members
                  </span>
                </div>
              </div>
            )}

            {/* Blended Playlist Section */}
            <div className="glass-panel" style={{ padding: '30px', borderRadius: '24px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '15px',
                marginBottom: '20px',
                borderBottom: '1px solid var(--border-glass)',
                paddingBottom: '16px',
              }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Music size={18} style={{ color: '#c084fc' }} />
                    Room Blended Vibe Playlist
                  </h3>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Blending:</span>
                    {roomStatus.blendedMoods && roomStatus.blendedMoods.map((mood) => {
                      const cfg = MOODS_CONFIG[mood] || { emoji: '🎵', name: mood };
                      return (
                        <span key={mood} style={{ fontSize: '0.75rem', color: 'white', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                          {cfg.emoji} {cfg.name}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Segmented Language Toggles */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  gap: '8px',
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'rgba(255,255,255,0.02)',
                    padding: '4px',
                    borderRadius: '30px',
                    border: '1px solid var(--border-glass)',
                  }}>
                    {[
                      { id: 'all', label: 'All Languages', icon: <Globe size={14} /> },
                      { id: 'english', label: '🇬🇧 Hollywood (English)', icon: null },
                      { id: 'indian', label: '🇮🇳 Indian', icon: null },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => {
                          setLanguageFilter(tab.id);
                          setIndianSubFilter('all');
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          border: 'none',
                          background: languageFilter === tab.id ? 'rgba(168, 85, 247, 0.15)' : 'transparent',
                          border: languageFilter === tab.id ? '1px solid rgba(168, 85, 247, 0.3)' : '1px solid transparent',
                          color: languageFilter === tab.id ? '#c084fc' : 'var(--text-secondary)',
                          padding: '4px 12px',
                          borderRadius: '20px',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
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

                  {/* Sub-industry filters for Indian */}
                  {languageFilter === 'indian' && (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: '6px',
                      background: 'rgba(255,255,255,0.01)',
                      padding: '3px',
                      borderRadius: '20px',
                      border: '1px solid rgba(255,255,255,0.04)',
                    }}
                    className="fade-in"
                    >
                      {[
                        { id: 'all', label: 'All Indian' },
                        { id: 'bollywood', label: '🎬 Bollywood' },
                        { id: 'kollywood', label: '🦁 Kollywood' },
                        { id: 'tollywood', label: '🔥 Tollywood' },
                      ].map((subTab) => (
                        <button
                          key={subTab.id}
                          type="button"
                          onClick={() => setIndianSubFilter(subTab.id)}
                          style={{
                            border: 'none',
                            background: indianSubFilter === subTab.id ? 'rgba(168, 85, 247, 0.15)' : 'transparent',
                            border: indianSubFilter === subTab.id ? '1px solid rgba(168, 85, 247, 0.3)' : '1px solid transparent',
                            color: indianSubFilter === subTab.id ? '#c084fc' : 'var(--text-secondary)',
                            padding: '3px 10px',
                            borderRadius: '16px',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            transition: 'var(--transition-smooth)',
                          }}
                          onMouseEnter={(e) => {
                            if (indianSubFilter !== subTab.id) {
                              e.currentTarget.style.color = 'white';
                              e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (indianSubFilter !== subTab.id) {
                              e.currentTarget.style.color = 'var(--text-secondary)';
                              e.currentTarget.style.background = 'transparent';
                            }
                          }}
                        >
                          {subTab.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {displaySongs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
                  <p style={{ color: 'white', marginBottom: '8px' }}>No blended songs found in this language</p>
                  <p style={{ fontSize: '0.85rem' }}>Update room members' active moods or switch language filters.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                  {displaySongs.map((song) => (
                    <SongCard
                      key={song.spotifyId || song.title}
                      song={song}
                      currentTrack={currentTrack}
                      isPlaying={isPlaying}
                      onPlayClick={handlePlaySongAndSync}
                      isSaved={isSongSaved(song)}
                      onSaveToggle={handleSaveToggle}
                    />
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default VibeRoom;
