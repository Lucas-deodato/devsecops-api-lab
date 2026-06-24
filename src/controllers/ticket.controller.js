import {
    createTicketForUser,
    getTicketForUser,
    listTicketsForUser,
} from '../services/ticket.service.js';

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