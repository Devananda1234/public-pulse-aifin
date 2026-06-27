import { Request, Response } from 'express';
import { getDashboardStats } from '../services/analytics.service';

export const getAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await getDashboardStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};
