import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import authRoutes from './authRoutes.js';
import profileRoutes from './profileRoutes.js';
import projectRoutes from './projectRoutes.js';
import resumeRoutes from './resumeRoutes.js';
import certificateRoutes from './certificateRoutes.js';
import jobApplicationRoutes from './jobApplicationRoutes.js';
import skillRoutes from './skillRoutes.js';
import githubRoutes from './githubRoutes.js';
import aiRoutes from './aiRoutes.js';
import recruiterRoutes from './recruiterRoutes.js';
import { getPublicPortfolio } from '../controllers/profileController.js';

const apiRouter = Router();

// Mount Health Check Route (Public)
apiRouter.use('/health', healthRoutes);

// Mount Authentication & Authorization Routes
apiRouter.use('/auth', authRoutes);

// Mount Dedicated Public Portfolio Routes (Public)
apiRouter.get('/public/profile/:username', getPublicPortfolio);

// Mount Career Management Resource Routes
apiRouter.use('/profile', profileRoutes);
apiRouter.use('/projects', projectRoutes);
apiRouter.use('/resumes', resumeRoutes);
apiRouter.use('/certificates', certificateRoutes);
apiRouter.use('/job-applications', jobApplicationRoutes);
apiRouter.use('/applications', jobApplicationRoutes);
apiRouter.use('/skills', skillRoutes);
apiRouter.use('/github', githubRoutes);
apiRouter.use('/ai', aiRoutes);
apiRouter.use('/career-goals', aiRoutes);
apiRouter.use('/recruiter', recruiterRoutes);

export default apiRouter;
