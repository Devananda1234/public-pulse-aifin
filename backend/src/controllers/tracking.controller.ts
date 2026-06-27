import { Request, Response } from 'express';
import { getTrackingInfo } from '../services/tracking.service';

export const trackIssue = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  
  try {
    const report = await getTrackingInfo(id as string);
    if (report) {
      res.json(report);
    } else {
      res.status(404).json({ error: 'Tracking ID not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to track issue' });
  }
};
