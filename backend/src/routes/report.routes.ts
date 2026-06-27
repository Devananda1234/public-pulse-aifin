import { Router } from 'express';
import { getReports, createReport, getReportById } from '../controllers/report.controller';
import { upload } from '../middleware/upload';

const router = Router();

router.get('/', getReports);
router.post('/', upload, createReport);
router.get('/:id', getReportById);

export default router;
