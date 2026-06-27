import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const SECRET_KEY = 'public-pulse-ai-super-secret-key-for-mvp';

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, SECRET_KEY, (err, user) => {
      if (err) {
        res.status(403).json({ error: 'Invalid or expired token' });
        return;
      }
      (req as any).user = user;
      next();
    });
  } else {
    res.status(401).json({ error: 'Authentication required' });
  }
};
