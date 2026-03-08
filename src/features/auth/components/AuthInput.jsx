import React, { useState } from 'react';
import { FiEye, FiEyeOff, FiAlertCircle } from 'react-icons/fi';
import './AuthInput.css';

/**
 * AuthInput — Enhanced with real-time validation support
 * Props:
 *   - validate: (value) => string|null — returns error message or null
 *   - error: string — externally controlled error message
 *   - hint: string — helper text below input
 *   - filter: (value) => string — filters input value (e.g., only numbers)
 */
const AuthInput = ({ label, icon, type = 'text', validate, error: externalError, hint, filter, onChange, ...props }) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [touched, setTouched] = useState(false);
    const [internalError, setInternalError] = useState('');

    const isMaterialIcon = typeof icon === 'string';
    const isPasswordField = type === 'password';
    const inputType = isPasswordField && isPasswordVisible ? 'text' : type;

    const displayError = externalError || (touched ? internalError : '');

    const handleChange = (e) => {
        let value = e.target.value;

        // Apply filter if provided (e.g., only numbers for NIT)
        if (filter) {
            value = filter(value);
            // Create a synthetic-like event with the filtered value
            e = { ...e, target: { ...e.target, value, id: e.target.id } };
        }

        // Run validation
        if (validate) {
            const err = validate(value);
            setInternalError(err || '');
        }

        if (onChange) onChange(e);
    };

    const handleBlur = () => {
        setTouched(true);
        if (validate && props.value !== undefined) {
            const err = validate(props.value);
            setInternalError(err || '');
        }
    };

    return (
        <div className="auth-input-container">
            <label className="auth-input-label">{label}</label>
            <div className={`auth-input-wrapper ${displayError ? 'auth-input-wrapper--error' : ''}`}>
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
                    onChange={handleChange}
                    onBlur={handleBlur}
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
            {displayError && (
                <span className="auth-input-error">
                    <FiAlertCircle size={12} />
                    {displayError}
                </span>
            )}
            {hint && !displayError && (
                <span className="auth-input-hint">{hint}</span>
            )}
        </div>
    );
};

export default AuthInput;
