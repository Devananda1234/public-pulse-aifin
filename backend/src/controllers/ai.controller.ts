import { Request, Response } from 'express';
import { analyzeText } from '../services/ai.service';

export const analyzeReport = (req: Request, res: Response): void => {
  const { description } = req.body;
  if (!description) {
    res.status(400).json({ error: 'Description is required' });
    return;
  }
  
  const result = analyzeText(description);
  res.json(result);
};
