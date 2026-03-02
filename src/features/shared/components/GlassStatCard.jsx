import React from 'react';

/**
 * GlassStatCard - Modern glass-morphism stat card
 * Solid accent colors, hover lift effect
 * Responsive & reusable across all dashboards
 */
const GlassStatCard = ({
    title,
    value,
    subtitle,
    icon,
    accentColor = '#2196f3',
    onClick
}) => {
    const bgAlpha = `${accentColor}18`; // ~10% opacity

    return (
        <div
            className="v-stat-card glass-card"
            onClick={onClick}
            style={{ cursor: onClick ? 'pointer' : 'default' }}
        >
            <div className="v-stat-card__header">
                <span className="v-stat-card__title">{title}</span>
                <div
                    className="v-stat-card__icon"
                    style={{ background: bgAlpha }}
                >
                    {icon}
                </div>
            </div>
            <div className="v-stat-card__value" style={{ color: accentColor }}>
                {value}
            </div>
            {subtitle && (
                <div className="v-stat-card__subtitle">{subtitle}</div>
            )}
        </div>
    );
};

export default GlassStatCard;
