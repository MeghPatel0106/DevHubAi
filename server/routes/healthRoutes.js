import { Router } from 'express';
import { getHealthStatus, getDatabaseAudit } from '../controllers/healthController.js';

const router = Router();

// GET /api/health
router.get('/', getHealthStatus);
router.get('/db-audit', getDatabaseAudit);

export default router;
