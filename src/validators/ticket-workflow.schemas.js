import { z } from 'zod';

export const updateTicketStatusSchema = z
    .object({
        status: z.enum(['IN_PROGRESS', 'RESOLVED']),
    })
    .strict();