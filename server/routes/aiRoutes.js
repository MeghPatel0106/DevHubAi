import { Router } from 'express';
import {
  getCareerGoals,
  updateCareerGoals,
  getLatestAnalysis,
  runProfileAnalysis,
  askCareerQuestion,
} from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

// Protect all AI career management endpoints
router.use(protect);

router.get('/goals', getCareerGoals);
router.put('/goals', updateCareerGoals);
router.get('/latest-analysis', getLatestAnalysis);
router.post('/analyze-profile', runProfileAnalysis);
router.post('/career-question', askCareerQuestion);

export default router;
