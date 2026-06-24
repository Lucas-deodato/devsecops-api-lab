import { z } from 'zod';

const emailSchema = z.string().trim().email().transform((value) => value.toLowerCase());

export const registerSchema = z.object({
        name: z.string().trim().min(2).max(120),
        email: emailSchema,
        password: z.string().min(12).max(72),
    }).strict();

export const loginSchema = z.object({
        email: emailSchema,
        password: z.string().min(1).max(72),
    }).strict();