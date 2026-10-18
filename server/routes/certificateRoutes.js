import { Router } from 'express';
import {
  getCertificates,
  createCertificate,
  getCertificateById,
  updateCertificate,
  deleteCertificate,
} from '../controllers/certificateController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);

router.route('/')
  .get(getCertificates)
  .post(createCertificate);

router.route('/:id')
  .get(getCertificateById)
  .put(updateCertificate)
  .delete(deleteCertificate);

export default router;
