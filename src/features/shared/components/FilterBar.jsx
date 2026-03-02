import React from 'react';

/**
 * FilterBar - Reusable horizontal filter pills
 * Solid active state with accent color
 */
const FilterBar = ({
    filters = [],
    activeValue = '',
    onChange,
    style = {}
}) => (
    <div className="v-filter-bar glass-card" style={style}>
        {filters.map((f) => (
            <button
                key={f.value}
                onClick={() => onChange(f.value)}
                className={`v-filter-btn ${activeValue === f.value ? 'active' : ''}`}
            >
                {f.icon && <span className="v-filter-btn__icon">{f.icon}</span>}
                {f.label}
                {f.count !== undefined && (
                    <span className="v-filter-btn__count">{f.count}</span>
                )}
            </button>
        ))}
    </div>
);

export default FilterBar;
