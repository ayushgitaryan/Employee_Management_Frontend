import React from 'react';
import { Search, Filter, X, IndianRupee, Building } from 'lucide-react';

export default function EmployeeFilter({ filters, onChange, onClear }) {
  const handleChange = (field, value) => {
    onChange({
      ...filters,
      [field]: value,
    });
  };

  const hasActiveFilters = Boolean(filters.firstName || filters.department || filters.minSalary);

  return (
    <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>
          <Filter size={18} color="#6366f1" />
          <span>Filter & Search Employees</span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClear}
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
          >
            <X size={14} />
            <span>Clear Filters</span>
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        {/* First Name Filter */}
        <div style={{ position: 'relative' }}>
          <label className="form-label" htmlFor="filter-firstName">
            First Name
          </label>
          <div style={{ position: 'relative' }}>
            <input
              id="filter-firstName"
              type="text"
              className="input-field"
              placeholder="Search by first name..."
              value={filters.firstName || ''}
              onChange={(e) => handleChange('firstName', e.target.value)}
              style={{ paddingLeft: '38px' }}
            />
            <Search
              size={16}
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
            />
          </div>
        </div>

        {/* Department Filter */}
        <div style={{ position: 'relative' }}>
          <label className="form-label" htmlFor="filter-department">
            Department
          </label>
          <div style={{ position: 'relative' }}>
            <input
              id="filter-department"
              type="text"
              className="input-field"
              placeholder="e.g. IT, HR, Sales..."
              value={filters.department || ''}
              onChange={(e) => handleChange('department', e.target.value)}
              style={{ paddingLeft: '38px' }}
            />
            <Building
              size={16}
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
            />
          </div>
        </div>

        {/* Min Salary Filter */}
        <div style={{ position: 'relative' }}>
          <label className="form-label" htmlFor="filter-minSalary">
            Min Salary (₹)
          </label>
          <div style={{ position: 'relative' }}>
            <input
              id="filter-minSalary"
              type="number"
              min="0"
              className="input-field"
              placeholder="Minimum salary..."
              value={filters.minSalary || ''}
              onChange={(e) => handleChange('minSalary', e.target.value)}
              style={{ paddingLeft: '38px' }}
            />
            <IndianRupee
              size={16}
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
