import { db } from '../config/database.js';

const publicUserColumns = ['id', 'name', 'email', 'role'];

export async function findUserByEmail(email) {
    return db('users').where({ email }).first();
}

export async function findPublicUserById(id) {
    return db('users').select(publicUserColumns).where({ id }).first();
}

export async function createUser({ id, name, email, passwordHash, role }) {
    await db('users').insert({
        id,
        name,
        email,
        password_hash: passwordHash,
        role,
    });

    return findPublicUserById(id);
}