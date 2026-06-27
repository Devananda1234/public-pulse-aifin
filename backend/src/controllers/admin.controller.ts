import { Request, Response } from 'express';
import Report from '../models/Report';

export const updateReportStatus = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status, department } = req.body;
  
  const updateData: any = {};
  if (status) updateData.status = status;
  if (department) updateData.department = department;

  try {
    const updated = await Report.findOneAndUpdate({ id }, updateData, { new: true });
    if (updated) {
      res.json(updated);
    } else {
      res.status(404).json({ error: 'Report not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update report' });
  }
};
