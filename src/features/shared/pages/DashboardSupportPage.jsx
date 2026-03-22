import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FiAlertCircle, FiLifeBuoy, FiMessageCircle, FiPlusCircle, FiSend } from 'react-icons/fi';
import { useAuth } from '../../auth/context/AuthContext';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import { useSnackbar } from '../components/AppSnackbar';
import {
    createSupportTicket,
    getSupportCategories,
    getUserReports,
    getSupportTicketLogs,
    getSupportTicketMessages,
    getSupportTickets,
    sendSupportMessage,
    updateUserReport,
    updateSupportTicket,
} from '../services/supportService';
import './DashboardSupportPage.css';

const ROLE_LABELS = {
    admin: 'Administracion',
    soporte_tecnico: 'Soporte Tecnico',
    empresa: 'Empresa',
    conductor: 'Conductor',
    cliente: 'Cliente',
};

const STATUS_OPTIONS = [
    { value: '', label: 'Todos los estados' },
    { value: 'abierto', label: 'Abierto' },
    { value: 'en_progreso', label: 'En progreso' },
    { value: 'esperando_usuario', label: 'Esperando usuario' },
    { value: 'resuelto', label: 'Resuelto' },
    { value: 'cerrado', label: 'Cerrado' },
];

const PRIORITY_OPTIONS = [
    { value: '', label: 'Todas las prioridades' },
    { value: 'baja', label: 'Baja' },
    { value: 'normal', label: 'Normal' },
    { value: 'alta', label: 'Alta' },
    { value: 'urgente', label: 'Urgente' },
];

const getUserId = (user) => {
    if (!user) return null;
    return user.id || user.usuario_id || user.user_id || null;
};

const statusLabel = (status) => {
    if (status === 'abierto') return 'Abierto';
    if (status === 'en_progreso') return 'En progreso';
    if (status === 'esperando_usuario') return 'Esperando respuesta';
    if (status === 'resuelto') return 'Resuelto';
    if (status === 'cerrado') return 'Cerrado';
    return status || 'Sin estado';
};

const formatColombiaDateTime = (dateValue, { withDate = false } = {}) => {
    if (!dateValue) return '';
    const raw = String(dateValue).trim();
    const hasTimezone = /([zZ]|[+-]\d{2}:?\d{2})$/.test(raw);
    const normalized = hasTimezone
        ? raw
        : raw.replace(' ', 'T') + 'Z';
    const date = new Date(normalized);
    if (Number.isNaN(date.getTime())) return '';

    const formatter = new Intl.DateTimeFormat('es-CO', {
        timeZone: 'America/Bogota',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        ...(withDate
            ? { day: '2-digit', month: '2-digit', year: 'numeric' }
            : {}),
    });

    return formatter.format(date).replace('a. m.', 'AM').replace('p. m.', 'PM');
};

const DashboardSupportPage = ({ roleType = 'cliente' }) => {
    const { user } = useAuth();
    const { showSnackbar } = useSnackbar();
    const userId = useMemo(() => getUserId(user), [user]);
    const isAgentMode = roleType === 'soporte_tecnico' || roleType === 'admin';

    const [categories, setCategories] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [agents, setAgents] = useState([]);
    const [ticketLogs, setTicketLogs] = useState([]);
    const [userReports, setUserReports] = useState([]);
    const [reportSummary, setReportSummary] = useState({});
    const [selectedTicketId, setSelectedTicketId] = useState(null);
    const [messages, setMessages] = useState([]);

    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [isUpdatingTicket, setIsUpdatingTicket] = useState(false);
    const [isLoadingReports, setIsLoadingReports] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [isSending, setIsSending] = useState(false);

    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [assignedFilter, setAssignedFilter] = useState('');

    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [replyMessage, setReplyMessage] = useState('');
    const [agentStatus, setAgentStatus] = useState('');
    const [agentPriority, setAgentPriority] = useState('');
    const [agentAssignedTo, setAgentAssignedTo] = useState('');
    const chatBoxRef = useRef(null);

    const selectedTicket = useMemo(
        () => tickets.find((item) => String(item.id) === String(selectedTicketId)) || null,
        [tickets, selectedTicketId]
    );

    const loadInitial = async ({ silent = false } = {}) => {
        if (!userId) return;
        if (!silent) {
            setIsLoading(true);
        }

        if (isAgentMode) {
            setIsLoadingReports(true);
        }

        const [categoriesRes, ticketsRes, reportsRes] = await Promise.all([
            isAgentMode ? Promise.resolve({ success: true, categorias: [] }) : getSupportCategories(),
            getSupportTickets({
                userId: isAgentMode ? undefined : userId,
                agentId: isAgentMode ? userId : undefined,
                status: statusFilter,
                priority: priorityFilter,
                assignedTo: isAgentMode ? assignedFilter : undefined,
                search: isAgentMode ? searchText : undefined,
            }),
            isAgentMode
                ? getUserReports({
                    actorId: userId,
                    search: searchText,
                    limit: 30,
                })
                : Promise.resolve({ success: true, data: { reportes: [], resumen: {} } }),
        ]);

        if (categoriesRes?.success) {
            const incomingCategories = categoriesRes.categorias || [];
            setCategories(incomingCategories);
            if (incomingCategories.length && !categoryId) {
                setCategoryId(String(incomingCategories[0].id));
            }
        }

        if (ticketsRes?.success) {
            const incomingTickets = ticketsRes.tickets || [];
            setTickets(incomingTickets);
            setAgents(ticketsRes.agentes || []);
            if (incomingTickets.length && !selectedTicketId) {
                setSelectedTicketId(incomingTickets[0].id);
            }
            if (!incomingTickets.length) {
                setSelectedTicketId(null);
            }
        }

        if (isAgentMode) {
            if (reportsRes?.success) {
                const data = reportsRes.data || {};
                setUserReports(Array.isArray(data.reportes) ? data.reportes : []);
                setReportSummary(data.resumen || {});
            } else {
                setUserReports([]);
                setReportSummary({});
            }
            setIsLoadingReports(false);
        }

        if ((!categoriesRes?.success || !ticketsRes?.success) && !silent) {
            showSnackbar('No se pudo cargar por completo el soporte. Intenta de nuevo.', { type: 'error' });
        }
        if (!silent) {
            setIsLoading(false);
        }
    };

    const loadMessages = async (ticketId, { silent = false } = {}) => {
        if (!ticketId || !userId) return;
        if (!silent) {
            setIsLoadingMessages(true);
        }
        const res = await getSupportTicketMessages({
            ticketId,
            userId: isAgentMode ? undefined : userId,
            agentId: isAgentMode ? userId : undefined,
        });
        if (res?.success) {
            setMessages(res.mensajes || []);
        } else {
            setMessages([]);
            if (!silent) {
                showSnackbar('No se pudieron cargar los mensajes del ticket.', { type: 'error' });
            }
        }
        if (!silent) {
            setIsLoadingMessages(false);
        }
    };

    useEffect(() => {
        loadInitial();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId, statusFilter, priorityFilter, assignedFilter]);

    useEffect(() => {
        if (!userId) return undefined;

        const interval = setInterval(() => {
            loadInitial({ silent: true });
        }, 7000);

        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId, statusFilter, priorityFilter, assignedFilter, searchText, isAgentMode]);

    useEffect(() => {
        if (!isAgentMode) return;
        const timer = setTimeout(() => {
            loadInitial();
        }, 400);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchText, isAgentMode]);

    useEffect(() => {
        if (!selectedTicketId) {
            setMessages([]);
            setTicketLogs([]);
            return;
        }
        loadMessages(selectedTicketId);
        if (isAgentMode) {
            getSupportTicketLogs({ ticketId: selectedTicketId, agentId: userId }).then((res) => {
                setTicketLogs(res?.success ? (res.logs || []) : []);
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedTicketId, isAgentMode]);

    useEffect(() => {
        if (!selectedTicketId || !userId) return undefined;

        const interval = setInterval(() => {
            loadMessages(selectedTicketId, { silent: true });
            if (isAgentMode) {
                getSupportTicketLogs({ ticketId: selectedTicketId, agentId: userId }).then((res) => {
                    setTicketLogs(res?.success ? (res.logs || []) : []);
                });
            }
        }, 4000);

        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedTicketId, userId, isAgentMode]);

    useEffect(() => {
        if (!chatBoxRef.current) return;
        chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }, [messages, selectedTicketId]);

    useEffect(() => {
        if (!selectedTicket) {
            setAgentStatus('');
            setAgentPriority('');
            setAgentAssignedTo('');
            return;
        }

        setAgentStatus(selectedTicket.estado || 'abierto');
        setAgentPriority(selectedTicket.prioridad || 'normal');
        setAgentAssignedTo(selectedTicket.agente_id ? String(selectedTicket.agente_id) : '');
    }, [selectedTicket]);

    const handleCreateTicket = async (event) => {
        event.preventDefault();
        if (!userId || !categoryId || !subject.trim()) {
            showSnackbar('Completa categoria y asunto para crear el ticket.', { type: 'warning' });
            return;
        }

        setIsCreating(true);
        const res = await createSupportTicket({
            userId,
            categoryId: Number(categoryId),
            subject: subject.trim(),
            description: description.trim(),
        });
        setIsCreating(false);

        if (!res?.success) {
            showSnackbar(res?.error || 'No se pudo crear el ticket.', { type: 'error' });
            return;
        }

        setSubject('');
        setDescription('');
        await loadInitial();
        showSnackbar('Ticket creado correctamente.', { type: 'success' });
    };

    const handleSendMessage = async (event) => {
        event.preventDefault();
        if (!selectedTicket || !replyMessage.trim()) return;

        setIsSending(true);
        const res = await sendSupportMessage({
            ticketId: selectedTicket.id,
            userId: isAgentMode ? undefined : userId,
            agentId: isAgentMode ? userId : undefined,
            message: replyMessage.trim(),
        });
        setIsSending(false);

        if (!res?.success) {
            showSnackbar(res?.error || 'No se pudo enviar el mensaje.', { type: 'error' });
            return;
        }

        setReplyMessage('');
        await loadMessages(selectedTicket.id);
        await loadInitial();
    };

    const handleAgentTicketUpdate = async () => {
        if (!isAgentMode || !selectedTicket) return;

        setIsUpdatingTicket(true);
        const response = await updateSupportTicket({
            ticketId: selectedTicket.id,
            agentId: userId,
            status: agentStatus,
            priority: agentPriority,
            assignedTo: agentAssignedTo || '',
        });
        setIsUpdatingTicket(false);

        if (!response?.success) {
            showSnackbar(response?.error || 'No se pudo actualizar el ticket.', { type: 'error' });
            return;
        }

        showSnackbar('Ticket actualizado correctamente.', { type: 'success' });
        await loadInitial();
        await loadMessages(selectedTicket.id);
        const logsRes = await getSupportTicketLogs({ ticketId: selectedTicket.id, agentId: userId });
        setTicketLogs(logsRes?.success ? (logsRes.logs || []) : []);
    };

    const handleUserReportAction = async (reportId, action) => {
        const response = await updateUserReport({
            actorId: userId,
            reportId,
            action,
        });

        if (!response?.success) {
            showSnackbar(response?.error || response?.message || 'No se pudo actualizar el reporte.', { type: 'error' });
            return;
        }

        showSnackbar('Reporte actualizado correctamente.', { type: 'success' });
        await loadInitial({ silent: true });
    };

    return (
        <div className="v-dashboard">
            <PageHeader
                title="Centro de Soporte"
                subtitle={isAgentMode
                    ? 'Bandeja operativa para gestionar solicitudes y responder tickets.'
                    : `Gestiona tickets y chat de soporte para ${ROLE_LABELS[roleType] || 'tu cuenta'}`}
            />

            {isLoading ? (
                <div className="glass-card support-loading">
                    <FiLifeBuoy size={28} /> Cargando soporte...
                </div>
            ) : (
                <div className="support-grid">
                    <section className="glass-card support-panel">
                        {!isAgentMode && (
                            <>
                                <h3 className="support-title"><FiPlusCircle /> Crear ticket</h3>
                                <form className="support-form" onSubmit={handleCreateTicket}>
                                    <label>
                                        Categoria
                                        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                                            {categories.map((category) => (
                                                <option key={category.id} value={category.id}>{category.nombre}</option>
                                            ))}
                                        </select>
                                    </label>
                                    <label>
                                        Asunto
                                        <input
                                            value={subject}
                                            onChange={(e) => setSubject(e.target.value)}
                                            placeholder="Ej: Cobro duplicado en viaje"
                                            maxLength={160}
                                        />
                                    </label>
                                    <label>
                                        Descripcion
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Describe el problema y agrega datos utiles."
                                            rows={4}
                                            maxLength={1000}
                                        />
                                    </label>
                                    <button type="submit" className="btn btn--primary" disabled={isCreating}>
                                        {isCreating ? 'Creando...' : 'Crear ticket'}
                                    </button>
                                </form>
                            </>
                        )}

                        {isAgentMode && (
                            <div className="support-agent-filters">
                                <h3 className="support-title"><FiLifeBuoy /> Filtros operativos</h3>
                                <label>
                                    Buscar
                                    <input
                                        value={searchText}
                                        onChange={(e) => setSearchText(e.target.value)}
                                        placeholder="Ticket, asunto, usuario o email"
                                    />
                                </label>
                                <label>
                                    Estado
                                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                        {STATUS_OPTIONS.map((option) => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                </label>
                                <label>
                                    Prioridad
                                    <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
                                        {PRIORITY_OPTIONS.map((option) => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                </label>
                                <label>
                                    Asignacion
                                    <select value={assignedFilter} onChange={(e) => setAssignedFilter(e.target.value)}>
                                        <option value="">Todos</option>
                                        <option value="sin_asignar">Sin asignar</option>
                                        <option value="yo">Asignados a mi</option>
                                        {agents.map((agent) => (
                                            <option key={agent.id} value={agent.id}>
                                                {agent.nombre} {agent.apellido}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </div>
                        )}

                        <div className="support-ticket-list">
                            <h3 className="support-title"><FiLifeBuoy /> {isAgentMode ? 'Bandeja de tickets' : 'Mis tickets'}</h3>
                            {tickets.length === 0 ? (
                                <EmptyState
                                    icon={<FiAlertCircle size={34} />}
                                    title="Aun sin tickets"
                                    description={isAgentMode ? 'No hay tickets con los filtros actuales.' : 'Crea un ticket para iniciar conversacion con soporte.'}
                                />
                            ) : (
                                tickets.map((ticket) => (
                                    <button
                                        key={ticket.id}
                                        className={`support-ticket-item ${String(ticket.id) === String(selectedTicketId) ? 'active' : ''}`}
                                        onClick={() => setSelectedTicketId(ticket.id)}
                                    >
                                        <div className="support-ticket-item__top">
                                            <span className="support-ticket-number">{ticket.numero_ticket}</span>
                                            <span className={`support-ticket-state state-${ticket.estado || 'abierto'}`}>
                                                {statusLabel(ticket.estado)}
                                            </span>
                                        </div>
                                        <div className="support-ticket-subject">{ticket.asunto}</div>
                                        {isAgentMode && (
                                            <div className="support-ticket-subject">
                                                {ticket.usuario_nombre} {ticket.usuario_apellido} - {ticket.usuario_email}
                                            </div>
                                        )}
                                    </button>
                                ))
                            )}
                        </div>

                        {isAgentMode && (
                            <div className="support-ticket-list" style={{ marginTop: 16 }}>
                                <h3 className="support-title"><FiAlertCircle /> Reportes de usuarios</h3>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 10 }}>
                                    Pendientes: {Number(reportSummary?.pendientes || 0)} • En revisión: {Number(reportSummary?.en_revision || 0)}
                                </div>
                                {isLoadingReports ? (
                                    <div className="support-chat-loading">Cargando reportes...</div>
                                ) : userReports.length === 0 ? (
                                    <EmptyState
                                        icon={<FiAlertCircle size={34} />}
                                        title="Sin reportes"
                                        description="No hay reportes de usuarios en este momento."
                                    />
                                ) : (
                                    userReports.map((report) => (
                                        <div key={report.id} className="support-ticket-item" style={{ cursor: 'default' }}>
                                            <div className="support-ticket-item__top">
                                                <span className="support-ticket-number">Reporte #{report.id}</span>
                                                <span className={`support-ticket-state state-${report.estado || 'pendiente'}`}>
                                                    {statusLabel(report.estado)}
                                                </span>
                                            </div>
                                            <div className="support-ticket-subject" style={{ marginBottom: 4 }}>
                                                Motivo: {String(report.motivo || 'otro').replaceAll('_', ' ')}
                                            </div>
                                            <div className="support-ticket-subject">
                                                Reporta: {report.reporter_nombre} {report.reporter_apellido} • Reportado: {report.reported_nombre} {report.reported_apellido}
                                            </div>
                                            {report.descripcion && (
                                                <div className="support-ticket-subject" style={{ marginTop: 6 }}>
                                                    {report.descripcion}
                                                </div>
                                            )}
                                            <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                                                <button type="button" className="btn btn--outline" onClick={() => handleUserReportAction(report.id, 'start_review')}>
                                                    En revisión
                                                </button>
                                                <button type="button" className="btn btn--outline" onClick={() => handleUserReportAction(report.id, 'resolve')}>
                                                    Resolver
                                                </button>
                                                <button type="button" className="btn btn--outline" onClick={() => handleUserReportAction(report.id, 'dismiss')}>
                                                    Descartar
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </section>

                    <section className="glass-card support-panel">
                        <h3 className="support-title"><FiMessageCircle /> Chat del ticket</h3>
                        {!selectedTicket ? (
                            <EmptyState
                                icon={<FiMessageCircle size={34} />}
                                title="Selecciona un ticket"
                                description="Cuando selecciones un ticket, veras los mensajes aqui."
                            />
                        ) : (
                            <>
                                <div className="support-ticket-meta">
                                    <div>
                                        <strong>{selectedTicket.numero_ticket}</strong>
                                        <p>{selectedTicket.asunto}</p>
                                        {isAgentMode && (
                                            <p>
                                                Usuario: {selectedTicket.usuario_nombre} {selectedTicket.usuario_apellido}
                                            </p>
                                        )}
                                    </div>
                                    <span className={`support-ticket-state state-${selectedTicket.estado || 'abierto'}`}>
                                        {statusLabel(selectedTicket.estado)}
                                    </span>
                                </div>

                                {isAgentMode && (
                                    <div className="support-agent-actions">
                                        <label>
                                            Estado
                                            <select value={agentStatus} onChange={(e) => setAgentStatus(e.target.value)}>
                                                {STATUS_OPTIONS.filter((item) => item.value !== '').map((option) => (
                                                    <option key={option.value} value={option.value}>{option.label}</option>
                                                ))}
                                            </select>
                                        </label>
                                        <label>
                                            Prioridad
                                            <select value={agentPriority} onChange={(e) => setAgentPriority(e.target.value)}>
                                                {PRIORITY_OPTIONS.filter((item) => item.value !== '').map((option) => (
                                                    <option key={option.value} value={option.value}>{option.label}</option>
                                                ))}
                                            </select>
                                        </label>
                                        <label>
                                            Asignado a
                                            <select value={agentAssignedTo} onChange={(e) => setAgentAssignedTo(e.target.value)}>
                                                <option value="">Sin asignar</option>
                                                {agents.map((agent) => (
                                                    <option key={agent.id} value={agent.id}>
                                                        {agent.nombre} {agent.apellido}
                                                    </option>
                                                ))}
                                            </select>
                                        </label>
                                        <button type="button" className="btn btn--primary" disabled={isUpdatingTicket} onClick={handleAgentTicketUpdate}>
                                            {isUpdatingTicket ? 'Guardando...' : 'Guardar cambios'}
                                        </button>
                                    </div>
                                )}

                                <div className="support-chat-box" ref={chatBoxRef}>
                                    {isLoadingMessages ? (
                                        <div className="support-chat-loading">Cargando mensajes...</div>
                                    ) : messages.length === 0 ? (
                                        <div className="support-chat-loading">Sin mensajes todavia.</div>
                                    ) : (
                                        messages.map((message) => (
                                            <div key={message.id} className={`support-bubble ${message.es_agente ? 'agent' : 'user'}`}>
                                                <div className="support-bubble-author">
                                                    {message.es_agente
                                                        ? `${message.remitente_nombre || 'Agente'} ${message.remitente_apellido || ''}`.trim()
                                                        : `${message.remitente_nombre || 'Usuario'} ${message.remitente_apellido || ''}`.trim()}
                                                </div>
                                                <div>{message.mensaje}</div>
                                                <div className="support-bubble-time">{formatColombiaDateTime(message.created_at)}</div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <form className="support-reply-form" onSubmit={handleSendMessage}>
                                    <input
                                        value={replyMessage}
                                        onChange={(e) => setReplyMessage(e.target.value)}
                                        placeholder="Escribe tu mensaje..."
                                        maxLength={1000}
                                    />
                                    <button
                                        type="submit"
                                        className="btn btn--primary"
                                        disabled={isSending || !replyMessage.trim()}
                                    >
                                        <FiSend /> {isSending ? 'Enviando...' : 'Enviar'}
                                    </button>
                                </form>

                                {isAgentMode && (
                                    <div className="support-log-panel">
                                        <h4>Historial del ticket</h4>
                                        {ticketLogs.length === 0 ? (
                                            <p>Sin movimientos registrados.</p>
                                        ) : (
                                            <div className="support-log-list">
                                                {ticketLogs.slice(-10).reverse().map((logItem) => (
                                                    <div key={logItem.id} className="support-log-item">
                                                        <strong>{logItem.accion}</strong>
                                                        <span>
                                                            {logItem.actor_nombre || 'Sistema'} {logItem.actor_apellido || ''}
                                                        </span>
                                                        <small>{formatColombiaDateTime(logItem.created_at, { withDate: true })}</small>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </section>
                </div>
            )}
        </div>
    );
};

export default DashboardSupportPage;
