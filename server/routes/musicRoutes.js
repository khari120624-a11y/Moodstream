import express from 'express';
import {
  getSongsByMood,
  getUserPlaylist,
  saveSongToPlaylist,
  deleteSongFromPlaylist,
  searchSongs,
  getYouTubeId,
} from '../controllers/musicController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes to fetch songs
router.get('/mood/:mood', getSongsByMood);
router.get('/search', searchSongs);
router.get('/youtube-id', getYouTubeId);

// Protected routes to manage user playlist
router.route('/playlist')
  .get(protect, getUserPlaylist)
  .post(protect, saveSongToPlaylist);

router.route('/playlist/:trackId')
  .delete(protect, deleteSongFromPlaylist);

export default router;
