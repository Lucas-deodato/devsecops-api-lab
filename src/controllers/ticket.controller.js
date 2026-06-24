import {
    createTicketForUser,
    getTicketForUser,
    listTicketsForUser,
} from '../services/ticket.service.js';
import {
    listTicketHistoryForSupport,
    updateTicketStatusForSupport,
} from '../services/ticket-workflow.service.js';

export async function createTicket(req, res) {
    const ticket = await createTicketForUser(req.user, req.body);

    return res.status(201).json({ ticket });
}

export async function listTickets(req, res) {
    const tickets = await listTicketsForUser(req.user);

    return res.status(200).json({ tickets });
}

export async function getTicketById(req, res) {
    const ticket = await getTicketForUser(req.user, req.params.id);

    return res.status(200).json({ ticket });
}

export async function updateTicketStatus(req, res) {
    const ticket = await updateTicketStatusForSupport({
        ticketId: req.params.id,
        actor: req.user,
        nextStatus: req.body.status,
    });

    return res.status(200).json({ ticket });
}

export async function listTicketHistory(req, res) {
    const history = await listTicketHistoryForSupport(req.params.id);

    return res.status(200).json({ history });
}