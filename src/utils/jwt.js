import jwt from 'jsonwebtoken'
import { env } from '../config/env.js';

const jwtIssuer = 'helpdesk-secure-api';
const jwtAudience = 'helpdesk-secure-api-users';
const jwtAlgorithm = 'HS256';

export function signAccessToken(user) {
    return jwt.sign(
        {
            role: user.role,
        },
        env.jwtSecret,
        {
            subject: user.id,
            expiresIn: env.jwtExpiresIn,
            issuer: jwtIssuer,
            audience: jwtAudience,
            algorithm: jwtAlgorithm,
        },
    );
}

export function verifyAccessToken(token) {
    return jwt.verify(token, env.jwtSecret, {
        algorithms: [jwtAlgorithm],
        issuer: jwtIssuer,
        audience: jwtAudience,
    })
}