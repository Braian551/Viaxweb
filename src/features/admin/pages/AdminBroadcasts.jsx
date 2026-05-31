import React, { useEffect, useState } from 'react';
import {
    FiAlertTriangle,
    FiBell,
    FiClock,
    FiEdit2,
    FiLayers,
    FiPlus,
    FiRefreshCw,
    FiSave,
    FiSend,
    FiShield,
    FiTrash2,
    FiZap,
} from 'react-icons/fi';
import { useAuth } from '../../auth/context/AuthContext';
import {
    createPushCampaign,
    deletePushCampaign,
    getAppConfig,
    getCompanies,
    getPushCampaigns,
    updateAppConfig,
    updatePushCampaign,
} from '../services/adminService';
import { useSnackbar } from '../../shared/components/AppSnackbar';
import EmptyState from '../../shared/components/EmptyState';
import PageHeader from '../../shared/components/PageHeader';
import { ShimmerCardGrid } from '../../shared/components/ShimmerLoader';
import './AdminBroadcasts.css';

const ANNOUNCEMENT_TYPES = [
    { value: 'notice', label: 'Aviso' },
    { value: 'maintenance', label: 'Mantenimiento' },
    { value: 'promotion', label: 'Promoción' },
    { value: 'update', label: 'Actualización' },
];

const PRESENTATION_OPTIONS = [
    { value: 'modal', label: 'Modal informativo' },
    { value: 'blockingSplash', label: 'Bloqueo total de la app' },
    { value: 'onboarding', label: 'Pantalla destacada' },
];

const DISPLAY_MODE_OPTIONS = [
    { value: 'once', label: 'Solo una vez' },
    { value: 'perVersion', label: 'Una vez por versión' },
    { value: 'cooldown', label: 'Repetir por enfriamiento' },
];

const ROLE_OPTIONS = [
    { value: 'all', label: 'Todos' },
    { value: 'client', label: 'Clientes' },
    { value: 'conductor', label: 'Conductores' },
    { value: 'company', label: 'Empresas' },
    { value: 'admin', label: 'Admins' },
    { value: 'support', label: 'Soporte' },
];

const ICON_OPTIONS = [
    { value: 'info', label: 'Información' },
    { value: 'alert', label: 'Alerta' },
    { value: 'maintenance', label: 'Mantenimiento' },
    { value: 'promo', label: 'Promoción' },
    { value: 'update', label: 'Actualización' },
];

const CAMPAIGN_ROLE_OPTIONS = [
    { value: 'todos', label: 'Todos' },
    { value: 'cliente', label: 'Clientes' },
    { value: 'conductor', label: 'Conductores' },
    { value: 'empresa', label: 'Empresas' },
    { value: 'admin', label: 'Admins' },
    { value: 'soporte', label: 'Soporte' },
];

const CAMPAIGN_TYPE_OPTIONS = [
    { value: 'engagement', label: 'Engagement' },
    { value: 'promocion', label: 'Promoción' },
    { value: 'recordatorio', label: 'Recordatorio' },
    { value: 'sistema', label: 'Sistema' },
];

const createAnnouncementForm = () => ({
    id: '',
    title: '',
    message: '',
    badge: 'Aviso app',
    type: 'notice',
    presentation: 'modal',
    dismissible: true,
    enabled: true,
    priority: 100,
    roles: ['all'],
    companyIds: '',
    icon: 'info',
    primaryButtonLabel: 'Entendido',
    versionToken: `panel-${Date.now()}`,
    displayMode: 'once',
    remindAfterHours: '24',
    bulletPoints: '',
});

const createCampaignForm = () => ({
    id: null,
    titulo: '',
    mensaje: '',
    rol: 'todos',
    empresa_id: '',
    activo: true,
    hora_envio: '',
    fecha_inicio: '',
    fecha_fin: '',
    tipo: 'engagement',
    timezone_name: 'America/Bogota',
});

const sortAnnouncements = (items) => {
    return [...items].sort((left, right) => {
        const rightPriority = Number(right?.priority || 0);
        const leftPriority = Number(left?.priority || 0);
        return rightPriority - leftPriority;
    });
};

const normalizeAnnouncementsConfig = (rawValue) => {
    if (Array.isArray(rawValue)) {
        return sortAnnouncements(rawValue);
    }

    if (Array.isArray(rawValue?.announcements)) {
        return sortAnnouncements(rawValue.announcements);
    }

    return [];
};

const slugify = (value) => {
    return String(value || '')
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .slice(0, 48);
};

const draftFromAnnouncement = (announcement) => ({
    id: announcement?.id || '',
    title: announcement?.title || '',
    message: announcement?.message || '',
    badge: announcement?.badge || 'Aviso app',
    type: announcement?.type || 'notice',
    presentation: announcement?.presentation || 'modal',
    dismissible: announcement?.dismissible !== false,
    enabled: announcement?.enabled !== false,
    priority: Number(announcement?.priority || 100),
    roles: Array.isArray(announcement?.audienceRoles) && announcement.audienceRoles.length > 0
        ? announcement.audienceRoles
        : ['all'],
    companyIds: Array.isArray(announcement?.companyIds) ? announcement.companyIds.join(', ') : '',
    icon: announcement?.icon || 'info',
    primaryButtonLabel: announcement?.primaryButtonLabel || 'Entendido',
    versionToken: announcement?.versionToken || `panel-${Date.now()}`,
    displayMode: announcement?.displayMode || 'once',
    remindAfterHours: String(announcement?.remindAfterHours ?? 24),
    bulletPoints: Array.isArray(announcement?.bulletPoints)
        ? announcement.bulletPoints.join('\n')
        : '',
});

const parseCompanyIds = (rawValue) => {
    return String(rawValue || '')
        .split(',')
        .map((item) => Number(item.trim()))
        .filter((item) => Number.isInteger(item) && item > 0);
};

const buildAnnouncementRecord = (draft) => {
    const title = String(draft.title || '').trim();
    const message = String(draft.message || '').trim();

    if (!title) {
        throw new Error('El título del anuncio es obligatorio.');
    }

    if (!message) {
        throw new Error('El mensaje del anuncio es obligatorio.');
    }

    const cleanedRoles = Array.isArray(draft.roles) && draft.roles.length > 0
        ? draft.roles
        : ['all'];
    const roles = cleanedRoles.includes('all') ? ['all'] : cleanedRoles;
    const reminderHours = Number(draft.remindAfterHours || 0);

    return {
        id: draft.id || `panel-${slugify(title) || 'anuncio'}-${Date.now()}`,
        enabled: draft.enabled !== false,
        priority: Number(draft.priority || 100),
        type: draft.type || 'notice',
        presentation: draft.presentation || 'modal',
        dismissible: draft.presentation === 'blockingSplash' ? false : draft.dismissible !== false,
        badge: String(draft.badge || 'Aviso app').trim(),
        primaryButtonLabel: String(draft.primaryButtonLabel || 'Entendido').trim(),
        audienceRoles: roles,
        companyIds: parseCompanyIds(draft.companyIds),
        icon: draft.icon || 'info',
        versionToken: String(draft.versionToken || `panel-${Date.now()}`).trim(),
        displayMode: draft.displayMode || 'once',
        remindAfterHours: draft.displayMode === 'cooldown' && reminderHours > 0 ? reminderHours : null,
        title,
        message,
        bulletPoints: String(draft.bulletPoints || '')
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean),
        updatedAt: new Date().toISOString(),
    };
};

const draftFromCampaign = (campaign) => ({
    id: campaign?.id ?? null,
    titulo: campaign?.titulo || '',
    mensaje: campaign?.mensaje || '',
    rol: campaign?.rol || 'todos',
    empresa_id: campaign?.empresa_id ? String(campaign.empresa_id) : '',
    activo: campaign?.activo !== false,
    hora_envio: campaign?.hora_envio ? String(campaign.hora_envio).slice(0, 5) : '',
    fecha_inicio: campaign?.fecha_inicio || '',
    fecha_fin: campaign?.fecha_fin || '',
    tipo: campaign?.tipo || 'engagement',
    timezone_name: campaign?.timezone_name || 'America/Bogota',
});

const buildCampaignPayload = (draft) => {
    const titulo = String(draft.titulo || '').trim();
    const mensaje = String(draft.mensaje || '').trim();

    if (!titulo) {
        throw new Error('El título de la campaña es obligatorio.');
    }

    if (!mensaje) {
        throw new Error('El mensaje de la campaña es obligatorio.');
    }

    return {
        titulo,
        mensaje,
        rol: draft.rol || 'todos',
        empresa_id: draft.empresa_id ? Number(draft.empresa_id) : null,
        activo: draft.activo !== false,
        hora_envio: draft.hora_envio ? `${draft.hora_envio}:00` : null,
        fecha_inicio: draft.fecha_inicio || null,
        fecha_fin: draft.fecha_fin || null,
        tipo: draft.tipo || 'engagement',
        timezone_name: draft.timezone_name || 'America/Bogota',
    };
};

const formatDateTime = (value) => {
    if (!value) {
        return 'Sin registro';
    }

    const parsed = new Date(String(value).replace(' ', 'T'));
    if (Number.isNaN(parsed.getTime())) {
        return value;
    }

    return parsed.toLocaleString('es-CO');
};

const summarizeRoles = (roles) => {
    if (!Array.isArray(roles) || roles.length === 0 || roles.includes('all')) {
        return 'Todos';
    }

    const labels = roles
        .map((role) => ROLE_OPTIONS.find((option) => option.value === role)?.label || role)
        .filter(Boolean);

    return labels.join(', ');
};

const resolveAnnouncementTone = (announcement) => {
    if (announcement?.presentation === 'blockingSplash') {
        return 'danger';
    }

    if (announcement?.type === 'maintenance') {
        return 'warning';
    }

    if (announcement?.type === 'promotion') {
        return 'success';
    }

    return 'info';
};

const AdminBroadcasts = () => {
    const { user } = useAuth();
    const { showSnackbar } = useSnackbar();
    const [loading, setLoading] = useState(true);
    const [announcements, setAnnouncements] = useState([]);
    const [campaigns, setCampaigns] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [announcementForm, setAnnouncementForm] = useState(createAnnouncementForm());
    const [campaignForm, setCampaignForm] = useState(createCampaignForm());
    const [savingAnnouncement, setSavingAnnouncement] = useState(false);
    const [savingCampaign, setSavingCampaign] = useState(false);

    const isAdmin = user && ['admin', 'administrador'].includes(user.tipo_usuario);

    const loadCampaigns = async () => {
        if (!isAdmin) {
            return;
        }

        const response = await getPushCampaigns(user.id);
        if (response.success && response.data) {
            setCampaigns(response.data.campaigns || []);
            return;
        }

        showSnackbar(response.message || 'No se pudieron cargar las campañas push.', { type: 'error' });
    };

    const loadPageData = async () => {
        if (!isAdmin) {
            setLoading(false);
            return;
        }

        setLoading(true);

        const [configResponse, campaignsResponse, companiesResponse] = await Promise.all([
            getAppConfig(user.id),
            getPushCampaigns(user.id),
            getCompanies(user.id, { page: 1, limit: 200 }),
        ]);

        if (configResponse.success && configResponse.data) {
            const normalizedAnnouncements = normalizeAnnouncementsConfig(
                configResponse.data.config?.app_remote_announcements
            );
            setAnnouncements(normalizedAnnouncements);
        } else {
            showSnackbar(configResponse.message || 'No se pudo cargar la configuración de anuncios.', { type: 'error' });
        }

        if (campaignsResponse.success && campaignsResponse.data) {
            setCampaigns(campaignsResponse.data.campaigns || []);
        } else {
            showSnackbar(campaignsResponse.message || 'No se pudieron cargar las campañas push.', { type: 'error' });
        }

        if (companiesResponse.success && Array.isArray(companiesResponse.empresas)) {
            setCompanies(companiesResponse.empresas);
        }

        setLoading(false);
    };

    useEffect(() => {
        loadPageData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);

    const persistAnnouncements = async (nextAnnouncements, successMessage) => {
        const payload = {
            version: 1,
            updated_at: new Date().toISOString(),
            announcements: sortAnnouncements(nextAnnouncements),
        };

        const response = await updateAppConfig(user.id, {
            clave: 'app_remote_announcements',
            valor: JSON.stringify(payload),
            tipo: 'json',
            categoria: 'anuncios',
            descripcion: 'Anuncios remotos administrables desde panel web',
            es_publica: true,
        });

        if (!response.success) {
            throw new Error(response.message || 'No se pudo guardar la configuración de anuncios.');
        }

        setAnnouncements(payload.announcements);
        showSnackbar(successMessage, { type: 'success' });
    };

    const handleAnnouncementRoleToggle = (role) => {
        setAnnouncementForm((current) => {
            const currentRoles = Array.isArray(current.roles) ? current.roles : ['all'];

            if (role === 'all') {
                return { ...current, roles: ['all'] };
            }

            const withoutAll = currentRoles.filter((item) => item !== 'all');
            const nextRoles = withoutAll.includes(role)
                ? withoutAll.filter((item) => item !== role)
                : [...withoutAll, role];

            return {
                ...current,
                roles: nextRoles.length > 0 ? nextRoles : ['all'],
            };
        });
    };

    const handleSaveAnnouncement = async (event) => {
        event.preventDefault();
        setSavingAnnouncement(true);

        try {
            const nextRecord = buildAnnouncementRecord(announcementForm);
            const nextAnnouncements = announcements.filter((item) => item.id !== nextRecord.id);
            nextAnnouncements.push(nextRecord);
            await persistAnnouncements(nextAnnouncements, 'Anuncio guardado correctamente.');
            setAnnouncementForm(createAnnouncementForm());
        } catch (error) {
            showSnackbar(error.message || 'No se pudo guardar el anuncio.', { type: 'error' });
        } finally {
            setSavingAnnouncement(false);
        }
    };

    const handleDeleteAnnouncement = async (announcementId) => {
        const target = announcements.find((item) => item.id === announcementId);
        if (!target) {
            return;
        }

        if (!window.confirm(`¿Eliminar el anuncio "${target.title}"?`)) {
            return;
        }

        setSavingAnnouncement(true);
        try {
            const nextAnnouncements = announcements.filter((item) => item.id !== announcementId);
            await persistAnnouncements(nextAnnouncements, 'Anuncio eliminado correctamente.');
            if (announcementForm.id === announcementId) {
                setAnnouncementForm(createAnnouncementForm());
            }
        } catch (error) {
            showSnackbar(error.message || 'No se pudo eliminar el anuncio.', { type: 'error' });
        } finally {
            setSavingAnnouncement(false);
        }
    };

    const handleSaveCampaign = async (event) => {
        event.preventDefault();
        setSavingCampaign(true);

        try {
            const payload = buildCampaignPayload(campaignForm);
            const response = campaignForm.id
                ? await updatePushCampaign(user.id, campaignForm.id, payload)
                : await createPushCampaign(user.id, payload);

            if (!response.success) {
                throw new Error(response.message || 'No se pudo guardar la campaña push.');
            }

            showSnackbar(
                campaignForm.id ? 'Campaña push actualizada.' : 'Campaña push creada.',
                { type: 'success' }
            );
            setCampaignForm(createCampaignForm());
            await loadCampaigns();
        } catch (error) {
            showSnackbar(error.message || 'No se pudo guardar la campaña push.', { type: 'error' });
        } finally {
            setSavingCampaign(false);
        }
    };

    const handleDeleteCampaign = async (campaignId) => {
        const target = campaigns.find((item) => item.id === campaignId);
        if (!target) {
            return;
        }

        if (!window.confirm(`¿Eliminar la campaña "${target.titulo}"?`)) {
            return;
        }

        setSavingCampaign(true);
        try {
            const response = await deletePushCampaign(user.id, campaignId);
            if (!response.success) {
                throw new Error(response.message || 'No se pudo eliminar la campaña push.');
            }

            showSnackbar('Campaña push eliminada.', { type: 'success' });
            if (campaignForm.id === campaignId) {
                setCampaignForm(createCampaignForm());
            }
            await loadCampaigns();
        } catch (error) {
            showSnackbar(error.message || 'No se pudo eliminar la campaña push.', { type: 'error' });
        } finally {
            setSavingCampaign(false);
        }
    };

    if (loading) {
        return <ShimmerCardGrid cards={4} />;
    }

    return (
        <div className="v-dashboard admin-broadcasts-page">
            <PageHeader
                title="Anuncios y notificaciones"
                subtitle="Controla anuncios remotos de la app y campañas push programadas desde el panel web."
                actions={(
                    <button type="button" className="broadcast-btn broadcast-btn--ghost" onClick={loadPageData}>
                        <FiRefreshCw size={16} /> Refrescar
                    </button>
                )}
            />

            <div className="glass-card admin-broadcasts-hero">
                <div className="admin-broadcasts-hero__icon">
                    <FiShield size={24} />
                </div>
                <div>
                    <h2>Centro de comunicación operativa</h2>
                    <p>
                        Los anuncios remotos se publican vía base de datos y configuración pública. Si el backend no responde,
                        la app conserva su fallback local para mantenimientos críticos activados en código.
                    </p>
                </div>
            </div>

            <div className="admin-broadcasts-grid">
                <section className="glass-card v-section">
                    <div className="broadcast-toolbar">
                        <div>
                            <h3 className="broadcast-section-title">Anuncios de app</h3>
                            <p className="broadcast-section-subtitle">Incluye avisos bloqueantes para cortes o cambios grandes de infraestructura.</p>
                        </div>
                        <button
                            type="button"
                            className="broadcast-btn broadcast-btn--ghost"
                            onClick={() => setAnnouncementForm(createAnnouncementForm())}
                        >
                            <FiPlus size={16} /> Nuevo anuncio
                        </button>
                    </div>

                    <div className="broadcast-pill-row">
                        <span className="broadcast-pill">Total: {announcements.length}</span>
                        <span className="broadcast-pill">Activos: {announcements.filter((item) => item.enabled !== false).length}</span>
                        <span className="broadcast-pill">Bloqueantes: {announcements.filter((item) => item.presentation === 'blockingSplash').length}</span>
                    </div>

                    {announcements.length === 0 ? (
                        <EmptyState
                            icon={<FiBell size={42} />}
                            title="Sin anuncios remotos"
                            description="Crea el primer anuncio para empezar a comunicar avisos dentro de la app."
                        />
                    ) : (
                        <div className="broadcast-list">
                            {announcements.map((announcement) => (
                                <article
                                    key={announcement.id}
                                    className={`broadcast-card broadcast-card--${resolveAnnouncementTone(announcement)}`}
                                >
                                    <div className="broadcast-card__header">
                                        <div>
                                            <h4 className="broadcast-card__title">{announcement.title}</h4>
                                            <p className="broadcast-card__message">{announcement.message}</p>
                                        </div>
                                        <div className="broadcast-chip-stack">
                                            <span className="broadcast-chip">{announcement.enabled !== false ? 'Activo' : 'Pausado'}</span>
                                            <span className="broadcast-chip">{announcement.presentation === 'blockingSplash' ? 'Bloquea app' : 'No bloquea'}</span>
                                        </div>
                                    </div>

                                    <div className="broadcast-meta">
                                        <span><FiLayers size={13} /> {summarizeRoles(announcement.audienceRoles)}</span>
                                        <span><FiClock size={13} /> Prioridad {announcement.priority || 0}</span>
                                        <span>Versión {announcement.versionToken || 'sin token'}</span>
                                    </div>

                                    <div className="broadcast-actions-row">
                                        <button
                                            type="button"
                                            className="broadcast-btn broadcast-btn--ghost"
                                            onClick={() => setAnnouncementForm(draftFromAnnouncement(announcement))}
                                        >
                                            <FiEdit2 size={16} /> Editar
                                        </button>
                                        <button
                                            type="button"
                                            className="broadcast-btn broadcast-btn--danger"
                                            onClick={() => handleDeleteAnnouncement(announcement.id)}
                                            disabled={savingAnnouncement}
                                        >
                                            <FiTrash2 size={16} /> Eliminar
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>

                <section className="glass-card v-section">
                    <div className="broadcast-toolbar">
                        <div>
                            <h3 className="broadcast-section-title">Editor de anuncio</h3>
                            <p className="broadcast-section-subtitle">Configura el contenido que verá la app sin lanzar una nueva build.</p>
                        </div>
                    </div>

                    <form className="broadcast-form" onSubmit={handleSaveAnnouncement}>
                        <div className="broadcast-form-grid">
                            <div className="broadcast-field broadcast-field--full">
                                <label htmlFor="announcement-title">Título</label>
                                <input
                                    id="announcement-title"
                                    type="text"
                                    value={announcementForm.title}
                                    onChange={(event) => setAnnouncementForm({ ...announcementForm, title: event.target.value })}
                                    placeholder="Ej: Mantenimiento urgente esta madrugada"
                                />
                            </div>
                            <div className="broadcast-field broadcast-field--full">
                                <label htmlFor="announcement-message">Mensaje</label>
                                <textarea
                                    id="announcement-message"
                                    value={announcementForm.message}
                                    onChange={(event) => setAnnouncementForm({ ...announcementForm, message: event.target.value })}
                                    placeholder="Describe el cambio o la incidencia principal."
                                />
                            </div>
                            <div className="broadcast-field">
                                <label htmlFor="announcement-badge">Badge</label>
                                <input
                                    id="announcement-badge"
                                    type="text"
                                    value={announcementForm.badge}
                                    onChange={(event) => setAnnouncementForm({ ...announcementForm, badge: event.target.value })}
                                    placeholder="Ej: Infraestructura"
                                />
                            </div>
                            <div className="broadcast-field">
                                <label htmlFor="announcement-button">Texto del botón</label>
                                <input
                                    id="announcement-button"
                                    type="text"
                                    value={announcementForm.primaryButtonLabel}
                                    onChange={(event) => setAnnouncementForm({ ...announcementForm, primaryButtonLabel: event.target.value })}
                                    placeholder="Entendido"
                                />
                            </div>
                            <div className="broadcast-field">
                                <label htmlFor="announcement-type">Tipo</label>
                                <select
                                    id="announcement-type"
                                    value={announcementForm.type}
                                    onChange={(event) => setAnnouncementForm({ ...announcementForm, type: event.target.value })}
                                >
                                    {ANNOUNCEMENT_TYPES.map((option) => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="broadcast-field">
                                <label htmlFor="announcement-presentation">Presentación</label>
                                <select
                                    id="announcement-presentation"
                                    value={announcementForm.presentation}
                                    onChange={(event) => setAnnouncementForm({
                                        ...announcementForm,
                                        presentation: event.target.value,
                                        dismissible: event.target.value === 'blockingSplash' ? false : announcementForm.dismissible,
                                    })}
                                >
                                    {PRESENTATION_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="broadcast-field">
                                <label htmlFor="announcement-icon">Ícono</label>
                                <select
                                    id="announcement-icon"
                                    value={announcementForm.icon}
                                    onChange={(event) => setAnnouncementForm({ ...announcementForm, icon: event.target.value })}
                                >
                                    {ICON_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="broadcast-field">
                                <label htmlFor="announcement-priority">Prioridad</label>
                                <input
                                    id="announcement-priority"
                                    type="number"
                                    min="1"
                                    max="999"
                                    value={announcementForm.priority}
                                    onChange={(event) => setAnnouncementForm({ ...announcementForm, priority: event.target.value })}
                                />
                            </div>
                            <div className="broadcast-field">
                                <label htmlFor="announcement-version">Version token</label>
                                <input
                                    id="announcement-version"
                                    type="text"
                                    value={announcementForm.versionToken}
                                    onChange={(event) => setAnnouncementForm({ ...announcementForm, versionToken: event.target.value })}
                                />
                            </div>
                            <div className="broadcast-field">
                                <label htmlFor="announcement-display-mode">Modo de repetición</label>
                                <select
                                    id="announcement-display-mode"
                                    value={announcementForm.displayMode}
                                    onChange={(event) => setAnnouncementForm({ ...announcementForm, displayMode: event.target.value })}
                                >
                                    {DISPLAY_MODE_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="broadcast-field">
                                <label htmlFor="announcement-remind-after">Enfriamiento (horas)</label>
                                <input
                                    id="announcement-remind-after"
                                    type="number"
                                    min="1"
                                    value={announcementForm.remindAfterHours}
                                    onChange={(event) => setAnnouncementForm({ ...announcementForm, remindAfterHours: event.target.value })}
                                    disabled={announcementForm.displayMode !== 'cooldown'}
                                />
                            </div>
                            <div className="broadcast-field broadcast-field--full">
                                <label htmlFor="announcement-company-ids">Empresa ID (opcional, separa con coma)</label>
                                <input
                                    id="announcement-company-ids"
                                    type="text"
                                    value={announcementForm.companyIds}
                                    onChange={(event) => setAnnouncementForm({ ...announcementForm, companyIds: event.target.value })}
                                    placeholder="12, 18, 45"
                                />
                            </div>
                            <div className="broadcast-field broadcast-field--full">
                                <label htmlFor="announcement-bullets">Puntos clave (uno por línea)</label>
                                <textarea
                                    id="announcement-bullets"
                                    value={announcementForm.bulletPoints}
                                    onChange={(event) => setAnnouncementForm({ ...announcementForm, bulletPoints: event.target.value })}
                                    placeholder="Primer punto\nSegundo punto"
                                />
                            </div>
                        </div>

                        <div className="broadcast-field broadcast-field--full">
                            <span className="broadcast-label">Audiencia</span>
                            <div className="broadcast-role-grid">
                                {ROLE_OPTIONS.map((option) => {
                                    const selected = announcementForm.roles.includes(option.value);
                                    return (
                                        <label key={option.value} className={`broadcast-check ${selected ? 'is-selected' : ''}`}>
                                            <input
                                                type="checkbox"
                                                checked={selected}
                                                onChange={() => handleAnnouncementRoleToggle(option.value)}
                                            />
                                            <span>{option.label}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="broadcast-toggle-row">
                            <label className="broadcast-check is-inline">
                                <input
                                    type="checkbox"
                                    checked={announcementForm.enabled}
                                    onChange={(event) => setAnnouncementForm({ ...announcementForm, enabled: event.target.checked })}
                                />
                                <span>Anuncio activo</span>
                            </label>
                            <label className="broadcast-check is-inline">
                                <input
                                    type="checkbox"
                                    checked={announcementForm.dismissible}
                                    disabled={announcementForm.presentation === 'blockingSplash'}
                                    onChange={(event) => setAnnouncementForm({ ...announcementForm, dismissible: event.target.checked })}
                                />
                                <span>Puede cerrarse</span>
                            </label>
                        </div>

                        <div className="broadcast-actions-row">
                            <button type="submit" className="broadcast-btn broadcast-btn--primary" disabled={savingAnnouncement}>
                                <FiSave size={16} /> {announcementForm.id ? 'Actualizar anuncio' : 'Guardar anuncio'}
                            </button>
                            <button
                                type="button"
                                className="broadcast-btn broadcast-btn--ghost"
                                onClick={() => setAnnouncementForm(createAnnouncementForm())}
                                disabled={savingAnnouncement}
                            >
                                <FiRefreshCw size={16} /> Limpiar
                            </button>
                        </div>
                    </form>
                </section>
            </div>

            <div className="admin-broadcasts-grid">
                <section className="glass-card v-section">
                    <div className="broadcast-toolbar">
                        <div>
                            <h3 className="broadcast-section-title">Campañas push programadas</h3>
                            <p className="broadcast-section-subtitle">Programa notificaciones promocionales y de engagement con segmentación por rol o empresa.</p>
                        </div>
                        <button
                            type="button"
                            className="broadcast-btn broadcast-btn--ghost"
                            onClick={() => setCampaignForm(createCampaignForm())}
                        >
                            <FiPlus size={16} /> Nueva campaña
                        </button>
                    </div>

                    <div className="broadcast-pill-row">
                        <span className="broadcast-pill">Total: {campaigns.length}</span>
                        <span className="broadcast-pill">Activas: {campaigns.filter((item) => item.activo).length}</span>
                        <span className="broadcast-pill">Entregadas: {campaigns.reduce((total, item) => total + Number(item.enviadas || 0), 0)}</span>
                    </div>

                    {campaigns.length === 0 ? (
                        <EmptyState
                            icon={<FiSend size={42} />}
                            title="Sin campañas push"
                            description="Crea la primera campaña programada para enviar promociones o recordatorios."
                        />
                    ) : (
                        <div className="broadcast-list">
                            {campaigns.map((campaign) => (
                                <article key={campaign.id} className="broadcast-card broadcast-card--neutral">
                                    <div className="broadcast-card__header">
                                        <div>
                                            <h4 className="broadcast-card__title">{campaign.titulo}</h4>
                                            <p className="broadcast-card__message">{campaign.mensaje}</p>
                                        </div>
                                        <div className="broadcast-chip-stack">
                                            <span className="broadcast-chip">{campaign.activo ? 'Activa' : 'Pausada'}</span>
                                            <span className="broadcast-chip">{campaign.tipo}</span>
                                        </div>
                                    </div>

                                    <div className="broadcast-meta">
                                        <span><FiZap size={13} /> Rol: {campaign.rol}</span>
                                        <span><FiClock size={13} /> {campaign.hora_envio || 'Sin hora fija'}</span>
                                        <span>Enviadas: {campaign.enviadas || 0}</span>
                                        <span>Aperturas: {campaign.abiertas || 0}</span>
                                    </div>

                                    <div className="broadcast-empty-note">
                                        Última ejecución: {formatDateTime(campaign.ultima_ejecucion?.slot_programado)}
                                    </div>

                                    <div className="broadcast-actions-row">
                                        <button
                                            type="button"
                                            className="broadcast-btn broadcast-btn--ghost"
                                            onClick={() => setCampaignForm(draftFromCampaign(campaign))}
                                        >
                                            <FiEdit2 size={16} /> Editar
                                        </button>
                                        <button
                                            type="button"
                                            className="broadcast-btn broadcast-btn--danger"
                                            onClick={() => handleDeleteCampaign(campaign.id)}
                                            disabled={savingCampaign}
                                        >
                                            <FiTrash2 size={16} /> Eliminar
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>

                <section className="glass-card v-section">
                    <div className="broadcast-toolbar">
                        <div>
                            <h3 className="broadcast-section-title">Editor de campaña push</h3>
                            <p className="broadcast-section-subtitle">Configura hora, audiencia y ventana activa para cada notificación.</p>
                        </div>
                    </div>

                    <form className="broadcast-form" onSubmit={handleSaveCampaign}>
                        <div className="broadcast-form-grid">
                            <div className="broadcast-field broadcast-field--full">
                                <label htmlFor="campaign-title">Título</label>
                                <input
                                    id="campaign-title"
                                    type="text"
                                    value={campaignForm.titulo}
                                    onChange={(event) => setCampaignForm({ ...campaignForm, titulo: event.target.value })}
                                    placeholder="Ej: Demanda alta esta noche"
                                />
                            </div>
                            <div className="broadcast-field broadcast-field--full">
                                <label htmlFor="campaign-message">Mensaje</label>
                                <textarea
                                    id="campaign-message"
                                    value={campaignForm.mensaje}
                                    onChange={(event) => setCampaignForm({ ...campaignForm, mensaje: event.target.value })}
                                    placeholder="Contenido push que llegará a los usuarios objetivo."
                                />
                            </div>
                            <div className="broadcast-field">
                                <label htmlFor="campaign-role">Rol objetivo</label>
                                <select
                                    id="campaign-role"
                                    value={campaignForm.rol}
                                    onChange={(event) => setCampaignForm({ ...campaignForm, rol: event.target.value })}
                                >
                                    {CAMPAIGN_ROLE_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="broadcast-field">
                                <label htmlFor="campaign-type">Tipo de campaña</label>
                                <select
                                    id="campaign-type"
                                    value={campaignForm.tipo}
                                    onChange={(event) => setCampaignForm({ ...campaignForm, tipo: event.target.value })}
                                >
                                    {CAMPAIGN_TYPE_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="broadcast-field">
                                <label htmlFor="campaign-company">Empresa específica</label>
                                <select
                                    id="campaign-company"
                                    value={campaignForm.empresa_id}
                                    onChange={(event) => setCampaignForm({ ...campaignForm, empresa_id: event.target.value })}
                                >
                                    <option value="">Todas</option>
                                    {companies.map((company) => (
                                        <option key={company.id} value={company.id}>{company.nombre}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="broadcast-field">
                                <label htmlFor="campaign-timezone">Zona horaria</label>
                                <input
                                    id="campaign-timezone"
                                    type="text"
                                    value={campaignForm.timezone_name}
                                    onChange={(event) => setCampaignForm({ ...campaignForm, timezone_name: event.target.value })}
                                />
                            </div>
                            <div className="broadcast-field">
                                <label htmlFor="campaign-time">Hora de envío</label>
                                <input
                                    id="campaign-time"
                                    type="time"
                                    value={campaignForm.hora_envio}
                                    onChange={(event) => setCampaignForm({ ...campaignForm, hora_envio: event.target.value })}
                                />
                            </div>
                            <div className="broadcast-field">
                                <label htmlFor="campaign-start">Fecha inicio</label>
                                <input
                                    id="campaign-start"
                                    type="date"
                                    value={campaignForm.fecha_inicio}
                                    onChange={(event) => setCampaignForm({ ...campaignForm, fecha_inicio: event.target.value })}
                                />
                            </div>
                            <div className="broadcast-field">
                                <label htmlFor="campaign-end">Fecha fin</label>
                                <input
                                    id="campaign-end"
                                    type="date"
                                    value={campaignForm.fecha_fin}
                                    onChange={(event) => setCampaignForm({ ...campaignForm, fecha_fin: event.target.value })}
                                />
                            </div>
                        </div>

                        <div className="broadcast-toggle-row">
                            <label className="broadcast-check is-inline">
                                <input
                                    type="checkbox"
                                    checked={campaignForm.activo}
                                    onChange={(event) => setCampaignForm({ ...campaignForm, activo: event.target.checked })}
                                />
                                <span>Campaña activa</span>
                            </label>
                        </div>

                        <div className="broadcast-actions-row">
                            <button type="submit" className="broadcast-btn broadcast-btn--primary" disabled={savingCampaign}>
                                <FiSave size={16} /> {campaignForm.id ? 'Actualizar campaña' : 'Guardar campaña'}
                            </button>
                            <button
                                type="button"
                                className="broadcast-btn broadcast-btn--ghost"
                                onClick={() => setCampaignForm(createCampaignForm())}
                                disabled={savingCampaign}
                            >
                                <FiRefreshCw size={16} /> Limpiar
                            </button>
                        </div>
                    </form>
                </section>
            </div>

            <div className="glass-card admin-broadcasts-note">
                <FiAlertTriangle size={18} />
                <p>
                    Los anuncios bloqueantes se aplican a toda la app. Si activas uno, revisa el mensaje y el token de versión para evitar que usuarios vean una copia obsoleta.
                </p>
            </div>
        </div>
    );
};

export default AdminBroadcasts;