import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Play, Pause, SkipForward, SkipBack, Volume2, VolumeX,
  Shuffle, Repeat, Repeat1, Tv, ListMusic, Mic, Heart, Maximize2
} from 'lucide-react';
import api from '../services/api';
import QueueDrawer from './QueueDrawer';
import LyricsDrawer from './LyricsDrawer';

const Player = ({
  currentTrack,
  isPlaying,
  onPlayPauseToggle,
  onNext,
  onPrev,
  queue = [],
  queueIndex = -1,
  onPlayTrack,
  onRemoveFromQueue,
  onClearQueue,
  savedTracks = [],
  onSaveToggle,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isNowPlayingPage = location.pathname === '/now-playing';

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off'); // 'off', 'all', 'one'

  const [activePlayer, setActivePlayer] = useState('audio'); // 'audio' or 'youtube'
  const [loadingTrack, setLoadingTrack] = useState(false);
  const [ytReady, setYtReady] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  // Drawers
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isLyricsOpen, setIsLyricsOpen] = useState(false);

  const audioRef = useRef(null);
  const youtubePlayerRef = useRef(null);
  const isYtPlayerReadyRef = useRef(false);

  const onNextRef = useRef(onNext);
  const repeatModeRef = useRef(repeatMode);

  // Sync callbacks
  useEffect(() => {
    onNextRef.current = onNext;
  }, [onNext]);

  useEffect(() => {
    repeatModeRef.current = repeatMode;
  }, [repeatMode]);

  // Check if current track is saved in user's library
  const isSaved = currentTrack && savedTracks.some(
    (t) =>
      (currentTrack.spotifyId && t.spotifyId === currentTrack.spotifyId) ||
      (!currentTrack.spotifyId && t.title?.toLowerCase() === currentTrack.title?.toLowerCase() && t.artist?.toLowerCase() === currentTrack.artist?.toLowerCase())
  );

  // Initialize YouTube API
  useEffect(() => {
    const checkYT = () => {
      if (window.YT && window.YT.Player) {
        setYtReady(true);
        return true;
      }
      return false;
    };

    if (checkYT()) return;

    if (!document.getElementById('youtube-iframe-api-script')) {
      const tag = document.createElement('script');
      tag.id = 'youtube-iframe-api-script';
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);
    }

    const prevCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (prevCallback) prevCallback();
      setYtReady(true);
    };

    const interval = setInterval(() => {
      if (checkYT()) clearInterval(interval);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Initialize YT Player Constructor
  useEffect(() => {
    if (!ytReady) return;

    let attempts = 0;
    const initPlayer = () => {
      const targetElement = document.getElementById('youtube-hidden-player');
      if (youtubePlayerRef.current && targetElement && targetElement.tagName === 'IFRAME') {
        return;
      }

      if (targetElement) {
        if (youtubePlayerRef.current) {
          try {
            if (typeof youtubePlayerRef.current.destroy === 'function') {
              youtubePlayerRef.current.destroy();
            }
          } catch (e) {}
          youtubePlayerRef.current = null;
        }

        isYtPlayerReadyRef.current = false;

        try {
          youtubePlayerRef.current = new window.YT.Player('youtube-hidden-player', {
            height: '100%',
            width: '100%',
            videoId: '',
            playerVars: {
              autoplay: 0,
              controls: 0,
              disablekb: 1,
              fs: 0,
              rel: 0,
              showinfo: 0,
              modestbranding: 1,
              origin: window.location.origin,
            },
            events: {
              onReady: () => {
                isYtPlayerReadyRef.current = true;
              },
              onStateChange: (event) => {
                // Ended
                if (event.data === 0) {
                  if (repeatModeRef.current === 'one') {
                    if (youtubePlayerRef.current && typeof youtubePlayerRef.current.seekTo === 'function') {
                      youtubePlayerRef.current.seekTo(0, true);
                      youtubePlayerRef.current.playVideo();
                    }
                  } else {
                    onNextRef.current();
                  }
                }
              },
              onError: () => {
                fallbackToAudio();
              },
            },
          });
        } catch (err) {
          console.error('YT Player Constructor failed:', err);
        }
      } else {
        attempts++;
        if (attempts < 30) setTimeout(initPlayer, 100);
      }
    };

    initPlayer();
  }, [ytReady, location.pathname, currentTrack]);

  const fallbackToAudio = () => {
    setActivePlayer('audio');
    const audio = audioRef.current;
    if (audio && currentTrack?.previewUrl) {
      audio.src = currentTrack.previewUrl;
      audio.load();
      audio.volume = isMuted ? 0 : volume;
      if (isPlaying) {
        audio.play().catch(() => {});
      } else {
        audio.pause();
      }
    }
    setLoadingTrack(false);
  };

  const playYtVideo = (videoId) => {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const checkReady = () => {
        const player = youtubePlayerRef.current;
        if (player && isYtPlayerReadyRef.current && typeof player.loadVideoById === 'function') {
          try {
            player.loadVideoById(videoId, 0);
            resolve(true);
          } catch (err) {
            reject(err);
          }
        } else {
          attempts++;
          if (attempts >= 60) {
            reject(new Error('YT ready timeout'));
          } else {
            setTimeout(checkReady, 100);
          }
        }
      };
      checkReady();
    });
  };

  // Load and play track
  useEffect(() => {
    if (!currentTrack) return;

    const loadAndPlayTrack = async () => {
      setLoadingTrack(true);
      setCurrentTime(0);
      setDuration(0);

      setShowVideo(!!currentTrack.playVideo);

      if (audioRef.current) audioRef.current.pause();
      if (youtubePlayerRef.current && typeof youtubePlayerRef.current.stopVideo === 'function') {
        try {
          youtubePlayerRef.current.stopVideo();
        } catch (e) {}
      }

      try {
        const response = await api.get('/music/youtube-id', {
          params: {
            title: currentTrack.title,
            artist: currentTrack.artist,
          },
        });

        const videoId = response.data.videoId;
        if (videoId) {
          try {
            await playYtVideo(videoId);
            youtubePlayerRef.current.setVolume(isMuted ? 0 : volume * 100);
            if (isMuted) youtubePlayerRef.current.mute();
            else youtubePlayerRef.current.unMute();

            setActivePlayer('youtube');
            if (isPlaying) youtubePlayerRef.current.playVideo();
            else youtubePlayerRef.current.pauseVideo();

            setLoadingTrack(false);
            return;
          } catch (e) {}
        }
      } catch (err) {}

      fallbackToAudio();
    };

    loadAndPlayTrack();
  }, [currentTrack]);

  // Sync play/pause
  useEffect(() => {
    if (loadingTrack) return;
    if (activePlayer === 'youtube') {
      if (youtubePlayerRef.current && typeof youtubePlayerRef.current.playVideo === 'function') {
        try {
          if (isPlaying) youtubePlayerRef.current.playVideo();
          else youtubePlayerRef.current.pauseVideo();
        } catch (e) {}
      }
    } else {
      const audio = audioRef.current;
      if (audio) {
        if (isPlaying) audio.play().catch(() => {});
        else audio.pause();
      }
    }
  }, [isPlaying, activePlayer, loadingTrack]);

  // Sync volume
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = isMuted ? 0 : volume;
      audio.muted = isMuted;
    }
    if (youtubePlayerRef.current && typeof youtubePlayerRef.current.setVolume === 'function') {
      try {
        if (isMuted) {
          youtubePlayerRef.current.mute();
          youtubePlayerRef.current.setVolume(0);
        } else {
          youtubePlayerRef.current.unMute();
          youtubePlayerRef.current.setVolume(volume * 100);
        }
      } catch (e) {}
    }
  }, [volume, isMuted]);

  // Sync progress & duration for HTML5 Audio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      if (activePlayer === 'audio') setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      if (activePlayer === 'audio') setDuration(audio.duration || 0);
    };

    const handleAudioEnded = () => {
      if (activePlayer === 'audio') {
        if (repeatMode === 'one') {
          audio.currentTime = 0;
          audio.play().catch(() => {});
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
  }, [activePlayer, repeatMode, onNext]);

  // Sync YT progress polling
  useEffect(() => {
    let interval;
    if (isPlaying && activePlayer === 'youtube' && !loadingTrack) {
      interval = setInterval(() => {
        if (youtubePlayerRef.current && typeof youtubePlayerRef.current.getCurrentTime === 'function') {
          try {
            setCurrentTime(youtubePlayerRef.current.getCurrentTime() || 0);
            setDuration(youtubePlayerRef.current.getDuration() || 0);
          } catch (e) {}
        }
      }, 250);
    }
    return () => clearInterval(interval);
  }, [isPlaying, activePlayer, loadingTrack]);

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
      if (audioRef.current) audioRef.current.currentTime = seekValue;
    }
  };

  const handleVolumeChange = (e) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (vol > 0) setIsMuted(false);
  };

  const toggleRepeat = () => {
    if (repeatMode === 'off') setRepeatMode('all');
    else if (repeatMode === 'all') setRepeatMode('one');
    else setRepeatMode('off');
  };

  return (
    <>
      <audio ref={audioRef} />

      {/* Hidden YouTube Container */}
      <div style={{
        position: 'fixed',
        bottom: showVideo ? '100px' : '-9999px',
        right: showVideo ? '20px' : '-9999px',
        width: showVideo ? '320px' : '1px',
        height: showVideo ? '180px' : '1px',
        borderRadius: '12px',
        overflow: 'hidden',
        zIndex: 1000,
        boxShadow: showVideo ? '0 10px 30px rgba(0,0,0,0.8)' : 'none',
        border: showVideo ? '2px solid rgba(255,255,255,0.2)' : 'none',
        backgroundColor: '#000',
      }}>
        <div id="youtube-hidden-player" style={{ width: '100%', height: '100%' }} />
      </div>

      {/* Drawers */}
      <QueueDrawer
        isOpen={isQueueOpen}
        onClose={() => setIsQueueOpen(false)}
        queue={queue}
        queueIndex={queueIndex}
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onPlayTrack={onPlayTrack}
        onRemoveFromQueue={onRemoveFromQueue}
        onClearQueue={onClearQueue}
      />

      <LyricsDrawer
        isOpen={isLyricsOpen}
        onClose={() => setIsLyricsOpen(false)}
        currentTrack={currentTrack}
        isPlaying={isPlaying}
      />

      {/* Persistent Bottom Spotify Player Bar */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '90px',
        backgroundColor: '#000000',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        display: currentTrack ? 'flex' : 'none',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        zIndex: 999,
        userSelect: 'none',
      }}>
        {/* Left: Track artwork, title, artist, like button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', width: '30%', minWidth: '180px' }}>
          <div
            onClick={() => navigate('/now-playing')}
            style={{
              position: 'relative',
              width: '56px',
              height: '56px',
              borderRadius: '6px',
              overflow: 'hidden',
              cursor: 'pointer',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            }}
          >
            <img
              src={currentTrack?.imageUrl || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200'}
              alt={currentTrack?.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '0.925rem', fontWeight: 700, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {currentTrack?.title}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {currentTrack?.artist}
            </div>
          </div>

          {onSaveToggle && (
            <button
              onClick={() => onSaveToggle(currentTrack)}
              style={{
                background: 'none',
                border: 'none',
                color: isSaved ? '#1db954' : 'var(--text-muted)',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '50%',
              }}
              onMouseEnter={(e) => { if (!isSaved) e.currentTarget.style.color = '#ffffff'; }}
              onMouseLeave={(e) => { if (!isSaved) e.currentTarget.style.color = 'var(--text-muted)'; }}
            >
              <Heart size={18} fill={isSaved ? '#1db954' : 'none'} />
            </button>
          )}
        </div>

        {/* Center: Playback Controls & Seeker */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '40%', maxWidth: '600px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '22px' }}>
            <button
              onClick={() => setIsShuffle(!isShuffle)}
              style={{
                background: 'none',
                border: 'none',
                color: isShuffle ? '#1db954' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'var(--transition-smooth)',
              }}
              title="Shuffle"
            >
              <Shuffle size={18} />
            </button>

            <button
              onClick={onPrev}
              style={{ background: 'none', border: 'none', color: '#b3b3b3', cursor: 'pointer' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#b3b3b3'}
              title="Previous"
            >
              <SkipBack size={22} fill="currentColor" />
            </button>

            <button
              onClick={onPlayPauseToggle}
              disabled={loadingTrack}
              style={{
                backgroundColor: '#ffffff',
                border: 'none',
                color: '#000000',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: loadingTrack ? 'not-allowed' : 'pointer',
                transition: 'transform 0.15s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.06)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause size={18} fill="currentColor" />
              ) : (
                <Play size={18} fill="currentColor" style={{ marginLeft: '2px' }} />
              )}
            </button>

            <button
              onClick={onNext}
              style={{ background: 'none', border: 'none', color: '#b3b3b3', cursor: 'pointer' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#b3b3b3'}
              title="Next"
            >
              <SkipForward size={22} fill="currentColor" />
            </button>

            <button
              onClick={toggleRepeat}
              style={{
                background: 'none',
                border: 'none',
                color: repeatMode !== 'off' ? '#1db954' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'var(--transition-smooth)',
              }}
              title={`Repeat Mode: ${repeatMode}`}
            >
              {repeatMode === 'one' ? <Repeat1 size={18} /> : <Repeat size={18} />}
            </button>
          </div>

          {/* Seeker Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              style={{
                flex: 1,
                height: '4px',
                borderRadius: '2px',
                background: `linear-gradient(to right, #1db954 ${(currentTime / (duration || 100)) * 100}%, #4d4d4d ${(currentTime / (duration || 100)) * 100}%)`,
                outline: 'none',
                cursor: 'pointer',
                WebkitAppearance: 'none',
                accentColor: '#1db954',
              }}
            />
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right: Drawer toggles, Video, Volume */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '14px', width: '30%', minWidth: '180px' }}>
          {activePlayer === 'youtube' && (
            <button
              onClick={() => setShowVideo(!showVideo)}
              style={{
                background: 'none',
                border: 'none',
                color: showVideo ? '#1db954' : 'var(--text-muted)',
                cursor: 'pointer',
              }}
              title={showVideo ? "Hide Video" : "Show Video"}
            >
              <Tv size={18} />
            </button>
          )}

          <button
            onClick={() => setIsLyricsOpen(!isLyricsOpen)}
            style={{
              background: 'none',
              border: 'none',
              color: isLyricsOpen ? '#1db954' : 'var(--text-muted)',
              cursor: 'pointer',
            }}
            title="Lyrics & Visualizer"
          >
            <Mic size={18} />
          </button>

          <button
            onClick={() => setIsQueueOpen(!isQueueOpen)}
            style={{
              background: 'none',
              border: 'none',
              color: isQueueOpen ? '#1db954' : 'var(--text-muted)',
              cursor: 'pointer',
            }}
            title="Queue"
          >
            <ListMusic size={18} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setIsMuted(!isMuted)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
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
                width: '80px',
                height: '4px',
                borderRadius: '2px',
                background: `linear-gradient(to right, #1db954 ${volume * 100}%, #4d4d4d ${volume * 100}%)`,
                outline: 'none',
                cursor: 'pointer',
                accentColor: '#1db954',
              }}
            />
          </div>

          <button
            onClick={() => navigate('/now-playing')}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            title="Full Screen"
          >
            <Maximize2 size={16} />
          </button>
        </div>
      </div>
    </>
  );
};

export default Player;
