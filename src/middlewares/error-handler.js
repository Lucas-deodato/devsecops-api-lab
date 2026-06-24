export function errorHandler(error, _req, res, _next) {
    if (error.isOperational) {
        return res.status(error.statusCode).json({
            error: {
                code: error.code,
                message: error.message,
            },
        });
    }

    console.error(error);

    return res.status(500).json({
        error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'An unexpected error occurred',
        },
    });
}