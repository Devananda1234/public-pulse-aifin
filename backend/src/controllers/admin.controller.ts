import { Request, Response } from 'express';
import Report from '../models/Report';

export const updateReportStatus = (req: Request, res: Response): void => {
  const { id } = req.params;
  const { status, department } = req.body;
  
  const updateData: any = {};
  if (status) updateData.status = status;
  if (department) updateData.department = department;

  const updated = Report.findByIdAndUpdate(id as string, updateData);
  if (updated) {
    res.json(updated);
  } else {
    res.status(404).json({ error: 'Report not found' });
  }
};
