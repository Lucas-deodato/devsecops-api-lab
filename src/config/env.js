import 'dotenv/config';

const port = Number.parseInt(process.env.PORT ?? '3000', 10);
const jwtSecret = process.env.JWT_SECRET;
const jwtExpiresIn = process.env.JWT_EXPIRES_IN ?? '15m';

if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535');
}

if (!jwtSecret || jwtSecret.length < 32) {
    throw new Error('JWT_SECRET must be defined with at least 32 characters');
}

if (jwtExpiresIn !== '15m') {
    throw new Error('JWT_EXPIRES_IN must be 15m for this project phase');
}

export const env = {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port,
    jwtSecret,
    jwtExpiresIn,
    jwtExpiresInSeconds: 900,
    bcryptRounds: 12,
};