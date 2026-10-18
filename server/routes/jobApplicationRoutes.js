import { Router } from 'express';
import {
  getJobApplications,
  createJobApplication,
  getJobApplicationById,
  updateJobApplication,
  updateJobApplicationStatus,
  deleteJobApplication,
} from '../controllers/jobApplicationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

// Enforce strict authentication for all job application endpoints
router.use(protect);

router.route('/')
  .get(getJobApplications)
  .post(createJobApplication);

router.route('/:id')
  .get(getJobApplicationById)
  .put(updateJobApplication)
  .delete(deleteJobApplication);

router.route('/:id/status')
  .patch(updateJobApplicationStatus);

export default router;
