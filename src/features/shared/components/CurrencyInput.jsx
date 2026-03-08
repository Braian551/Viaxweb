import React, { useState, useEffect } from 'react';
import InfoTooltip from './InfoTooltip';

const formatCurrency = (value) => {
    if (value === null || value === undefined || value === '') return '';

    // Convertir a número y redondear (COP no usa decimales usualmente)
    const num = Math.round(Number(value));
    if (isNaN(num)) return '';

    // Formatear a millones/miles con separador de punto
    return num.toLocaleString('es-CO');
};

const parseCurrency = (formattedValue) => {
    if (formattedValue === null || formattedValue === undefined || formattedValue === '') return 0;
    // Extraer solo los números
    const cleanNumStr = String(formattedValue).replace(/\D/g, '');
    return cleanNumStr ? parseInt(cleanNumStr, 10) : 0;
};

const CurrencyInput = ({
    value,
    onChange,
    label,
    icon: Icon,
    hint,
    placeholder = '0',
    className = 'v-form-input',
    disabled = false,
    error = null,
    min = 0,
    max = null,
    onValidationError = null,
    info = null
}) => {
    const [displayValue, setDisplayValue] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [localError, setLocalError] = useState(null);

    // Sincronizar el prop "value" externo (numérico) con el estado interno formateado (string)
    useEffect(() => {
        setDisplayValue(formatCurrency(value));
    }, [value]);

    useEffect(() => {
        setLocalError(error);
    }, [error]);

    const validate = (val) => {
        if (min !== null && val < min) {
            return `Mínimo: ${formatCurrency(min)}`;
        }
        if (max !== null && val > max) {
            return `Máximo: ${formatCurrency(max)}`;
        }
        return null;
    };

    const handleChange = (e) => {
        const rawString = e.target.value;
        const numberValue = parseCurrency(rawString);

        // Validación local inmediata
        const validationMsg = validate(numberValue);
        setLocalError(validationMsg);

        if (onValidationError) {
            onValidationError(validationMsg);
        }

        // Actualizamos la vista inmediatamente
        setDisplayValue(formatCurrency(numberValue));

        // Disparamos el evento hacia el padre
        if (onChange) {
            onChange({ ...e, target: { ...e.target, value: numberValue, error: validationMsg } });
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            animation: localError ? 'v-shake 0.4s cubic-bezier(.36,.07,.19,.97) both' : 'none'
        }}>
            {label && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <label className="v-form-label" style={{
                        fontSize: '0.82rem',
                        gap: '5px',
                        color: localError ? '#f44336' : 'var(--text-secondary)',
                        transition: 'color 0.2s',
                        margin: 0
                    }}>
                        {Icon && <Icon size={13} style={{ opacity: 0.7 }} />}
                        {label}
                    </label>
                    {info && <InfoTooltip title={label} content={info} />}
                </div>
            )}
            <div style={{ position: 'relative' }}>
                <input
                    className={`${className} ${localError ? 'v-input-error' : ''}`}
                    type="text"
                    value={displayValue}
                    onChange={handleChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={placeholder}
                    disabled={disabled}
                    style={{
                        width: '100%',
                        paddingRight: '50px',
                        textAlign: 'left',
                        borderColor: localError ? '#f44336' : (isFocused ? 'var(--primary)' : 'var(--border)'),
                        boxShadow: isFocused
                            ? (localError ? '0 0 0 3px rgba(244, 67, 54, 0.15)' : '0 0 0 3px var(--primary-bg)')
                            : 'none',
                        transition: 'all 0.2s ease',
                    }}
                />
                <span style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    color: localError ? '#f44336' : 'var(--text-secondary, #64748b)',
                    pointerEvents: 'none',
                    letterSpacing: '0.03em',
                    opacity: disabled ? 0.3 : 0.6,
                    transition: 'color 0.2s'
                }}>
                    COP
                </span>
            </div>

            {(localError || hint) && (
                <span style={{
                    fontSize: '0.75rem',
                    color: localError ? '#f44336' : 'var(--text-secondary, #64748b)',
                    fontStyle: localError ? 'normal' : 'italic',
                    fontWeight: localError ? 600 : 400,
                    marginTop: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                }}>
                    {localError ? localError : hint}
                </span>
            )}

            <style>{`
                @keyframes v-shake {
                    10%, 90% { transform: translate3d(-1px, 0, 0); }
                    20%, 80% { transform: translate3d(2px, 0, 0); }
                    30%, 50%, 70% { transform: translate3d(-3px, 0, 0); }
                    40%, 60% { transform: translate3d(3px, 0, 0); }
                }
                .v-input-error {
                    border-color: #f44336 !important;
                }
            `}</style>
        </div>
    );
};

export default CurrencyInput;
