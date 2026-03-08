import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { FiSearch, FiX, FiCheck, FiChevronDown } from 'react-icons/fi';
import './SearchableModal.css';

/**
 * SearchableModal — Reusable dropdown component using portal
 * Renders the dropdown in a portal to avoid overflow clipping issues.
 */
const SearchableModal = ({
    label,
    icon: Icon,
    displayValue,
    options = [],
    onSelect,
    loading = false,
    placeholder = 'Seleccionar...',
    renderOption,
    disabled = false,
    required = false,
    hint,
    error,
}) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
    const triggerRef = useRef(null);
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);

    const filtered = useMemo(() => {
        if (!search.trim()) return options;
        const q = search.toLowerCase();
        return options.filter(o =>
            (renderOption ? renderOption(o) : String(o)).toLowerCase().includes(q)
        );
    }, [options, search, renderOption]);

    // Calculate position when opening
    const updatePosition = useCallback(() => {
        if (!triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const dropdownHeight = 320;
        const showAbove = spaceBelow < dropdownHeight && rect.top > dropdownHeight;

        setDropdownPos({
            top: showAbove ? rect.top - dropdownHeight - 6 : rect.bottom + 6,
            left: rect.left,
            width: rect.width,
        });
    }, []);

    // Update position on scroll/resize when open
    useEffect(() => {
        if (!open) return;
        updatePosition();
        const handler = () => updatePosition();
        window.addEventListener('scroll', handler, true);
        window.addEventListener('resize', handler);
        return () => {
            window.removeEventListener('scroll', handler, true);
            window.removeEventListener('resize', handler);
        };
    }, [open, updatePosition]);

    // Close on outside click
    useEffect(() => {
        if (!open) return;
        const handler = (e) => {
            if (
                triggerRef.current && !triggerRef.current.contains(e.target) &&
                dropdownRef.current && !dropdownRef.current.contains(e.target)
            ) {
                setOpen(false);
                setSearch('');
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    // Focus search on open
    useEffect(() => {
        if (open && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 80);
        }
    }, [open]);

    const handleOpen = () => {
        if (disabled) return;
        updatePosition();
        setOpen(p => !p);
    };

    const handleSelect = (opt) => {
        onSelect(opt);
        setOpen(false);
        setSearch('');
    };

    return (
        <div className="sm-container">
            {label && (
                <label className="sm-label">
                    {Icon && <Icon size={13} className="sm-label-icon" />}
                    {label}
                    {required && <span className="sm-required">*</span>}
                </label>
            )}
            <button
                type="button"
                ref={triggerRef}
                className={`sm-trigger ${error ? 'sm-trigger--error' : ''} ${disabled ? 'sm-trigger--disabled' : ''}`}
                onClick={handleOpen}
                disabled={disabled}
            >
                <span className={`sm-trigger-text ${displayValue ? '' : 'sm-trigger-placeholder'}`}>
                    {loading ? 'Cargando...' : (displayValue || placeholder)}
                </span>
                <FiChevronDown
                    size={16}
                    className={`sm-trigger-chevron ${open ? 'sm-trigger-chevron--open' : ''}`}
                />
            </button>

            {/* Dropdown rendered via Portal to avoid overflow clipping */}
            {open && createPortal(
                <>
                    <div className="sm-backdrop" onClick={() => { setOpen(false); setSearch(''); }} />
                    <div
                        ref={dropdownRef}
                        className="sm-dropdown"
                        style={{
                            position: 'fixed',
                            top: dropdownPos.top,
                            left: dropdownPos.left,
                            width: dropdownPos.width,
                            minWidth: 220,
                        }}
                    >
                        <div className="sm-search-bar">
                            <FiSearch size={15} className="sm-search-icon" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Buscar..."
                                className="sm-search-input"
                            />
                            {search && (
                                <button
                                    type="button"
                                    className="sm-search-clear"
                                    onClick={() => setSearch('')}
                                >
                                    <FiX size={14} />
                                </button>
                            )}
                        </div>
                        <div className="sm-options-list">
                            {loading ? (
                                <div className="sm-empty">Cargando opciones...</div>
                            ) : filtered.length === 0 ? (
                                <div className="sm-empty">
                                    {search ? 'Sin resultados' : 'No hay opciones disponibles'}
                                </div>
                            ) : (
                                filtered.map((opt, i) => {
                                    const display = renderOption ? renderOption(opt) : String(opt);
                                    const isSelected = displayValue === display;
                                    return (
                                        <button
                                            key={i}
                                            type="button"
                                            className={`sm-option ${isSelected ? 'sm-option--selected' : ''}`}
                                            onClick={() => handleSelect(opt)}
                                        >
                                            <span className="sm-option-text">{display}</span>
                                            {isSelected && <FiCheck size={15} className="sm-option-check" />}
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </>,
                document.body
            )}

            {hint && !error && <span className="sm-hint">{hint}</span>}
            {error && <span className="sm-error-text">{error}</span>}
        </div>
    );
};

export default SearchableModal;
