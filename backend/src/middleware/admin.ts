import { Request, Response, NextFunction } from 'express';

export const admin = (req: Request, res: Response, next: NextFunction): void => {
  const user = (req as any).user;
  if (user && user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Admin access required' });
  }
};
