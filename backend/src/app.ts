import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import reportRoutes from './routes/report.routes';
import adminRoutes from './routes/admin.routes';
import analyticsRoutes from './routes/analytics.routes';
import aiRoutes from './routes/ai.routes';
import trackingRoutes from './routes/tracking.routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/tracking', trackingRoutes);

app.use(errorHandler);

export default app;
