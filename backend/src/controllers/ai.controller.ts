import { Request, Response } from 'express';
import { analyzeText } from '../services/ai.service';

export const analyzeReport = async (req: Request, res: Response): Promise<void> => {
  const { description } = req.body;
  if (!description) {
    res.status(400).json({ error: 'Description is required' });
    return;
  }
  
  try {
    const result = await analyzeText(description);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'AI analysis failed' });
  }
};
