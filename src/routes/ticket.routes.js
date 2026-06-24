import { Router } from 'express';
import {
    createTicket,
    getTicketById,
    listTicketHistory,
    listTickets,
    updateTicketStatus,
} from '../controllers/ticket.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorizeRoles } from '../middlewares/authorize-roles.js';
import { validateBody, validateParams } from '../middlewares/validate.js';
import { createTicketSchema, ticketIdParamsSchema } from '../validators/ticket.schemas.js';
import { updateTicketStatusSchema } from '../validators/ticket-workflow.schemas.js';

export const ticketRouter = Router();

ticketRouter.use(authenticate);

ticketRouter.post('/', validateBody(createTicketSchema), createTicket);
ticketRouter.get('/', listTickets);
ticketRouter.get('/:id', validateParams(ticketIdParamsSchema), getTicketById);
ticketRouter.patch(
    '/:id/status',
    authorizeRoles('support'),
    validateParams(ticketIdParamsSchema),
    validateBody(updateTicketStatusSchema),
    updateTicketStatus,
);
ticketRouter.get(
    '/:id/history',
    authorizeRoles('support'),
    validateParams(ticketIdParamsSchema),
    listTicketHistory,
);