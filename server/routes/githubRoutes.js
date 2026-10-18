import { Router } from 'express';
import {
  getGitHubAnalytics,
  connectGitHub,
  refreshGitHubData,
  updateGitHubVisibility,
  disconnectGitHub,
} from '../controllers/githubController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

// Protect all GitHub management endpoints with JWT auth
router.use(protect);

router.get('/analytics', getGitHubAnalytics);
router.post('/connect', connectGitHub);
router.post('/sync', refreshGitHubData);
router.patch('/visibility', updateGitHubVisibility);
router.delete('/disconnect', disconnectGitHub);

export default router;
