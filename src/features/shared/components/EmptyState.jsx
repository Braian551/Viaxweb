import React from 'react';
import { FiInbox } from 'react-icons/fi';

/**
 * EmptyState - Reusable empty/no-data state
 * Glass card with icon and message
 */
const EmptyState = ({
    icon,
    title = 'Sin datos',
    description = 'No hay información para mostrar.',
    action,
    style = {}
}) => (
    <div className="v-empty-state glass-card" style={style}>
        <div className="v-empty-state__icon">
            {icon || <FiInbox size={48} />}
        </div>
        <h3 className="v-empty-state__title">{title}</h3>
        <p className="v-empty-state__desc">{description}</p>
        {action && <div className="v-empty-state__action">{action}</div>}
    </div>
);

export default EmptyState;
