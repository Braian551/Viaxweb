import { API_BASE_URL } from '../../../config/env';
import { requestJson } from '../../../config/httpClient';

const SUPPORT_API_URL = `${API_BASE_URL}/support`;

const toQuery = (params) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return;
        query.append(key, String(value));
    });
    return query.toString();
};

export const getSupportCategories = async () => {
    return await requestJson(
        `${SUPPORT_API_URL}/get_categories.php`,
        { method: 'GET', headers: { Accept: 'application/json' } },
        'No se pudieron cargar las categorias de soporte'
    );
};

export const getSupportTickets = async ({ userId, status, priority, assignedTo, search, page = 1, limit = 20 }) => {
    const query = toQuery({


        estado: status,
        prioridad: priority,
        asignado_a: assignedTo,
        search,
        page,
        limit,
    });
    return await requestJson(
        `${SUPPORT_API_URL}/get_tickets.php?${query}`,
        { sessionRequired: true, method: 'GET', headers: { Accept: 'application/json' } },
        'No se pudieron cargar los tickets'
    );
};

export const createSupportTicket = async ({ userId, categoryId, subject, description }) => {
    return await requestJson(
        `${SUPPORT_API_URL}/create_ticket.php`,
        {
            sessionRequired: true, method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({

                categoria_id: categoryId,
                asunto: subject,
                descripcion: description,
            }),
        },
        'No se pudo crear el ticket'
    );
};

export const getSupportTicketMessages = async ({ ticketId }) => {
    const query = toQuery({ ticket_id: ticketId });
    return await requestJson(
        `${SUPPORT_API_URL}/get_ticket_messages.php?${query}`,
        { sessionRequired: true, method: 'POST', headers: { Accept: 'application/json' } },
        'No se pudieron cargar los mensajes del ticket'
    );
};

export const sendSupportMessage = async ({ ticketId, message }) => {
    return await requestJson(
        `${SUPPORT_API_URL}/send_message.php`,
        {
            sessionRequired: true, method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({
                ticket_id: ticketId,


                mensaje: message,
            }),
        },
        'No se pudo enviar el mensaje'
    );
};

export const updateSupportTicket = async ({ ticketId, status, priority, assignedTo }) => {
    return await requestJson(
        `${SUPPORT_API_URL}/update_ticket.php`,
        {
            sessionRequired: true, method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({
                ticket_id: ticketId,

                estado: status,
                prioridad: priority,
                asignado_a: assignedTo,
            }),
        },
        'No se pudo actualizar el ticket'
    );
};

export const getSupportTicketLogs = async ({ ticketId }) => {
    const query = toQuery({ ticket_id: ticketId });
    return await requestJson(
        `${SUPPORT_API_URL}/get_ticket_logs.php?${query}`,
        { sessionRequired: true, method: 'GET', headers: { Accept: 'application/json' } },
        'No se pudo cargar el historial del ticket'
    );
};

export const getUserReports = async ({ status, priority, search, limit = 50 }) => {
    const query = toQuery({

        estado: status,
        prioridad: priority,
        search,
        limit,
    });

    return await requestJson(
        `${API_BASE_URL}/admin/user_reports.php?${query}`,
        { sessionRequired: true, method: 'GET', headers: { Accept: 'application/json' } },
        'No se pudieron cargar los reportes de usuarios'
    );
};

export const updateUserReport = async ({ reportId, action, resolutionNote }) => {
    return await requestJson(
        `${API_BASE_URL}/admin/user_reports.php`,
        {
            sessionRequired: true, method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({

                report_id: reportId,
                action,
                resolution_note: resolutionNote,
            }),
        },
        'No se pudo actualizar el reporte'
    );
};
