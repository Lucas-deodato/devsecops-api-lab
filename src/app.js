import express from 'express';
import helmet from 'helmet';
import { healthRouter } from './routes/health.routes.js';

export const app = express()

app.disable('x-powered-by')
app.use(helmet())
app.use(express.json({ limit: '10kb' }))

app.use('/health', healthRouter)