import { Router } from 'express';
import { analyzeReport } from '../controllers/ai.controller';

const router = Router();

router.post('/analyze', analyzeReport);

export default router;
