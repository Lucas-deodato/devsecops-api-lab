import { z } from 'zod';

const uuidSchema = z.string().uuid();

export const createTicketSchema = z
    .object({
        title: z.string().trim().min(5).max(150),
        description: z.string().trim().min(10).max(5000),
        priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
        categoryId: uuidSchema,
    }).strict();

export const ticketIdParamsSchema = z
    .object({
        id: uuidSchema,
    }).strict();