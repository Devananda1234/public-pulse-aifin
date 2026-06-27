import { Request, Response } from 'express';
import User from '../models/User';
import jwt from 'jsonwebtoken';

const SECRET_KEY = 'public-pulse-ai-super-secret-key-for-mvp';

export const login = (req: Request, res: Response): void => {
  const { email, password } = req.body;
  const user = User.findOne({ email, password });
  
  if (user) {
    const token = jwt.sign({ role: user.role }, SECRET_KEY, { expiresIn: '24h' });
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
};
