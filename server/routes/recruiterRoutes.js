import { Router } from 'express';
import {
  getRecruiterProfile,
  updateRecruiterProfile,
  getRecruiterDashboardStats,
  findCandidates,
  getCandidateDetails,
  getShortlists,
  addToShortlist,
  removeFromShortlist,
  getCandidateNotes,
  createCandidateNote,
  updateCandidateNote,
  deleteCandidateNote,
} from '../controllers/recruiterController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = Router();

// Protect and authorize all recruiter endpoints for recruiter & admin roles only
router.use(protect);
router.use(authorize('recruiter', 'admin'));

// Profile & Dashboard
router.get('/profile', getRecruiterProfile);
router.put('/profile', updateRecruiterProfile);
router.get('/dashboard', getRecruiterDashboardStats);

// Candidate Discovery & Public Details
router.get('/candidates', findCandidates);
router.get('/candidates/:id', getCandidateDetails);

// Shortlists
router.get('/shortlists', getShortlists);
router.post('/shortlists/:developerId', addToShortlist);
router.delete('/shortlists/:developerId', removeFromShortlist);

// Private Recruiter Notes
router.get('/candidates/:developerId/notes', getCandidateNotes);
router.post('/candidates/:developerId/notes', createCandidateNote);
router.put('/notes/:id', updateCandidateNote);
router.delete('/notes/:id', deleteCandidateNote);

export default router;
