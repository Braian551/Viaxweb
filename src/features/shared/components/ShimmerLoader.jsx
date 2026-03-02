import React from 'react';
import './ShimmerLoader.css';

/**
 * Shimmer loading skeleton components
 * Reusable across all dashboards
 */

/** Single animated line */
export const ShimmerLine = ({ width = '100%', height = '16px', style = {} }) => (
    <div className="shimmer-line" style={{ width, height, ...style }} />
);

/** Animated circle (avatar placeholder) */
export const ShimmerCircle = ({ size = 48 }) => (
    <div className="shimmer-circle" style={{ width: size, height: size, minWidth: size }} />
);

/** Animated rectangle block */
export const ShimmerRect = ({ width = '100%', height = '120px', style = {} }) => (
    <div className="shimmer-rect" style={{ width, height, ...style }} />
);

/** Stat cards shimmer grid */
export const ShimmerStatGrid = ({ count = 4, cardHeight = '140px' }) => (
    <div className="shimmer-stat-grid">
        {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="shimmer-card shimmer-stat-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <ShimmerLine width="60%" height="14px" />
                    <ShimmerCircle size={40} />
                </div>
                <ShimmerLine width="50%" height="32px" />
                <ShimmerLine width="40%" height="12px" />
            </div>
        ))}
    </div>
);

/** Table rows shimmer */
export const ShimmerTable = ({ rows = 5, cols = 4 }) => (
    <div className="shimmer-table">
        {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="shimmer-table-row">
                <ShimmerCircle size={36} />
                {Array.from({ length: cols - 1 }).map((_, j) => (
                    <ShimmerLine key={j} width={`${60 + Math.random() * 30}%`} height="14px" style={{ flex: 1 }} />
                ))}
            </div>
        ))}
    </div>
);

/** Card grid shimmer */
export const ShimmerCardGrid = ({ count = 6, cardHeight = '200px' }) => (
    <div className="shimmer-card-grid">
        {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="shimmer-card" style={{ minHeight: cardHeight }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
                    <ShimmerCircle size={48} />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <ShimmerLine width="70%" height="14px" />
                        <ShimmerLine width="50%" height="12px" />
                    </div>
                </div>
                <ShimmerLine width="80%" height="12px" />
                <ShimmerLine width="60%" height="12px" style={{ marginTop: '8px' }} />
                <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                    <ShimmerRect width="80px" height="32px" />
                    <ShimmerRect width="80px" height="32px" />
                </div>
            </div>
        ))}
    </div>
);

/** Full page shimmer (dashboard skeleton) */
export const ShimmerDashboard = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
            <ShimmerLine width="280px" height="28px" />
            <ShimmerLine width="200px" height="14px" style={{ marginTop: '12px' }} />
        </div>
        <ShimmerStatGrid count={4} />
        <div className="shimmer-card" style={{ minHeight: '300px', padding: '24px' }}>
            <ShimmerLine width="200px" height="20px" style={{ marginBottom: '20px' }} />
            <ShimmerTable rows={4} cols={3} />
        </div>
    </div>
);

export default ShimmerDashboard;
