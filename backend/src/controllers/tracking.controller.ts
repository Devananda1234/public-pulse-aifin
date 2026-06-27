import { Request, Response } from 'express';
import { getTrackingInfo } from '../services/tracking.service';

export const trackIssue = (req: Request, res: Response): void => {
  const { id } = req.params;
  const report = getTrackingInfo(id as string);
  if (report) {
    res.json(report);
  } else {
    res.status(404).json({ error: 'Tracking ID not found' });
  }
};
