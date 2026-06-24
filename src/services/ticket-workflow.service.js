import { randomUUID } from 'node:crypto';
import { db } from '../config/database.js';
import { AppError } from '../errors/app-error.js';
import { createTicketHistoryRecord, listTicketHistory } from '../models/ticket-history.model.js';
import { findTicketById, updateTicketStatus } from '../models/ticket.model.js';

const allowedStatusTransitions = {
    OPEN: ['IN_PROGRESS', 'RESOLVED'],
    IN_PROGRESS: ['RESOLVED'],
    RESOLVED: [],
};

function canTransition(currentStatus, nextStatus) {
    return allowedStatusTransitions[currentStatus]?.includes(nextStatus) ?? false;
}

export async function updateTicketStatusForSupport({ ticketId, actor, nextStatus }) {
    return db.transaction(async (trx) => {
        const currentTicket = await findTicketById(ticketId, trx);

        if (!currentTicket) {
            throw new AppError(404, 'TICKET_NOT_FOUND', 'Ticket not found');
        }

        if (!canTransition(currentTicket.status, nextStatus)) {
            throw new AppError(409, 'INVALID_STATUS_TRANSITION', 'Invalid ticket status transition');
        }

        const resolvedAt = nextStatus === 'RESOLVED'
            ? new Date().toISOString()
            : currentTicket.resolvedAt;

        const assigneeId = nextStatus === 'IN_PROGRESS' || !currentTicket.assigneeId
            ? actor.id
            : currentTicket.assigneeId;

        const updatedTicket = await updateTicketStatus({
            ticketId,
            status: nextStatus,
            assigneeId,
            resolvedAt,
        }, trx);

        await createTicketHistoryRecord({
            id: randomUUID(),
            ticketId,
            actorId: actor.id,
            action: 'STATUS_CHANGED',
            oldValue: currentTicket.status,
            newValue: nextStatus,
        }, trx);

        return updatedTicket;
    });
}

export async function listTicketHistoryForSupport(ticketId) {
    const ticket = await findTicketById(ticketId);

    if (!ticket) {
        throw new AppError(404, 'TICKET_NOT_FOUND', 'Ticket not found');
    }

    return listTicketHistory(ticketId);
}