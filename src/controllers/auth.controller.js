import { getCurrentUser, loginUser, registerUser } from '../services/auth.service.js';

export async function register(req, res) {
    const user = await registerUser(req.body);

    return res.status(201).json({ user });
}

export async function login(req, res) {
    const token = await loginUser(req.body);

    return res.status(200).json(token);
}

export async function me(req, res) {
    const user = await getCurrentUser(req.user.id);

    return res.status(200).json({ user });
}