import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Player from './components/Player';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Playlist from './pages/Playlist';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import FutureAssessment from './pages/FutureAssessment';
import VibeRoom from './pages/VibeRoom';
import NowPlaying from './pages/NowPlaying';

import api from './services/api';
import { detectSongMood } from './services/songClassifier';

function App() {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(-1);
  const [savedTracks, setSavedTracks] = useState([]);

  // Search & Mood global state for Navbar & Sidebar
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMood, setSelectedMood] = useState(null);

  // Helper to fetch mood tracks and append to queue
  const populateMoodQueue = async (track, initialQueue = []) => {
    const mood = detectSongMood(track);
    let baseQueue = initialQueue.length > 0 ? [...initialQueue] : [track];

    try {
      const response = await api.get(`/music/mood/${mood}`);
      const moodTracks = response.data || [];

      const newTracks = moodTracks.filter(
        (mTrack) => !baseQueue.some(
          (bTrack) =>
            (mTrack.spotifyId && bTrack.spotifyId === mTrack.spotifyId) ||
            (mTrack.title.toLowerCase() === bTrack.title.toLowerCase() && mTrack.artist.toLowerCase() === bTrack.artist.toLowerCase())
        )
      );

      const combinedQueue = [...baseQueue, ...newTracks];
      setQueue(combinedQueue);

      const idx = combinedQueue.findIndex(
        (t) =>
          (track.spotifyId && t.spotifyId === track.spotifyId) ||
          (!track.spotifyId && t.title === track.title && t.artist === track.artist)
      );
      setQueueIndex(idx !== -1 ? idx : 0);
    } catch (err) {
      console.error('Error fetching mood recommendations:', err);
      setQueue(baseQueue);
      setQueueIndex(0);
    }
  };

  // Play track
  const playTrack = (track, newQueue = []) => {
    const isSameTrack = currentTrack && (
      (currentTrack.spotifyId && currentTrack.spotifyId === track.spotifyId) ||
      (!currentTrack.spotifyId && currentTrack.title === track.title && currentTrack.artist === track.artist)
    );

    if (isSameTrack) {
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
    populateMoodQueue(track, newQueue);
  };

  // Skip to Next
  const nextTrack = async () => {
    if (queue.length === 0 || queueIndex === -1) return;

    let nextIdx = queueIndex + 1;

    if (nextIdx >= queue.length && currentTrack) {
      const mood = detectSongMood(currentTrack);
      try {
        const response = await api.get(`/music/mood/${mood}`);
        const freshMoodTracks = response.data || [];
        if (freshMoodTracks.length > 0) {
          const updatedQueue = [...queue, ...freshMoodTracks];
          setQueue(updatedQueue);
          setQueueIndex(nextIdx);
          setCurrentTrack(updatedQueue[nextIdx]);
          setIsPlaying(true);
          return;
        }
      } catch (err) {}
    }

    nextIdx = nextIdx % queue.length;
    setQueueIndex(nextIdx);
    setCurrentTrack(queue[nextIdx]);
    setIsPlaying(true);
  };

  // Skip to Previous
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

  const handleRemoveFromQueue = (index) => {
    const newQueue = [...queue];
    newQueue.splice(index, 1);
    setQueue(newQueue);
    if (index < queueIndex) {
      setQueueIndex(queueIndex - 1);
    }
  };

  const handleClearQueue = () => {
    setQueue(currentTrack ? [currentTrack] : []);
    setQueueIndex(currentTrack ? 0 : -1);
  };

  const handleSaveToggle = async (song) => {
    try {
      const alreadySaved = savedTracks.some(
        (t) =>
          (song.spotifyId && t.spotifyId === song.spotifyId) ||
          (!song.spotifyId && t.title?.toLowerCase() === song.title?.toLowerCase() && t.artist?.toLowerCase() === song.artist?.toLowerCase())
      );

      if (alreadySaved) {
        const savedTrack = savedTracks.find(
          (t) =>
            (song.spotifyId && t.spotifyId === song.spotifyId) ||
            (!song.spotifyId && t.title?.toLowerCase() === song.title?.toLowerCase() && t.artist?.toLowerCase() === song.artist?.toLowerCase())
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
          mood: song.mood || selectedMood || 'search',
        });
        setSavedTracks(response.data);
      }
    } catch (err) {
      console.error('Error toggling song save:', err);
    }
  };

  return (
    <AuthProvider>
      <Router>
        <div className="spotify-app-container">
          {/* Main Layout Grid */}
          <div className="spotify-main-layout">
            {/* Desktop Left Sidebar */}
            <Sidebar
              selectedMood={selectedMood}
              onMoodSelect={(moodKey) => {
                setSelectedMood(moodKey);
              }}
            />

            {/* Main Content Container with Top Header */}
            <div className="spotify-main-content">
              <Navbar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />

              <main style={{ flex: 1, overflowY: 'auto' }}>
                <Routes>
                  <Route
                    path="/"
                    element={
                      <Home
                        playTrack={playTrack}
                        currentTrack={currentTrack}
                        isPlaying={isPlaying}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        selectedMood={selectedMood}
                        setSelectedMood={setSelectedMood}
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
                  <Route
                    path="/now-playing"
                    element={
                      <NowPlaying
                        currentTrack={currentTrack}
                        isPlaying={isPlaying}
                        playTrack={playTrack}
                        queue={queue}
                        queueIndex={queueIndex}
                      />
                    }
                  />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </main>
            </div>
          </div>

          {/* Persistent Bottom Spotify Player Bar */}
          <Player
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            onPlayPauseToggle={handlePlayPauseToggle}
            onNext={nextTrack}
            onPrev={prevTrack}
            queue={queue}
            queueIndex={queueIndex}
            onPlayTrack={playTrack}
            onRemoveFromQueue={handleRemoveFromQueue}
            onClearQueue={handleClearQueue}
            savedTracks={savedTracks}
            onSaveToggle={handleSaveToggle}
          />

          {/* Spotify Mobile Bottom Navigation */}
          <BottomNav />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
