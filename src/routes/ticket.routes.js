import { Router } from 'express';
import {
    createTicket,
    getTicketById,
    listTickets,
} from '../controllers/ticket.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { validateBody, validateParams } from '../middlewares/validate.js';
import { createTicketSchema, ticketIdParamsSchema } from '../validators/ticket.schemas.js';

export const ticketRouter = Router();

ticketRouter.use(authenticate);

ticketRouter.post('/', validateBody(createTicketSchema), createTicket);
ticketRouter.get('/', listTickets);
ticketRouter.get('/:id', validateParams(ticketIdParamsSchema), getTicketById);