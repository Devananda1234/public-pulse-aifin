import { Request, Response } from 'express';
import Report from '../models/Report';

export const getReports = async (req: Request, res: Response): Promise<void> => {
  try {
    const reports = await Report.find();
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
};

export const createReport = async (req: Request, res: Response): Promise<void> => {
  const { title, description, category, severity, location, image } = req.body;
  
  try {
    const newReport = await Report.create({ title, description, category, severity, location, image });
    res.status(201).json(newReport);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create report' });
  }
};

export const getReportById = async (req: Request, res: Response): Promise<void> => {
  try {
    const report = await Report.findOne({ id: req.params.id as string });
    if (report) {
      res.json(report);
    } else {
      res.status(404).json({ error: 'Report not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch report' });
  }
};
