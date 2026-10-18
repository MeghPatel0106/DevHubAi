import { Router } from 'express';
import {
  getMyProfile,
  updateMyProfile,
  getPublicPortfolio,
} from '../controllers/profileController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

// Protected profile routes for authenticated user
router.get('/me', protect, getMyProfile);
router.put('/me', protect, updateMyProfile);

// Public profile & portfolio routes (accessible without login)
router.get('/public/:username', getPublicPortfolio);
router.get('/:username', getPublicPortfolio);

export default router;
