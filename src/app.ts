import express from 'express';
import cors from 'cors';
import webhookRoutes from './routes/webhookRoutes';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/gocomet', webhookRoutes);

// Health Check
app.get('/', (req, res) => {
    res.json({ status: 'Autopilot Logistics Platform is Online', timestamp: new Date() });
});

export default app;