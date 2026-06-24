import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { login, me, register } from '../controllers/auth.controller.js';
import { AppError } from '../errors/app-error.js';
import { authenticate } from '../middlewares/authenticate.js';
import { validateBody } from '../middlewares/validate.js';
import { loginSchema, registerSchema } from '../validators/auth.schemas.js';

export const authRouter = Router();

const loginRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, _res, next) => {
        next(new AppError(429, 'TOO_MANY_REQUESTS', 'Too many login attempts. Try again later'));
    },
});

authRouter.post('/register', validateBody(registerSchema), register);
authRouter.post('/login', loginRateLimiter, validateBody(loginSchema), login);
authRouter.get('/me', authenticate, me);