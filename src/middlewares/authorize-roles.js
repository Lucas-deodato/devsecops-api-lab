import { AppError } from '../errors/app-error.js';

export function authorizeRoles(...allowedRoles) {
    return (req, _res, next) => {
        if (!req.user) {
            return next(new AppError(401, 'UNAUTHORIZED', 'Authentication required'));
        }

        if (!allowedRoles.includes(req.user.role)) {
            return next(new AppError(403, 'FORBIDDEN', 'Insufficient permissions'));
        }

        return next();
    };
}