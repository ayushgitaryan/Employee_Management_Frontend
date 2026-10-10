import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Edit, Trash2, ArrowUpDown, ArrowUp, ArrowDown, UserX, Mail, Phone, Calendar, IndianRupee, Building } from 'lucide-react';

export default function EmployeeTable({
  employees,
  loading,
  currentSort,
  onSortChange,
  onEdit,
  onDelete,
}) {
  const { canCreateOrUpdate, canDelete } = useAuth();

  const handleSalarySortToggle = () => {
    if (currentSort === 'salary,asc') {
      onSortChange('salary,desc');
    } else {
      onSortChange('salary,asc');
    }
  };

  const formatSalary = (amount) => {
    if (amount === undefined || amount === null) return '₹0';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="table-container" style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
      <table className="custom-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Employee</th>
            <th>Contact</th>
            <th>Department</th>
            <th className="sortable" onClick={handleSalarySortToggle} title="Click to sort by salary">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>Salary</span>
                {currentSort === 'salary,asc' ? (
                  <ArrowUp size={14} color="#6366f1" />
                ) : currentSort === 'salary,desc' ? (
                  <ArrowDown size={14} color="#6366f1" />
                ) : (
                  <ArrowUpDown size={14} color="var(--text-muted)" />
                )}
              </div>
            </th>
            <th>Joining Date</th>
            {(canCreateOrUpdate || canDelete) && <th style={{ textAlign: 'right' }}>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={canCreateOrUpdate || canDelete ? 7 : 6} style={{ textAlign: 'center', padding: '48px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                  <div className="spinner spinner-lg"></div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Loading employees...</span>
                </div>
              </td>
            </tr>
          ) : employees.length === 0 ? (
            <tr>
              <td colSpan={canCreateOrUpdate || canDelete ? 7 : 6} style={{ textAlign: 'center', padding: '48px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: 'var(--text-muted)' }}>
                  <UserX size={44} strokeWidth={1.5} />
                  <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>No employees found</p>
                  <p style={{ fontSize: '0.85rem' }}>Try adjusting your search filters or add a new employee.</p>
                </div>
              </td>
            </tr>
          ) : (
            employees.map((emp) => (
              <tr key={emp.id}>
                <td style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  #{emp.id}
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: 'rgba(99, 102, 241, 0.12)',
                      color: '#818cf8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      border: '1px solid rgba(99, 102, 241, 0.2)'
                    }}>
                      {emp.firstName ? emp.firstName.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {emp.firstName} {emp.lastName}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.83rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                      <Mail size={13} color="var(--text-muted)" />
                      {emp.email}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                      <Phone size={13} />
                      {emp.phone}
                    </span>
                  </div>
                </td>
                <td>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.82rem',
                    fontWeight: 500
                  }}>
                    <Building size={13} color="#94a3b8" />
                    {emp.department}
                  </span>
                </td>
                <td>
                  <span style={{ fontWeight: 700, color: '#34d399', fontSize: '0.92rem' }}>
                    {formatSalary(emp.salary)}
                  </span>
                </td>
                <td>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    <Calendar size={14} color="var(--text-muted)" />
                    {formatDate(emp.joiningDate)}
                  </span>
                </td>
                {(canCreateOrUpdate || canDelete) && (
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                      {canCreateOrUpdate && (
                        <button
                          onClick={() => onEdit(emp)}
                          className="btn btn-secondary"
                          style={{ padding: '6px 10px', fontSize: '0.78rem' }}
                          title="Edit Employee"
                        >
                          <Edit size={14} color="#818cf8" />
                          <span>Edit</span>
                        </button>
                      )}

                      {canDelete && (
                        <button
                          onClick={() => onDelete(emp)}
                          className="btn btn-danger"
                          style={{ padding: '6px 10px', fontSize: '0.78rem' }}
                          title="Delete Employee"
                        >
                          <Trash2 size={14} />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
