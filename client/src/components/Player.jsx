import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Shuffle, RotateCcw, Tv, ChevronLeft } from 'lucide-react';
import api from '../services/api';

const Player = ({
  currentTrack,
  isPlaying,
  onPlayPauseToggle,
  onNext,
  onPrev,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isNowPlayingPage = location.pathname === '/now-playing';

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);

  const [activePlayer, setActivePlayer] = useState('audio'); // 'audio' or 'youtube'
  const [loadingTrack, setLoadingTrack] = useState(false);
  const [ytReady, setYtReady] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  const audioRef = useRef(null);
  const youtubePlayerRef = useRef(null);
  const isYtPlayerReadyRef = useRef(false);
  
  const onNextRef = useRef(onNext);
  const isRepeatRef = useRef(isRepeat);

  // Custom logger to write to browser console
  const addLog = (msg) => {
    console.log(`[PLAYER DEBUG] ${msg}`);
  };

  const addErrorLog = (msg, err = '') => {
    const errMsg = err ? ` | Error: ${err.message || err}` : '';
    console.error(`[PLAYER DEBUG ERROR] ${msg}${errMsg}`, err);
  };

  // Redirect to home if on player page but no song is playing
  useEffect(() => {
    if (isNowPlayingPage && !currentTrack) {
      navigate('/');
    }
  }, [isNowPlayingPage, currentTrack, navigate]);

  // Sync callbacks to prevent stale closures
  useEffect(() => {
    onNextRef.current = onNext;
  }, [onNext]);

  useEffect(() => {
    isRepeatRef.current = isRepeat;
  }, [isRepeat]);

  // Load YouTube SDK and poll for its availability
  useEffect(() => {
    const checkYT = () => {
      if (window.YT && window.YT.Player) {
        addLog('YouTube Player API is fully loaded on window object.');
        setYtReady(true);
        return true;
      }
      return false;
    };

    if (checkYT()) return;

    // Load SDK if tag doesn't exist
    if (!document.getElementById('youtube-iframe-api-script')) {
      addLog('Appending YouTube API script tag to body...');
      const tag = document.createElement('script');
      tag.id = 'youtube-iframe-api-script';
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);
    } else {
      addLog('YouTube API script tag already exists in DOM.');
    }

    // Set callback
    const prevCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (prevCallback) prevCallback();
      addLog('YouTube onYouTubeIframeAPIReady callback fired.');
      setYtReady(true);
    };

    // Polling fallback to guarantee detection even if callback is missed
    const interval = setInterval(() => {
      if (checkYT()) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Initialize YouTube player with DOM element polling
  useEffect(() => {
    if (!ytReady) return;

    let attempts = 0;
    const initPlayer = () => {
      const targetElement = document.getElementById('youtube-hidden-player');
      
      // If player is already initialized and the iframe is present in DOM, do nothing
      if (youtubePlayerRef.current && targetElement && targetElement.tagName === 'IFRAME') {
        return;
      }

      if (targetElement) {
        addLog('Target iframe container found. Checking for player initialization...');
        
        // Clean up previous instance if it was destroyed or mismatches
        if (youtubePlayerRef.current) {
          try {
            addLog('Destroying mismatched or reset YT Player instance...');
            if (typeof youtubePlayerRef.current.destroy === 'function') {
              youtubePlayerRef.current.destroy();
            }
          } catch (e) {
            addErrorLog('Failed to destroy old YT Player', e);
          }
          youtubePlayerRef.current = null;
        }

        isYtPlayerReadyRef.current = false;

        try {
          addLog('Initializing new YT.Player constructor...');
          youtubePlayerRef.current = new window.YT.Player('youtube-hidden-player', {
            height: '100%',
            width: '100%',
            videoId: '',
            playerVars: {
              autoplay: 0,
              controls: 0, // hide player controls
              disablekb: 1,
              fs: 0,
              rel: 0,
              showinfo: 0,
              modestbranding: 1,
              origin: window.location.origin,
            },
            events: {
              onReady: () => {
                addLog('YouTube Player object successfully ready.');
                isYtPlayerReadyRef.current = true;
              },
              onStateChange: (event) => {
                // YT.PlayerState.ENDED is 0
                if (event.data === 0) {
                  addLog('YouTube song ended.');
                  if (isRepeatRef.current) {
                    addLog('Looping active song (Repeat Enabled).');
                    if (youtubePlayerRef.current && typeof youtubePlayerRef.current.seekTo === 'function') {
                      youtubePlayerRef.current.seekTo(0, true);
                      youtubePlayerRef.current.playVideo();
                    }
                  } else {
                    onNextRef.current();
                  }
                }
              },
              onError: (event) => {
                addErrorLog('YouTube player encountered runtime error, code: ' + event.data);
                fallbackToAudio();
              },
            },
          });
        } catch (err) {
          addErrorLog('YT.Player constructor crashed', err);
        }
      } else {
        attempts++;
        addLog(`Target container not found in DOM, retrying (attempt ${attempts}/30)...`);
        if (attempts < 30) {
          setTimeout(initPlayer, 100);
        } else {
          addErrorLog('Failed to find youtube-hidden-player in DOM after 3 seconds.');
        }
      }
    };

    initPlayer();
  }, [ytReady, location.pathname, currentTrack]);

  // Fallback to standard 30s audio element
  const fallbackToAudio = () => {
    addLog(`Playing 30s preview fallback: ${currentTrack?.previewUrl}`);
    setActivePlayer('audio');
    
    const audio = audioRef.current;
    if (audio && currentTrack?.previewUrl) {
      audio.src = currentTrack.previewUrl;
      audio.load();
      audio.volume = isMuted ? 0 : volume;
      if (isPlaying) {
        audio.play().catch((e) => addErrorLog('Audio play failed', e));
      } else {
        audio.pause();
      }
    }
    setLoadingTrack(false);
  };

  // Helper to wait until the YouTube Player is ready and load the video
  const playYtVideo = (videoId) => {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const checkReady = () => {
        const player = youtubePlayerRef.current;
        // Verify player exists, ready callback has fired, and method exists
        if (player && isYtPlayerReadyRef.current && typeof player.loadVideoById === 'function') {
          try {
            addLog(`YouTube Player API ready. Loading video ID: ${videoId}`);
            player.loadVideoById(videoId, 0);
            resolve(true);
          } catch (err) {
            addErrorLog('loadVideoById failed', err);
            reject(err);
          }
        } else {
          attempts++;
          addLog(`Waiting for YT Player ready state (attempt ${attempts}/60)...`);
          if (attempts >= 60) {
            reject(new Error('YouTube player initialization timed out (6s)'));
          } else {
            setTimeout(checkReady, 100);
          }
        }
      };
      checkReady();
    });
  };

  // Load and play tracks
  useEffect(() => {
    if (!currentTrack) return;

    const loadAndPlayTrack = async () => {
      setLoadingTrack(true);
      setCurrentTime(0);
      setDuration(0);

      // Explicitly set video display based on how the song was triggered
      if (currentTrack.playVideo) {
        setShowVideo(true);
      } else {
        setShowVideo(false);
      }

      addLog(`Loading track: "${currentTrack.title}" by ${currentTrack.artist}`);

      // Stop any active playbacks
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (youtubePlayerRef.current && typeof youtubePlayerRef.current.stopVideo === 'function') {
        try {
          youtubePlayerRef.current.stopVideo();
        } catch (e) {
          addErrorLog('stopVideo failed', e);
        }
      }

      // 1. Fetch YouTube ID for the full song
      try {
        addLog(`Requesting backend for YouTube ID of "${currentTrack.title}"...`);
        const response = await api.get('/music/youtube-id', {
          params: {
            title: currentTrack.title,
            artist: currentTrack.artist,
          },
        });

        const videoId = response.data.videoId;
        if (videoId) {
          addLog(`Resolved video ID: ${videoId}. Connecting player...`);
          
          // Wait for YT player to be ready and play the video
          try {
            await playYtVideo(videoId);
            
            // Apply initial audio settings
            youtubePlayerRef.current.setVolume(isMuted ? 0 : volume * 100);
            if (isMuted) {
              youtubePlayerRef.current.mute();
            } else {
              youtubePlayerRef.current.unMute();
            }

            setActivePlayer('youtube');
            addLog('Successfully activated YouTube player.');
            
            if (isPlaying) {
              youtubePlayerRef.current.playVideo();
            } else {
              youtubePlayerRef.current.pauseVideo();
            }

            setLoadingTrack(false);
            return;
          } catch (playErr) {
            addErrorLog('playYtVideo setup failed', playErr);
          }
        } else {
          addLog('Backend returned empty video ID.');
        }
      } catch (err) {
        addErrorLog('Failed to fetch YouTube ID from backend API', err);
      }

      // 2. Play 30s preview fallback
      fallbackToAudio();
    };

    loadAndPlayTrack();
  }, [currentTrack]);

  // Sync play/pause state
  useEffect(() => {
    if (loadingTrack) return;

    if (activePlayer === 'youtube') {
      if (youtubePlayerRef.current && typeof youtubePlayerRef.current.playVideo === 'function') {
        try {
          if (isPlaying) {
            youtubePlayerRef.current.playVideo();
          } else {
            youtubePlayerRef.current.pauseVideo();
          }
        } catch (e) {
          addErrorLog('YouTube play/pause trigger failed', e);
        }
      }
    } else {
      const audio = audioRef.current;
      if (audio) {
        if (isPlaying) {
          audio.play().catch((e) => addErrorLog('Audio play toggle failed', e));
        } else {
          audio.pause();
        }
      }
    }
  }, [isPlaying, activePlayer, loadingTrack]);

  // Sync volume & mute state
  useEffect(() => {
    // Sync HTML5 audio
    const audio = audioRef.current;
    if (audio) {
      audio.volume = isMuted ? 0 : volume;
      audio.muted = isMuted;
    }

    // Sync YouTube player
    if (youtubePlayerRef.current && typeof youtubePlayerRef.current.setVolume === 'function') {
      try {
        if (isMuted) {
          youtubePlayerRef.current.mute();
          youtubePlayerRef.current.setVolume(0);
        } else {
          youtubePlayerRef.current.unMute();
          youtubePlayerRef.current.setVolume(volume * 100);
        }
      } catch (e) {
        // Fail silently
      }
    }
  }, [volume, isMuted]);

  // Sync HTML5 Audio progress & duration event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      if (activePlayer === 'audio') {
        setCurrentTime(audio.currentTime);
      }
    };

    const handleLoadedMetadata = () => {
      if (activePlayer === 'audio') {
        setDuration(audio.duration || 0);
      }
    };

    const handleAudioEnded = () => {
      if (activePlayer === 'audio') {
        if (isRepeat) {
          audio.currentTime = 0;
          audio.play().catch((err) => addErrorLog('Audio replay failed', err));
        } else {
          onNext();
        }
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleAudioEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleAudioEnded);
    };
  }, [activePlayer, isRepeat, onNext]);

  // Sync YouTube progress & duration polling interval
  useEffect(() => {
    let interval;
    if (isPlaying && activePlayer === 'youtube' && !loadingTrack) {
      interval = setInterval(() => {
        if (youtubePlayerRef.current && typeof youtubePlayerRef.current.getCurrentTime === 'function') {
          try {
            setCurrentTime(youtubePlayerRef.current.getCurrentTime() || 0);
            setDuration(youtubePlayerRef.current.getDuration() || 0);
          } catch (e) {
            // Ignore if player is not ready
          }
        }
      }, 250);
    }
    return () => clearInterval(interval);
  }, [isPlaying, activePlayer, loadingTrack]);

  // Format seconds to MM:SS
  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSeek = (e) => {
    const seekValue = parseFloat(e.target.value);
    setCurrentTime(seekValue);
    if (activePlayer === 'youtube') {
      if (youtubePlayerRef.current && typeof youtubePlayerRef.current.seekTo === 'function') {
        youtubePlayerRef.current.seekTo(seekValue, true);
      }
    } else {
      if (audioRef.current) {
        audioRef.current.currentTime = seekValue;
      }
    }
  };

  const handleVolumeChange = (e) => {
    const volValue = parseFloat(e.target.value);
    setVolume(volValue);
    if (volValue > 0) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <>
      {/* Sticky Bottom Mini Player (hidden on Now Playing page) */}
      <div
        className="glass-panel"
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          right: '20px',
          padding: '16px 32px',
          borderRadius: '20px',
          display: (currentTrack && !isNowPlayingPage) ? 'flex' : 'none',
          flexDirection: 'column',
          gap: '10px',
          zIndex: 1001,
          boxShadow: '0 -10px 40px rgba(0,0,0,0.5)',
        }}
      >
        {currentTrack && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}>
            {/* Track details (Artwork, title, artist) - Clickable to open full screen */}
            <div 
              onClick={() => navigate('/now-playing')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                width: '30%',
                minWidth: '200px',
                cursor: 'pointer',
              }}
              title="Expand Player"
            >
              <div style={{
                position: 'relative',
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                overflow: 'hidden',
                boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                border: '2px solid rgba(255, 255, 255, 0.1)',
                flexShrink: 0,
              }}
              className={`spin-slow ${isPlaying ? '' : 'spin-paused'}`}
              >
                <img
                  src={currentTrack.imageUrl || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200'}
                  alt={currentTrack.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </div>
              <div style={{ minWidth: 0 }}>
                <h4 style={{
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  color: 'white',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  marginBottom: '2px',
                }}>
                  {currentTrack.title}
                </h4>
                <p style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {currentTrack.artist}
                  </span>
                  <span style={{
                    fontSize: '0.65rem',
                    padding: '1px 5px',
                    borderRadius: '6px',
                    background: activePlayer === 'youtube' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                    color: activePlayer === 'youtube' ? '#4ade80' : '#facc15',
                    border: activePlayer === 'youtube' ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(234, 179, 8, 0.3)',
                    fontWeight: 600,
                    flexShrink: 0,
                  }}>
                    {activePlayer === 'youtube' ? 'Full Song' : 'Preview'}
                  </span>
                </p>
              </div>
            </div>

            {/* Music Controls */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              width: '40%',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
              }}>
                {/* Shuffle */}
                <button
                  onClick={() => setIsShuffle(!isShuffle)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: isShuffle ? '#818cf8' : 'var(--text-muted)',
                    cursor: 'pointer',
                    transition: 'var(--transition-smooth)',
                  }}
                  title="Shuffle"
                >
                  <Shuffle size={18} />
                </button>

                {/* Previous */}
                <button
                  onClick={onPrev}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    transition: 'var(--transition-smooth)',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#818cf8'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'white'}
                  title="Previous Song"
                >
                  <SkipBack size={20} fill="currentColor" />
                </button>

                {/* Play/Pause */}
                <button
                  onClick={onPlayPauseToggle}
                  disabled={loadingTrack}
                  style={{
                    background: 'white',
                    border: 'none',
                    color: 'black',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: loadingTrack ? 'not-allowed' : 'pointer',
                    opacity: loadingTrack ? 0.6 : 1,
                    transition: 'var(--transition-smooth)',
                    boxShadow: '0 0 15px rgba(255,255,255,0.3)',
                  }}
                  onMouseEnter={(e) => {
                    if (!loadingTrack) {
                      e.currentTarget.style.transform = 'scale(1.08)';
                      e.currentTarget.style.boxShadow = '0 0 20px rgba(255,255,255,0.5)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loadingTrack) {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = '0 0 15px rgba(255,255,255,0.3)';
                    }
                  }}
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <Pause size={18} fill="currentColor" />
                  ) : (
                    <Play size={18} fill="currentColor" style={{ marginLeft: '3px' }} />
                  )}
                </button>

                {/* Next */}
                <button
                  onClick={onNext}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    transition: 'var(--transition-smooth)',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#818cf8'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'white'}
                  title="Next Song"
                >
                  <SkipForward size={20} fill="currentColor" />
                </button>

                {/* Repeat */}
                <button
                  onClick={() => setIsRepeat(!isRepeat)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: isRepeat ? '#818cf8' : 'var(--text-muted)',
                    cursor: 'pointer',
                    transition: 'var(--transition-smooth)',
                  }}
                  title="Repeat"
                >
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>

            {/* Volume controls */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '10px',
              width: '30%',
              minWidth: '180px',
            }}>
              {activePlayer === 'youtube' && (
                <button
                  onClick={() => setShowVideo(!showVideo)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: showVideo ? '#818cf8' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'var(--transition-smooth)',
                    marginRight: '8px',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = showVideo ? '#818cf8' : 'white'}
                  onMouseLeave={(e) => e.currentTarget.style.color = showVideo ? '#818cf8' : 'var(--text-secondary)'}
                  title={showVideo ? "Hide Video" : "Show Video"}
                >
                  <Tv size={18} />
                </button>
              )}
              <button
                onClick={toggleMute}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'var(--transition-smooth)',
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
              >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                style={{
                  width: '90px',
                  height: '4px',
                  borderRadius: '2px',
                  background: 'rgba(255,255,255,0.1)',
                  outline: 'none',
                  cursor: 'pointer',
                  accentColor: '#818cf8',
                }}
              />
            </div>
          </div>
        )}

        {/* Progress Seeker Bar */}
        {currentTrack && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            width: '100%',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
          }}>
            <span>{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              disabled={loadingTrack}
              style={{
                flexGrow: 1,
                height: '4px',
                borderRadius: '2px',
                background: `linear-gradient(to right, #818cf8 ${(currentTime / (duration || 100)) * 100}%, rgba(255,255,255,0.1) ${(currentTime / (duration || 100)) * 100}%)`,
                outline: 'none',
                cursor: loadingTrack ? 'not-allowed' : 'pointer',
                WebkitAppearance: 'none',
                accentColor: '#818cf8',
              }}
            />
            <span>{formatTime(duration)}</span>
          </div>
        )}
      </div>

      {/* Full Screen Player Page */}
      {isNowPlayingPage && currentTrack && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at center, #1e1b4b 0%, #090d16 100%)',
          zIndex: 1100,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          color: 'white',
          overflowY: 'auto',
        }}>
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            style={{
              position: 'absolute',
              top: '30px',
              left: '30px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              color: 'white',
              padding: '10px 20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.9rem',
              fontWeight: 600,
              transition: 'all 0.2s',
              zIndex: 1010,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.transform = 'translateX(-3px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.transform = 'translateX(0)';
            }}
          >
            <ChevronLeft size={20} /> Back
          </button>

          {/* Player Card Wrapper */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            maxWidth: '600px',
            width: '100%',
            padding: '40px',
            borderRadius: '24px',
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
            marginTop: '40px',
          }}>
            {/* Visualizer / Video Placeholder */}
            {showVideo && activePlayer === 'youtube' ? (
              <div style={{
                width: '100%',
                aspectRatio: '16/9',
                maxHeight: '40vh',
                marginBottom: '28px',
                borderRadius: '16px',
                background: 'transparent',
              }} />
            ) : (
              <div 
                style={{
                  position: 'relative',
                  width: '240px',
                  height: '240px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  boxShadow: '0 15px 40px rgba(0, 0, 0, 0.5)',
                  border: '4px solid rgba(255, 255, 255, 0.1)',
                  marginBottom: '28px',
                  background: 'rgba(255, 255, 255, 0.02)',
                }}
                className={`spin-slow ${isPlaying ? '' : 'spin-paused'}`}
              >
                <img
                  src={currentTrack.imageUrl || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400'}
                  alt={currentTrack.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </div>
            )}

            {/* Song Metadata */}
            <div style={{ textAlign: 'center', marginBottom: '24px', width: '100%' }}>
              <h2 style={{
                fontSize: '1.8rem',
                fontWeight: 800,
                marginBottom: '8px',
                fontFamily: 'var(--font-display)',
                background: 'linear-gradient(to right, #ffffff, #c7d2fe)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1.2,
              }}>
                {currentTrack.title}
              </h2>
              <p style={{
                fontSize: '1.05rem',
                color: 'var(--text-secondary)',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
              }}>
                <span>{currentTrack.artist}</span>
                <span style={{
                  fontSize: '0.7rem',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  background: activePlayer === 'youtube' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                  color: activePlayer === 'youtube' ? '#4ade80' : '#facc15',
                  border: activePlayer === 'youtube' ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(234, 179, 8, 0.3)',
                  fontWeight: 600,
                }}>
                  {activePlayer === 'youtube' ? 'Full Song' : 'Preview'}
                </span>
              </p>
            </div>

            {/* Progress Seeker Bar */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              gap: '8px',
              marginBottom: '24px',
            }}>
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                disabled={loadingTrack}
                style={{
                  width: '100%',
                  height: '6px',
                  borderRadius: '3px',
                  background: `linear-gradient(to right, #818cf8 ${(currentTime / (duration || 100)) * 100}%, rgba(255,255,255,0.1) ${(currentTime / (duration || 100)) * 100}%)`,
                  outline: 'none',
                  cursor: loadingTrack ? 'not-allowed' : 'pointer',
                  WebkitAppearance: 'none',
                  accentColor: '#818cf8',
                }}
              />
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
              }}>
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '24px',
              width: '100%',
              marginBottom: '32px',
            }}>
              {/* Shuffle */}
              <button
                onClick={() => setIsShuffle(!isShuffle)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: isShuffle ? '#818cf8' : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'var(--transition-smooth)',
                }}
                title="Shuffle"
              >
                <Shuffle size={20} />
              </button>

              {/* Previous */}
              <button
                onClick={onPrev}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'var(--transition-smooth)',
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#818cf8'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'white'}
                title="Previous Song"
              >
                <SkipBack size={24} fill="currentColor" />
              </button>

              {/* Play/Pause (Large Circular Gradient Button) */}
              <button
                onClick={onPlayPauseToggle}
                disabled={loadingTrack}
                style={{
                  background: 'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)',
                  border: 'none',
                  color: 'white',
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: loadingTrack ? 'not-allowed' : 'pointer',
                  opacity: loadingTrack ? 0.6 : 1,
                  transition: 'var(--transition-smooth)',
                  boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)',
                }}
                onMouseEnter={(e) => {
                  if (!loadingTrack) {
                    e.currentTarget.style.transform = 'scale(1.08)';
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(99, 102, 241, 0.6)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loadingTrack) {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(99, 102, 241, 0.4)';
                  }
                }}
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause size={28} fill="currentColor" />
                ) : (
                  <Play size={28} fill="currentColor" style={{ marginLeft: '4px' }} />
                )}
              </button>

              {/* Next */}
              <button
                onClick={onNext}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'var(--transition-smooth)',
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#818cf8'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'white'}
                title="Next Song"
              >
                <SkipForward size={24} fill="currentColor" />
              </button>

              {/* Repeat */}
              <button
                onClick={() => setIsRepeat(!isRepeat)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: isRepeat ? '#818cf8' : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'var(--transition-smooth)',
                }}
                title="Repeat"
              >
                <RotateCcw size={18} />
              </button>
            </div>

            {/* Volume & Additional controls */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              width: '100%',
              maxWidth: '300px',
            }}>
              {activePlayer === 'youtube' && (
                <button
                  onClick={() => setShowVideo(!showVideo)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: showVideo ? '#818cf8' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'var(--transition-smooth)',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = showVideo ? '#818cf8' : 'white'}
                  onMouseLeave={(e) => e.currentTarget.style.color = showVideo ? '#818cf8' : 'var(--text-secondary)'}
                  title={showVideo ? "Hide Video" : "Show Video"}
                >
                  <Tv size={20} />
                </button>
              )}
              <button
                onClick={toggleMute}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'var(--transition-smooth)',
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                style={{
                  flexGrow: 1,
                  height: '4px',
                  borderRadius: '2px',
                  background: 'rgba(255,255,255,0.1)',
                  outline: 'none',
                  cursor: 'pointer',
                  accentColor: '#818cf8',
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Custom Styles for Seek Bar slider thumb */}
      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: appearance;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          transition: transform 0.1s;
        }
        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.3);
        }
      `}</style>

      {/* Hidden Audio Player - ALWAYS mounted to allow consistent background initialization */}
      <audio ref={audioRef} preload="auto" />

      {/* Mini Floating / Centered Video Card (ALWAYS mounted, visibility toggled by state) */}
      <div 
        style={
          isNowPlayingPage 
            ? {
                position: 'fixed',
                top: '120px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '480px',
                height: '270px',
                maxWidth: '90vw',
                maxHeight: '40vh',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
                border: '2px solid rgba(255,255,255,0.15)',
                background: 'black',
                zIndex: 1110,
                pointerEvents: showVideo && activePlayer === 'youtube' ? 'auto' : 'none',
                opacity: (currentTrack && activePlayer === 'youtube' && showVideo) ? 1 : 0.001,
                transition: 'all 0.3s ease',
              }
            : {
                position: 'fixed',
                right: '40px',
                bottom: '150px',
                width: '240px',
                height: '135px',
                borderRadius: showVideo ? '12px' : '0px',
                overflow: 'hidden',
                boxShadow: showVideo ? '0 12px 30px rgba(0,0,0,0.5)' : 'none',
                border: showVideo ? '2px solid rgba(255, 255, 255, 0.1)' : 'none',
                background: 'black',
                zIndex: 1000,
                pointerEvents: showVideo ? 'auto' : 'none',
                opacity: (currentTrack && activePlayer === 'youtube') ? (showVideo ? 1 : 0.001) : 0,
                transition: 'all 0.3s ease',
              }
        }
      >
        <div id="youtube-hidden-player" style={{ width: '100%', height: '100%' }}></div>
      </div>
    </>
  );
};

export default Player;
