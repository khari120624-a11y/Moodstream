import express from 'express';
import {
  createRoom,
  joinRoom,
  updateRoomMood,
  syncPlayback,
  getRoomStatus,
  leaveRoom,
} from '../controllers/roomController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// All Vibe Room endpoints require authentication
router.post('/create', protect, createRoom);
router.post('/join', protect, joinRoom);
router.post('/mood', protect, updateRoomMood);
router.post('/sync', protect, syncPlayback);
router.get('/status/:roomCode', protect, getRoomStatus);
router.post('/leave', protect, leaveRoom);

export default router;
