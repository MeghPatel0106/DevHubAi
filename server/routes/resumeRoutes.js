import { Router } from 'express';
import {
  getResumes,
  createResume,
  getResumeById,
  updateResume,
  deleteResume,
  setDefaultResume,
} from '../controllers/resumeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);

router.route('/')
  .get(getResumes)
  .post(createResume);

router.patch('/:id/default', setDefaultResume);

router.route('/:id')
  .get(getResumeById)
  .put(updateResume)
  .delete(deleteResume);

export default router;
