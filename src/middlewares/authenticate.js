import { AppError } from '../errors/app-error.js';
import { getCurrentUser } from '../services/auth.service.js';
import { verifyAccessToken } from '../utils/jwt.js';

// obtém o token na request
function extractBearerToken(authorizationHeader) {
    if (!authorizationHeader?.startsWith('Bearer ')) {
        return null;
    }

    const token = authorizationHeader.slice('Bearer '.length).trim();
    return token || null;
}

export async function authenticate(req, _res, next) {
    const token = extractBearerToken(req.get('authorization'));

    if (!token) {
        return next(new AppError(401, 'UNAUTHORIZED', 'Authentication required'));
    }

    try {
        const payload = verifyAccessToken(token);

        if (typeof payload === 'string' || !payload.sub) {
            throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
        }

        req.user = await getCurrentUser(payload.sub);
        return next();
    } catch {
        return next(new AppError(401, 'UNAUTHORIZED', 'Authentication required'));
    }
}