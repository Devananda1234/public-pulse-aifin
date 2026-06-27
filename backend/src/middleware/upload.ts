import { Request, Response, NextFunction } from 'express';

// Mock upload middleware for MVP
export const upload = (req: Request, res: Response, next: NextFunction): void => {
  // In a real app, this would use multer to parse multipart/form-data
  // and then upload to Cloudinary. For MVP, we just pass through.
  (req as any).file = null; 
  next();
};
