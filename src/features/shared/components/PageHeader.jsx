import React from 'react';

/**
 * PageHeader - Reusable page header with title, subtitle, and optional actions
 */
const PageHeader = ({ title, subtitle, actions, style = {} }) => (
    <div className="v-page-header" style={style}>
        <div className="v-page-header__text">
            <h1 className="v-page-header__title">{title}</h1>
            {subtitle && <p className="v-page-header__subtitle">{subtitle}</p>}
        </div>
        {actions && <div className="v-page-header__actions">{actions}</div>}
    </div>
);

export default PageHeader;
