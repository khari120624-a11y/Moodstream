import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Player from './components/Player';
import Home from './pages/Home';
import Playlist from './pages/Playlist';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import FutureAssessment from './pages/FutureAssessment';
import VibeRoom from './pages/VibeRoom';

function App() {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(-1);

  // Play a track and initialize queue
  const playTrack = (track, newQueue = []) => {
    const isSameTrack = currentTrack && (
      (currentTrack.spotifyId && currentTrack.spotifyId === track.spotifyId) ||
      (!currentTrack.spotifyId && currentTrack.title === track.title && currentTrack.artist === track.artist)
    );

    if (isSameTrack) {
      // If user toggled between normal (audio) play and video play on the same track
      if (currentTrack.playVideo !== track.playVideo) {
        setCurrentTrack({ ...track });
        setIsPlaying(true);
        return;
      }
      setIsPlaying(!isPlaying);
      return;
    }

    setCurrentTrack(track);
    setIsPlaying(true);

    if (newQueue.length > 0) {
      setQueue(newQueue);
      const idx = newQueue.findIndex(
        (t) =>
          (track.spotifyId && t.spotifyId === track.spotifyId) ||
          (!track.spotifyId && t.title === track.title && t.artist === track.artist)
      );
      setQueueIndex(idx !== -1 ? idx : 0);
    } else {
      setQueue([track]);
      setQueueIndex(0);
    }
  };

  // Skip to next track in queue
  const nextTrack = () => {
    if (queue.length === 0 || queueIndex === -1) return;
    const nextIdx = (queueIndex + 1) % queue.length;
    setQueueIndex(nextIdx);
    setCurrentTrack(queue[nextIdx]);
    setIsPlaying(true);
  };

  // Skip to previous track in queue
  const prevTrack = () => {
    if (queue.length === 0 || queueIndex === -1) return;
    const prevIdx = (queueIndex - 1 + queue.length) % queue.length;
    setQueueIndex(prevIdx);
    setCurrentTrack(queue[prevIdx]);
    setIsPlaying(true);
  };

  const handlePlayPauseToggle = () => {
    if (currentTrack) {
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <AuthProvider>
      <Router>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          
          <main style={{ flexGrow: 1 }}>
            <Routes>
              <Route
                path="/"
                element={
                  <Home
                    playTrack={playTrack}
                    currentTrack={currentTrack}
                    isPlaying={isPlaying}
                  />
                }
              />
              <Route
                path="/playlist"
                element={
                  <Playlist
                    playTrack={playTrack}
                    currentTrack={currentTrack}
                    isPlaying={isPlaying}
                  />
                }
              />
              <Route
                path="/future-assessment"
                element={
                  <FutureAssessment
                    playTrack={playTrack}
                    currentTrack={currentTrack}
                    isPlaying={isPlaying}
                  />
                }
              />
              <Route
                path="/vibe-room"
                element={
                  <VibeRoom
                    playTrack={playTrack}
                    currentTrack={currentTrack}
                    isPlaying={isPlaying}
                  />
                }
              />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/now-playing" element={<div style={{ minHeight: 'calc(100vh - 120px)' }} />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>

          {/* persistent Audio Player Bar */}
          <Player
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            onPlayPauseToggle={handlePlayPauseToggle}
            onNext={nextTrack}
            onPrev={prevTrack}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
