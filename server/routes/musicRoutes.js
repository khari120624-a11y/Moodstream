import express from 'express';
import {
  getSongsByMood,
  getUserPlaylist,
  saveSongToPlaylist,
  deleteSongFromPlaylist,
  searchSongs,
  getYouTubeId,
  saveAssessment,
  getAssessments,
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

// Protected routes to manage user mood assessments
router.route('/assessment')
  .get(protect, getAssessments)
  .post(protect, saveAssessment);

export default router;
