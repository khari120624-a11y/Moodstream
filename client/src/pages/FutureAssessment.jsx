import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SongCard from '../components/SongCard';
import api from '../services/api';
import { categorizeTrack, isIndianTrack } from '../services/songClassifier';
import { Sparkles, ArrowRight, ArrowLeft, Calendar, Music, Clock, AlertCircle, RefreshCw, ChevronRight, Globe } from 'lucide-react';

const MOODS_CONFIG = {
  happy: {
    name: 'Happy',
    emoji: '☀️',
    color: 'linear-gradient(135deg, #FF9933 0%, #FF5577 100%)',
    accent: '#FF7744',
    quote: 'Your path is illuminated with bright opportunities and laughter. Shine bright like the sun today!',
  },
  sad: {
    name: 'Sad',
    emoji: '🌧️',
    color: 'linear-gradient(135deg, #1A2980 0%, #26D0CE 100%)',
    accent: '#26D0CE',
    quote: 'It is okay to pause, reflect, and feel the depth of your emotions. Healing happens in quiet spaces.',
  },
  energetic: {
    name: 'Energetic',
    emoji: '⚡',
    color: 'linear-gradient(135deg, #F12711 0%, #F5AF19 100%)',
    accent: '#F12711',
    quote: 'You are a powerhouse of potential. Unleash your drive and conquer every challenge in your way!',
  },
  chill: {
    name: 'Chill',
    emoji: '🌊',
    color: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    accent: '#11998e',
    quote: 'Flow like water. Let go of what you cannot control and enjoy the serene serenity of the present moment.',
  },
  focused: {
    name: 'Focused',
    emoji: '🧠',
    color: 'linear-gradient(135deg, #3A1C71 0%, #D76D77 50%, #FFAF7B 100%)',
    accent: '#D76D77',
    quote: 'Your mind is sharp and centered. Tune out the noise and let your creativity and intellect shine.',
  },
  romantic: {
    name: 'Romantic',
    emoji: '💖',
    color: 'linear-gradient(135deg, #e65c00 0%, #F9D423 100%)',
    accent: '#e65c00',
    quote: 'Connect deeply with the magic around you. Cherish the beauty of relationships and art today.',
  },
};

const QUESTIONS = [
  {
    id: 1,
    question: 'What is your primary goal or mindset for the upcoming hours?',
    options: [
      { text: '⚡ Crush my to-do list and stay super productive', values: { focused: 2, energetic: 1 } },
      { text: '🌊 Let go of all stress and chill completely', values: { chill: 2, happy: 1 } },
      { text: '☀️ Spread positive energy and vibe with others', values: { happy: 2, romantic: 1 } },
      { text: '🌧️ Reflect quietly on my feelings and thoughts', values: { sad: 2, focused: 1 } }
    ]
  },
  {
    id: 2,
    question: 'If you could teleport to your ideal environment right now, where would it be?',
    options: [
      { text: '⚡ A high-intensity music festival under neon lights', values: { energetic: 2, happy: 1 } },
      { text: '🌊 A quiet beach listening to the gentle crash of waves', values: { chill: 2 } },
      { text: '💖 A cozy candlelit room sharing a deep talk with a loved one', values: { romantic: 2, happy: 1 } },
      { text: '🧠 A warm, aesthetic library corner with a fresh cup of coffee', values: { focused: 2, chill: 1 } }
    ]
  },
  {
    id: 3,
    question: 'How would you rate your current mental battery level?',
    options: [
      { text: '⚡ 100% charged and ready for action!', values: { energetic: 2, focused: 1 } },
      { text: '☀️ Feeling good, steady and positive', values: { happy: 2, chill: 1 } },
      { text: '🌧️ Somewhat depleted, seeking emotional resonance', values: { sad: 2, romantic: 1 } },
      { text: '🧠 Hyper-focused on a specific task or thought', values: { focused: 2 } }
    ]
  },
  {
    id: 4,
    question: 'Which texture/ambiance fits your projected future vibe best?',
    options: [
      { text: '⚡ Electric sparks, fast beats, and intense movement', values: { energetic: 2 } },
      { text: '🌊 Warm mist, soft ambient synths, and slow breathing', values: { chill: 2, focused: 1 } },
      { text: '💖 Soft velvet, acoustic strings, and sweet melodies', values: { romantic: 2, sad: 1 } },
      { text: '☀️ Bright sunshine, pop vocals, and dancing beats', values: { happy: 2, energetic: 1 } }
    ]
  },
  {
    id: 5,
    question: 'When you look at the day ahead, what feeling do you want to cultivate most?',
    options: [
      { text: '⚡ Unstoppable drive and high performance', values: { energetic: 2, focused: 1 } },
      { text: '🌊 Deep calmness and inner peace', values: { chill: 2, focused: 1 } },
      { text: '☀️ Pure joy, gratitude, and lightheartedness', values: { happy: 2 } },
      { text: '💖 Intimate connection and deep appreciation for beauty', values: { romantic: 2, sad: 1 } }
    ]
  }
];

const FutureAssessment = ({ playTrack, currentTrack, isPlaying }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State Management
  const [step, setStep] = useState(0); // 0 = Intro, 1-5 = Questions, 6 = Results
  const [answers, setAnswers] = useState([]); // indices of selected choices
  const [projectedMood, setProjectedMood] = useState(null);
  const [songs, setSongs] = useState([]);
  const [savedTracks, setSavedTracks] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState(null);
  const [languageFilter, setLanguageFilter] = useState('all');
  const [indianSubFilter, setIndianSubFilter] = useState('all');

  // Sync user saved playlist to heart icon state
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

  // Fetch assessment history
  const fetchHistory = async () => {
    if (!user) return;
    setLoadingHistory(true);
    try {
      const response = await api.get('/music/assessment');
      setHistory(response.data);
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  // If not logged in, prompt user
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
          <Sparkles size={48} style={{ color: '#818cf8', marginBottom: '20px' }} />
          <h2 style={{ fontSize: '1.8rem', marginBottom: '12px' }}>Authentication Required</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.6' }}>
            To unlock the **Future Mood Assessment** and save your musical projections, please log in or sign up for a free account.
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

  const handleStart = () => {
    setAnswers([]);
    setStep(1);
    setProjectedMood(null);
    setSongs([]);
    setIndianSubFilter('all');
    setError(null);
  };

  const handleSelectOption = (optionIndex) => {
    const nextAnswers = [...answers];
    nextAnswers[step - 1] = optionIndex;
    setAnswers(nextAnswers);

    if (step < QUESTIONS.length) {
      setStep(step + 1);
    } else {
      calculateResult(nextAnswers);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else if (step === 1) {
      setStep(0);
    }
  };

  const calculateResult = async (finalAnswers) => {
    setLoading(true);
    setError(null);
    setStep(6);

    // Calculate scores
    const scores = { happy: 0, sad: 0, energetic: 0, chill: 0, focused: 0, romantic: 0 };
    
    finalAnswers.forEach((optionIndex, qIndex) => {
      const option = QUESTIONS[qIndex].options[optionIndex];
      Object.entries(option.values).forEach(([mood, val]) => {
        scores[mood] += val;
      });
    });

    // Determine highest score mood
    let bestMood = 'chill';
    let maxScore = -1;
    Object.entries(scores).forEach(([mood, score]) => {
      if (score > maxScore) {
        maxScore = score;
        bestMood = mood;
      }
    });

    setProjectedMood(bestMood);

    try {
      // 1. Save assessment to backend
      const payload = {
        answers: QUESTIONS.map((q, idx) => ({
          question: q.question,
          answer: q.options[finalAnswers[idx]].text,
        })),
        projectedMood: bestMood,
      };

      await api.post('/music/assessment', payload);

      // 2. Fetch tracks for this mood
      const tracksResponse = await api.get(`/music/mood/${bestMood}`);
      setSongs(tracksResponse.data);

      // 3. Refresh history dashboard
      fetchHistory();
    } catch (err) {
      console.error('Error calculating or saving projection:', err);
      setError('Could not save your projection. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  // Load a historical assessment directly
  const handleLoadHistoryAssessment = async (pastMood) => {
    setLoading(true);
    setError(null);
    setProjectedMood(pastMood);
    setStep(6);
    setIndianSubFilter('all');
    try {
      const tracksResponse = await api.get(`/music/mood/${pastMood}`);
      setSongs(tracksResponse.data);
    } catch (err) {
      console.error('Error loading history tracks:', err);
      setError('Could not retrieve tracks for this past mood preset.');
    } finally {
      setLoading(false);
    }
  };

  // Song saving synchronizer
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
          mood: song.mood || projectedMood || 'future-assessment',
        });
        setSavedTracks(response.data);
      }
    } catch (err) {
      console.error('Error toggling save:', err);
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

  const handlePlayFullQueue = () => {
    const displaySongs = getFilteredSongs(songs);
    if (displaySongs.length === 0) return;
    playTrack(displaySongs[0], displaySongs);
    navigate('/now-playing');
  };

  const activeMoodData = projectedMood ? MOODS_CONFIG[projectedMood] : null;

  return (
    <div style={{
      padding: '40px 20px',
      maxWidth: '850px',
      margin: '0 auto',
      minHeight: 'calc(100vh - 120px)',
      paddingBottom: currentTrack ? '140px' : '40px',
    }}>
      
      {/* 0. INTRO SCREEN */}
      {step === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          
          <div className="glass-panel" style={{
            padding: '50px 30px',
            textAlign: 'center',
            borderRadius: '24px',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute',
              top: '-50px',
              right: '-50px',
              width: '200px',
              height: '200px',
              background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
              pointerEvents: 'none'
            }} />
            
            <div style={{
              display: 'inline-flex',
              background: 'rgba(99, 102, 241, 0.12)',
              padding: '16px',
              borderRadius: '50%',
              color: '#818cf8',
              marginBottom: '24px',
              animation: 'pulse 3s infinite',
            }}>
              <Sparkles size={36} />
            </div>

            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: 800,
              marginBottom: '15px',
              background: 'linear-gradient(to right, #ffffff, #a5b4fc)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Future Mood Assessment
            </h1>

            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '1.05rem',
              lineHeight: '1.6',
              maxWidth: '600px',
              margin: '0 auto 35px auto',
            }}>
              Answer 5 quick, intuitive questions about your energy levels, intentions, and preferences. We will calculate your projected mood and curate a custom mix of songs to lead you into that vibe.
            </p>

            <button
              onClick={handleStart}
              className="glow-button"
              style={{
                borderRadius: '30px',
                padding: '14px 40px',
                fontSize: '1.1rem',
                gap: '10px',
              }}
            >
              Start vibe assessment
              <ArrowRight size={18} />
            </button>
          </div>

          {/* HISTORY SECTION */}
          <div className="glass-panel" style={{ padding: '30px', borderRadius: '24px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Clock size={18} style={{ color: '#818cf8' }} />
              Vibe Trajectory History
            </h3>

            {loadingHistory ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '30px 0', gap: '10px', color: 'var(--text-secondary)' }}>
                <RefreshCw size={20} className="spin-slow" />
                Loading history...
              </div>
            ) : history.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
                <Calendar size={32} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
                <p style={{ fontSize: '0.95rem' }}>No assessments completed yet. Take your first test above!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {history.slice(0, 5).map((item) => {
                  const mood = item.projectedMood.toLowerCase();
                  const cfg = MOODS_CONFIG[mood] || { emoji: '🎵', name: item.projectedMood, color: 'rgba(255,255,255,0.05)' };
                  return (
                    <div
                      key={item._id || item.createdAt}
                      className="glass-card"
                      style={{
                        padding: '14px 20px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderRadius: '12px',
                        transition: 'var(--transition-smooth)',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-glass)'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <span style={{
                          fontSize: '1.6rem',
                          background: cfg.color,
                          padding: '8px',
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '44px',
                          height: '44px',
                        }}>
                          {cfg.emoji}
                        </span>
                        <div>
                          <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'white' }}>
                            Projected: {cfg.name}
                          </h4>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {new Date(item.createdAt).toLocaleString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleLoadHistoryAssessment(mood)}
                        style={{
                          background: 'rgba(99, 102, 241, 0.1)',
                          border: '1px solid rgba(99, 102, 241, 0.25)',
                          color: '#a5b4fc',
                          padding: '6px 14px',
                          borderRadius: '20px',
                          fontSize: '0.825rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'var(--transition-smooth)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(99, 102, 241, 0.25)';
                          e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
                          e.currentTarget.style.color = '#a5b4fc';
                        }}
                      >
                        Play Mix
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 1. QUIZ QUESTIONS WIZARD */}
      {step >= 1 && step <= 5 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Header & Back Button */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={handleBack}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 500,
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
            >
              <ArrowLeft size={16} />
              Back
            </button>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Question {step} of 5
            </span>
          </div>

          {/* Progress Bar */}
          <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{
              width: `${step * 20}%`,
              height: '100%',
              background: 'linear-gradient(to right, #6366f1, #a855f7)',
              borderRadius: '3px',
              transition: 'width 0.4s ease-out',
            }} />
          </div>

          {/* Question Box */}
          <div className="glass-panel" style={{ padding: '40px', borderRadius: '24px' }}>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 700, marginBottom: '30px', color: 'white', lineHeight: '1.4' }}>
              {QUESTIONS[step - 1].question}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {QUESTIONS[step - 1].options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  className="glass-card"
                  style={{
                    padding: '18px 24px',
                    textAlign: 'left',
                    width: '100%',
                    border: '1px solid var(--border-glass)',
                    background: 'rgba(255,255,255,0.02)',
                    color: 'white',
                    fontSize: '1rem',
                    fontWeight: 500,
                    borderRadius: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(99, 102, 241, 0.08)';
                    e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                    e.currentTarget.style.borderColor = 'var(--border-glass)';
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  {option.text}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. ASSESSMENT RESULTS VIEW */}
      {step === 6 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {loading ? (
            <div className="glass-panel" style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '80px 0',
              borderRadius: '24px',
              color: 'var(--text-secondary)',
            }}>
              <RefreshCw size={44} className="spin-slow" style={{ color: '#818cf8', marginBottom: '20px' }} />
              <h3 style={{ color: 'white', marginBottom: '6px' }}>Projecting Future Energies</h3>
              <p style={{ fontSize: '0.9rem' }}>Analyzing alignment metrics & configuring soundtrack...</p>
            </div>
          ) : error ? (
            <div className="glass-panel" style={{ padding: '40px', borderRadius: '24px', textAlign: 'center' }}>
              <AlertCircle size={40} style={{ color: '#ef4444', marginBottom: '16px' }} />
              <h3 style={{ color: 'white', marginBottom: '10px' }}>Projection Failure</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>{error}</p>
              <button onClick={handleStart} className="glow-button">Try Again</button>
            </div>
          ) : activeMoodData ? (
            <>
              {/* Dynamic Mood Card Banner */}
              <div className="glass-panel" style={{
                borderRadius: '24px',
                padding: '40px',
                border: '1px solid rgba(255,255,255,0.06)',
                boxShadow: `0 20px 40px rgba(0,0,0,0.3), 0 0 60px ${activeMoodData.accent}15`,
                position: 'relative',
                overflow: 'hidden',
              }}>
                {/* Background aura */}
                <div style={{
                  position: 'absolute',
                  top: '-10%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '350px',
                  height: '350px',
                  background: activeMoodData.color,
                  filter: 'blur(100px)',
                  opacity: 0.15,
                  pointerEvents: 'none'
                }} />

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  position: 'relative',
                  zIndex: 2,
                }}>
                  <span style={{
                    fontSize: '3.5rem',
                    background: activeMoodData.color,
                    padding: '16px',
                    borderRadius: '20px',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '20px',
                  }}>
                    {activeMoodData.emoji}
                  </span>
                  
                  <span style={{
                    fontSize: '0.85rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                    color: '#a5b4fc',
                    fontWeight: 700,
                    marginBottom: '6px',
                  }}>
                    Vibe Projection Complete
                  </span>

                  <h1 style={{
                    fontSize: '2.5rem',
                    fontWeight: 800,
                    marginBottom: '15px',
                    color: 'white',
                  }}>
                    Future Mood: {activeMoodData.name}
                  </h1>

                  <p style={{
                    fontSize: '1.05rem',
                    color: 'var(--text-primary)',
                    fontStyle: 'italic',
                    maxWidth: '550px',
                    lineHeight: '1.6',
                    marginBottom: '30px',
                  }}>
                    "{activeMoodData.quote}"
                  </p>

                  <div style={{ display: 'flex', gap: '16px' }}>
                    <button
                      onClick={handlePlayFullQueue}
                      disabled={songs.length === 0}
                      className="glow-button"
                      style={{
                        borderRadius: '30px',
                        padding: '12px 32px',
                        background: activeMoodData.color,
                        boxShadow: `0 8px 25px ${activeMoodData.accent}40`,
                      }}
                    >
                      <Music size={18} />
                      Play Future Mix
                    </button>
                    <button
                      onClick={() => setStep(0)}
                      className="glass-card"
                      style={{
                        borderRadius: '30px',
                        padding: '12px 28px',
                        border: '1px solid var(--border-glass)',
                        color: 'white',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Dashboard
                    </button>
                  </div>
                </div>
              </div>

              {/* Curated Playlist Section */}
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
                  <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Music size={18} style={{ color: activeMoodData.accent }} />
                    Curated Projected Tracklist
                  </h3>
                  
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
                            background: languageFilter === tab.id ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                            border: languageFilter === tab.id ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                            color: languageFilter === tab.id ? '#a5b4fc' : 'var(--text-secondary)',
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

                {songs.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
                    <RefreshCw size={24} className="spin-slow" style={{ marginBottom: '10px' }} />
                    <p>Fetching tracks...</p>
                  </div>
                ) : (() => {
                  const displaySongs = getFilteredSongs(songs);

                  if (displaySongs.length === 0) {
                    return (
                      <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
                        <p style={{ color: 'white', marginBottom: '8px' }}>No songs found in this language</p>
                        <p style={{ fontSize: '0.85rem' }}>Try switching back to 'All Languages' or another option.</p>
                      </div>
                    );
                  }

                  return (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                      {displaySongs.map((song) => (
                        <SongCard
                          key={song.spotifyId || song.title}
                          song={song}
                          currentTrack={currentTrack}
                          isPlaying={isPlaying}
                          onPlayClick={(track) => playTrack(track, displaySongs)}
                          isSaved={isSongSaved(song)}
                          onSaveToggle={handleSaveToggle}
                        />
                      ))}
                    </div>
                  );
                })()}
              </div>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default FutureAssessment;
