import React from 'react';
import './AuthInput.css';

const AuthInput = ({ label, icon, type = 'text', ...props }) => {
    const isMaterialIcon = typeof icon === 'string';

    return (
        <div className="auth-input-container">
            <label className="auth-input-label">{label}</label>
            <div className="auth-input-wrapper">
                {icon && (
                    <span
                        className={`auth-input-icon ${isMaterialIcon ? 'material-icons' : 'auth-input-icon-node'}`}
                        aria-hidden="true"
                    >
                        {icon}
                    </span>
                )}
                <input
                    type={type}
                    className="auth-input-field"
                    {...props}
                />
            </div>
        </div>
    );
};

export default AuthInput;
