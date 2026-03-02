import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

/**
 * Pagination - Reusable pagination controls
 * Glass design, solid buttons
 */
const Pagination = ({ page, totalPages, onPageChange, style = {} }) => {
    if (totalPages <= 1) return null;

    return (
        <div className="v-pagination" style={style}>
            <span className="v-pagination__info">
                Página {page} de {totalPages}
            </span>
            <div className="v-pagination__actions">
                <button
                    className="v-pagination__btn"
                    disabled={page <= 1}
                    onClick={() => onPageChange(page - 1)}
                >
                    <FiChevronLeft size={16} />
                    <span>Anterior</span>
                </button>
                <button
                    className="v-pagination__btn"
                    disabled={page >= totalPages}
                    onClick={() => onPageChange(page + 1)}
                >
                    <span>Siguiente</span>
                    <FiChevronRight size={16} />
                </button>
            </div>
        </div>
    );
};

export default Pagination;
