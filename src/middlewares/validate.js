import { AppError } from '../errors/app-error.js';

export function validateBody(schema) {
    return (req, _res, next) => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            return next(new AppError(400, 'VALIDATION_ERROR', 'Invalid request payload'));
        }

        req.body = result.data;
        return next();
    };
}

// protege valores vindos da URL, como :id.
export function validateParams(schema) {
    return (req, _res, next) => {
        const result = schema.safeParse(req.params);

        if (!result.success) {
            return next(new AppError(400, 'VALIDATION_ERROR', 'Invalid route parameters'));
        }

        req.params = result.data;
        return next();
    };
}