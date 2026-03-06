import React, { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import './AuthInput.css';

const AuthInput = ({ label, icon, type = 'text', ...props }) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const isMaterialIcon = typeof icon === 'string';
    const isPasswordField = type === 'password';
    const inputType = isPasswordField && isPasswordVisible ? 'text' : type;

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
                    type={inputType}
                    className={`auth-input-field ${isPasswordField ? 'auth-input-field--password' : ''}`}
                    {...props}
                />
                {isPasswordField && (
                    <button
                        type="button"
                        className="auth-input-visibility-toggle"
                        onClick={() => setIsPasswordVisible((prev) => !prev)}
                        aria-label={isPasswordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        title={isPasswordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                        {isPasswordVisible ? <FiEyeOff /> : <FiEye />}
                    </button>
                )}
            </div>
        </div>
    );
};

export default AuthInput;
