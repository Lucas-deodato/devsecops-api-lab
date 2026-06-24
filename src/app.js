import express from 'express';
import helmet from 'helmet';
import { errorHandler } from './middlewares/error-handler.js';
import { notFound } from './middlewares/not-found.js';
import { authRouter } from './routes/auth.routes.js';
import { healthRouter } from './routes/health.routes.js';

export const app = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(express.json({ limit: '10kb' }));

app.use('/health', healthRouter);
app.use('/api/auth', authRouter);

app.use(notFound);
app.use(errorHandler);