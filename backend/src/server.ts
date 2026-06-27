import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { connectDB } from './config/db';

const PORT = 3000;

connectDB();

app.listen(PORT, () => {
  console.log(`Backend is running on http://localhost:${PORT}`);
});
