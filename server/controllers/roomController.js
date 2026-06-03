import { dbRoom as Room, dbUser as User } from '../utils/dbManager.js';
import { getTracksByMood } from '../services/spotifyService.js';

// Helper to generate a unique room code
const generateRoomCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Helper to calculate blended moods and compile full room status response
const getFullRoomStatusPayload = async (room) => {
  const uniqueMoods = [...new Set(room.participants.map((p) => p.mood))];
  let blendedTracks = [];

  if (uniqueMoods.length > 0) {
    // Fetch tracks for all active moods in parallel
    const moodTracksPromises = uniqueMoods.map((mood) =>
      getTracksByMood(mood).catch((e) => {
        console.error(`Error loading mood "${mood}" for blend:`, e.message);
        return [];
      })
    );

    const moodTracksLists = await Promise.all(moodTracksPromises);

    // Interleave songs list
    const maxLength = Math.max(...moodTracksLists.map((list) => list.length));
    for (let i = 0; i < maxLength; i++) {
      for (let j = 0; j < moodTracksLists.length; j++) {
        if (moodTracksLists[j][i]) {
          blendedTracks.push(moodTracksLists[j][i]);
        }
      }
    }

    // De-duplicate tracks (by title + artist)
    const seen = new Set();
    blendedTracks = blendedTracks.filter((track) => {
      const key = `${track.title.toLowerCase()}-${track.artist.toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Limit playlist to 16 tracks
    blendedTracks = blendedTracks.slice(0, 16);
  }

  return {
    roomCode: room.roomCode,
    host: room.host,
    participants: room.participants,
    currentTrack: room.currentTrack,
    isPlaying: room.isPlaying,
    blendedMoods: uniqueMoods,
    tracks: blendedTracks,
  };
};

/**
 * @desc    Create a new Vibe Room
 * @route   POST /api/room/create
 * @access  Private
 */
export const createRoom = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const roomCode = generateRoomCode();

    const room = await Room.create({
      roomCode,
      host: req.user.id,
      participants: [
        {
          user: req.user.id,
          username: user.username,
          mood: 'chill',
          lastActive: new Date(),
        },
      ],
      isPlaying: false,
    });

    const payload = await getFullRoomStatusPayload(room);
    res.status(201).json(payload);
  } catch (error) {
    console.error('Error creating Vibe Room:', error.message);
    res.status(500).json({ message: 'Server error creating Vibe Room' });
  }
};

/**
 * @desc    Join an existing Vibe Room
 * @route   POST /api/room/join
 * @access  Private
 */
export const joinRoom = async (req, res) => {
  const { roomCode } = req.body;

  if (!roomCode) {
    return res.status(400).json({ message: 'Room code is required' });
  }

  try {
    const room = await Room.findOne({ roomCode: roomCode.toUpperCase() });
    if (!room) {
      return res.status(404).json({ message: 'Vibe Room not found' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user already in room
    const existsIdx = room.participants.findIndex(
      (p) => p.user.toString() === req.user.id.toString()
    );

    if (existsIdx === -1) {
      room.participants.push({
        user: req.user.id,
        username: user.username,
        mood: 'chill',
        lastActive: new Date(),
      });
      await room.save();
    } else {
      // Update activity timestamp
      room.participants[existsIdx].lastActive = new Date();
      await room.save();
    }

    const payload = await getFullRoomStatusPayload(room);
    res.json(payload);
  } catch (error) {
    console.error('Error joining Vibe Room:', error.message);
    res.status(500).json({ message: 'Server error joining Vibe Room' });
  }
};

/**
 * @desc    Update user's active mood inside room
 * @route   POST /api/room/mood
 * @access  Private
 */
export const updateRoomMood = async (req, res) => {
  const { roomCode, mood } = req.body;

  if (!roomCode || !mood) {
    return res.status(400).json({ message: 'Room code and mood are required' });
  }

  try {
    const room = await Room.findOne({ roomCode: roomCode.toUpperCase() });
    if (!room) {
      return res.status(404).json({ message: 'Vibe Room not found' });
    }

    const memberIdx = room.participants.findIndex(
      (p) => p.user.toString() === req.user.id.toString()
    );

    if (memberIdx === -1) {
      return res.status(403).json({ message: 'You are not in this Vibe Room' });
    }

    room.participants[memberIdx].mood = mood.toLowerCase();
    room.participants[memberIdx].lastActive = new Date();
    await room.save();

    const payload = await getFullRoomStatusPayload(room);
    res.json(payload);
  } catch (error) {
    console.error('Error updating mood in Vibe Room:', error.message);
    res.status(500).json({ message: 'Server error updating mood' });
  }
};

/**
 * @desc    Sync player playback (track changes & play/pause)
 * @route   POST /api/room/sync
 * @access  Private
 */
export const syncPlayback = async (req, res) => {
  const { roomCode, currentTrack, isPlaying } = req.body;

  if (!roomCode) {
    return res.status(400).json({ message: 'Room code is required' });
  }

  try {
    const room = await Room.findOne({ roomCode: roomCode.toUpperCase() });
    if (!room) {
      return res.status(404).json({ message: 'Vibe Room not found' });
    }

    // Update active user timestamp
    const memberIdx = room.participants.findIndex(
      (p) => p.user.toString() === req.user.id.toString()
    );
    if (memberIdx !== -1) {
      room.participants[memberIdx].lastActive = new Date();
    }

    room.currentTrack = currentTrack;
    room.isPlaying = isPlaying;
    await room.save();

    const payload = await getFullRoomStatusPayload(room);
    res.json(payload);
  } catch (error) {
    console.error('Error syncing room playback:', error.message);
    res.status(500).json({ message: 'Server error syncing playback' });
  }
};

/**
 * @desc    Get Vibe Room details and computed blended playlist
 * @route   GET /api/room/status/:roomCode
 * @access  Private
 */
export const getRoomStatus = async (req, res) => {
  const { roomCode } = req.params;

  try {
    const room = await Room.findOne({ roomCode: roomCode.toUpperCase() });
    if (!room) {
      return res.status(404).json({ message: 'Vibe Room not found' });
    }

    // Update request caller active status
    const callerIdx = room.participants.findIndex(
      (p) => p.user.toString() === req.user.id.toString()
    );
    if (callerIdx !== -1) {
      room.participants[callerIdx].lastActive = new Date();
      await room.save();
    }

    // Clean inactive members (not polled for 45s)
    const activeCutoff = new Date(Date.now() - 45000);
    const originalCount = room.participants.length;
    room.participants = room.participants.filter(
      (p) => p.lastActive >= activeCutoff || p.user.toString() === room.host.toString()
    );
    
    if (room.participants.length !== originalCount) {
      await room.save();
    }

    const payload = await getFullRoomStatusPayload(room);
    res.json(payload);
  } catch (error) {
    console.error('Error fetching Vibe Room status:', error.message);
    res.status(500).json({ message: 'Server error retrieving room status' });
  }
};

/**
 * @desc    Leave a Vibe Room
 * @route   POST /api/room/leave
 * @access  Private
 */
export const leaveRoom = async (req, res) => {
  const { roomCode } = req.body;

  if (!roomCode) {
    return res.status(400).json({ message: 'Room code is required' });
  }

  try {
    const room = await Room.findOne({ roomCode: roomCode.toUpperCase() });
    if (!room) {
      return res.status(404).json({ message: 'Vibe Room not found' });
    }

    room.participants = room.participants.filter(
      (p) => p.user.toString() !== req.user.id.toString()
    );

    // If host leaves and other participants remain, assign new host
    if (room.host.toString() === req.user.id.toString() && room.participants.length > 0) {
      room.host = room.participants[0].user;
    }

    await room.save();

    res.json({ message: 'Successfully left the Vibe Room' });
  } catch (error) {
    console.error('Error leaving Vibe Room:', error.message);
    res.status(500).json({ message: 'Server error exiting room' });
  }
};
