import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import { env } from '../config/env.js';
import { AppError } from '../errors/app-error.js';
import { createUser, findPublicUserById, findUserByEmail } from '../models/user.model.js';
import { signAccessToken } from '../utils/jwt.js';

function isUniqueEmailViolation(error) {
    return (
        error.code === 'SQLITE_CONSTRAINT_UNIQUE' ||
        error.message?.includes('UNIQUE constraint failed: users.email')
    )
}

export async function registerUser({ name, email, password }) {
    const existingUser = await findUserByEmail(email)

    // possível enumeração de usuários
    if (existingUser) {
        throw new AppError(409, 'EMAIL_ALREADY_EXISTS', 'Email already exists')
    }

    const passwordHash = await bcrypt.hash(password, env.bcryptRounds);

    try {
        return await createUser({
            id: randomUUID(),
            name,
            email,
            passwordHash,
            role: 'employee',
        });
    } catch (error) {
        if (isUniqueEmailViolation(error)) {
            throw new AppError(409, 'EMAIL_ALREADY_EXISTS', 'Email already exists');
        }

        throw error;
    }
}

export async function loginUser({ email, password }) {
    const user = await findUserByEmail(email);

    if (!user) {
        throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches) {
        throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    return {
        accessToken: signAccessToken(user),
        tokenType: 'Bearer',
        expiresIn: env.jwtExpiresInSeconds,
    };
}

export async function getCurrentUser(userId) {
    const user = await findPublicUserById(userId);

    if (!user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
    }

    return user;
}