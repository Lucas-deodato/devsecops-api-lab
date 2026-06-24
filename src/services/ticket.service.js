import { randomUUID } from 'node:crypto';
import { AppError } from '../errors/app-error.js';
import {
    createTicketRecord,
    findAllTickets,
    findTicketById,
    findTicketByIdAndCreator,
    findTicketsByCreator,
} from '../models/ticket.model.js';

function isForeignKeyViolation(error) {
    return (
        error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY' ||
        error.message?.includes('FOREIGN KEY constraint failed')
    );
}

export async function createTicketForUser(user, input) {
    try {
        return await createTicketRecord({
            id: randomUUID(),
            title: input.title,
            description: input.description,
            priority: input.priority,
            creatorId: user.id,
            categoryId: input.categoryId,
        });
    } catch (error) {
        if (isForeignKeyViolation(error)) {
            throw new AppError(400, 'INVALID_CATEGORY', 'Invalid category');
        }

        throw error;
    }
}

export async function listTicketsForUser(user) {
    if (user.role === 'support') {
        return findAllTickets();
    }

    return findTicketsByCreator(user.id);
}

export async function getTicketForUser(user, ticketId) {
    const ticket = user.role === 'support'
        ? await findTicketById(ticketId)
        : await findTicketByIdAndCreator(ticketId, user.id);

    if (!ticket) {
        throw new AppError(404, 'TICKET_NOT_FOUND', 'Ticket not found');
    }

    return ticket;
}