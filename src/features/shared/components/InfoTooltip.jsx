import React, { useState } from 'react';
import { FiInfo } from 'react-icons/fi';

const InfoTooltip = ({ title, content, children }) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div
            style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children || (
                <button
                    type="button"
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--primary, #2196f3)',
                        cursor: 'help',
                        display: 'flex',
                        padding: '4px',
                        borderRadius: '50%',
                        transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-bg, rgba(33, 150, 243, 0.1))'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                    <FiInfo size={14} />
                </button>
            )}

            {isVisible && (
                <div style={{
                    position: 'absolute',
                    bottom: 'calc(100% + 10px)',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '240px',
                    padding: '12px',
                    background: 'var(--glass-strong, rgba(20, 28, 46, 0.95))',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid var(--border-strong, rgba(255, 255, 255, 0.1))',
                    borderRadius: '12px',
                    boxShadow: 'var(--shadow-lg, 0 10px 30px rgba(0,0,0,0.3))',
                    zIndex: 9999,
                    animation: 'tooltipFadeIn 0.2s ease-out',
                    pointerEvents: 'none',
                }}>
                    {title && <h4 style={{ margin: '0 0 6px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary, #2196f3)' }}>{title}</h4>}
                    <p style={{ margin: 0, fontSize: '0.78rem', lineHeight: '1.5', color: 'var(--text, #fff)', fontWeight: 400 }}>
                        {content}
                    </p>
                    {/* Tooltip Arrow */}
                    <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: '50%',
                        marginLeft: '-6px',
                        borderWidth: '6px',
                        borderStyle: 'solid',
                        borderColor: 'var(--glass-strong, rgba(20, 28, 46, 0.95)) transparent transparent transparent',
                    }} />
                </div>
            )}

            <style>{`
                @keyframes tooltipFadeIn {
                    from { opacity: 0; transform: translateX(-50%) translateY(5px); }
                    to { opacity: 1; transform: translateX(-50%) translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default InfoTooltip;
