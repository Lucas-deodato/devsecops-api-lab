import { db } from '../config/database.js';

const historyColumns = [
    'id',
    'ticket_id',
    'actor_id',
    'action',
    'old_value',
    'new_value',
    'created_at',
];

function mapHistory(row) {
    return {
        id: row.id,
        ticketId: row.ticket_id,
        actorId: row.actor_id,
        action: row.action,
        oldValue: row.old_value,
        newValue: row.new_value,
        createdAt: row.created_at,
    };
}

export async function createTicketHistoryRecord({
    id,
    ticketId,
    actorId,
    action,
    oldValue,
    newValue,
}, connection = db) {
    await connection('ticket_history').insert({
        id,
        ticket_id: ticketId,
        actor_id: actorId,
        action,
        old_value: oldValue,
        new_value: newValue,
    });
}

export async function listTicketHistory(ticketId, connection = db) {
    const rows = await connection('ticket_history')
        .select(historyColumns)
        .where({ ticket_id: ticketId })
        .orderBy('created_at', 'asc');

    return rows.map(mapHistory);
}