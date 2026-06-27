import { Router } from 'express';
import { updateReportStatus } from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth';
import { admin } from '../middleware/admin';

const router = Router();

router.put('/reports/:id', authenticate, admin, updateReportStatus);

export default router;
