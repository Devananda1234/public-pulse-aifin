import mongoose from 'mongoose';
import User from '../models/User';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoUrl = process.env.MONGO_URL;
    if (!mongoUrl) {
      console.warn('MONGO_URL not found in .env, skipping MongoDB connection.');
      return;
    }
    
    await mongoose.connect(mongoUrl);
    console.log('MongoDB connected');

    // Seed default admin for MVP
    const adminExists = await User.findOne({ email: 'admin@publicpulse.ai' });
    if (!adminExists) {
      await User.create({
        email: 'admin@publicpulse.ai',
        password: 'admin123',
        role: 'admin'
      });
      console.log('Default admin seeded');
    }

  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};
