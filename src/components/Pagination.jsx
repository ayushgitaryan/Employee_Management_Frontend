import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ pageData, onPageChange }) {
  if (!pageData) return null;

  const { number: currentPage = 0, totalPages = 1, totalElements = 0, first = true, last = true, size = 10 } = pageData;

  const startRecord = totalElements === 0 ? 0 : currentPage * size + 1;
  const endRecord = Math.min((currentPage + 1) * size, totalElements);

  // Generate array of page numbers
  const pageNumbers = [];
  for (let i = 0; i < totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="flex-between" style={{ padding: '16px 20px', background: 'var(--bg-card)', borderTop: '1px solid var(--border-color)', borderBottomLeftRadius: 'var(--radius-md)', borderBottomRightRadius: 'var(--radius-md)', flexWrap: 'wrap', gap: '12px' }}>
      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        Showing <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{startRecord}</span> to{' '}
        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{endRecord}</span> of{' '}
        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{totalElements}</span> employees
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={first}
          className="btn btn-secondary"
          style={{ padding: '6px 12px', fontSize: '0.82rem' }}
          aria-label="Previous Page"
        >
          <ChevronLeft size={16} />
          <span>Prev</span>
        </button>

        {pageNumbers.map((p) => {
          const isActive = p === currentPage;
          return (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={isActive ? 'btn btn-primary' : 'btn btn-secondary'}
              style={{
                width: '32px',
                height: '32px',
                padding: 0,
                fontSize: '0.85rem',
                fontWeight: isActive ? 700 : 500,
              }}
            >
              {p + 1}
            </button>
          );
        })}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={last}
          className="btn btn-secondary"
          style={{ padding: '6px 12px', fontSize: '0.82rem' }}
          aria-label="Next Page"
        >
          <span>Next</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
