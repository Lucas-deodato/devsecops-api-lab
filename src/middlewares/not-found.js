import { AppError } from '../errors/app-error.js';

export function notFound(req, _res, next) {
    next(new AppError(404, 'ROUTE_NOT_FOUND', `Route ${req.method} ${req.originalUrl} not found`));
}