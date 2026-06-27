import { Request, Response } from 'express';
import Report from '../models/Report';

export const getReports = (req: Request, res: Response): void => {
  const reports = Report.find();
  res.json(reports);
};

export const createReport = (req: Request, res: Response): void => {
  const { title, description, category, severity, location, image } = req.body;
  const newReport = Report.create({ title, description, category, severity, location, image });
  res.status(201).json(newReport);
};

export const getReportById = (req: Request, res: Response): void => {
  const report = Report.findById(req.params.id as string);
  if (report) {
    res.json(report);
  } else {
    res.status(404).json({ error: 'Report not found' });
  }
};
