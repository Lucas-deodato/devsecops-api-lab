import { db } from '../config/database.js';

const ticketListColumns = [
    'id',
    'title',
    'status',
    'priority',
    'creator_id',
    'assignee_id',
    'category_id',
    'resolved_at',
    'created_at',
    'updated_at',
];

const ticketDetailColumns = [
    'id',
    'title',
    'description',
    'status',
    'priority',
    'creator_id',
    'assignee_id',
    'category_id',
    'resolved_at',
    'created_at',
    'updated_at',
];

function mapTicket(row) {
    if (!row) {
        return null;
    }

    const ticket = {
        id: row.id,
        title: row.title,
        status: row.status,
        priority: row.priority,
        creatorId: row.creator_id,
        assigneeId: row.assignee_id,
        categoryId: row.category_id,
        resolvedAt: row.resolved_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };

    if (row.description !== undefined) {
        ticket.description = row.description;
    }

    return ticket;
}

export async function createTicketRecord({
    id,
    title,
    description,
    priority,
    creatorId,
    categoryId,
}) {
    await db('tickets').insert({
        id,
        title,
        description,
        status: 'OPEN',
        priority,
        creator_id: creatorId,
        assignee_id: null,
        category_id: categoryId,
        resolved_at: null,
    });

    return findTicketById(id);
}

export async function findAllTickets() {
    const rows = await db('tickets').select(ticketListColumns).orderBy('created_at', 'desc');

    return rows.map(mapTicket);
}

export async function findTicketsByCreator(creatorId) {
    const rows = await db('tickets')
        .select(ticketListColumns)
        .where({ creator_id: creatorId })
        .orderBy('created_at', 'desc');

    return rows.map(mapTicket);
}

export async function findTicketById(id, connection = db) {
    const row = await connection('tickets')
        .select(ticketDetailColumns)
        .where({ id })
        .first();

    return mapTicket(row);
}

export async function findTicketByIdAndCreator(id, creatorId) {
    const row = await db('tickets')
        .select(ticketDetailColumns)
        .where({
            id,
            creator_id: creatorId,
        })
        .first();

    return mapTicket(row);
}

export async function updateTicketStatus({
    ticketId,
    status,
    assigneeId,
    resolvedAt,
}, connection = db) {
    await connection('tickets')
        .where({ id: ticketId })
        .update({
            status,
            assignee_id: assigneeId,
            resolved_at: resolvedAt,
            updated_at: new Date().toISOString(),
        });

    return findTicketById(ticketId, connection);
}