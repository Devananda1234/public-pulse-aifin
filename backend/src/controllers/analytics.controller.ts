import { Request, Response } from 'express';
import { getDashboardStats } from '../services/analytics.service';

export const getAnalytics = (req: Request, res: Response): void => {
  const stats = getDashboardStats();
  res.json(stats);
};
