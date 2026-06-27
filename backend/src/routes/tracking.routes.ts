import { Router } from 'express';
import { trackIssue } from '../controllers/tracking.controller';

const router = Router();

router.get('/:id', trackIssue);

export default router;
