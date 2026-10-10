import React, { useState, useEffect } from 'react';
import { X, UserPlus, Save, AlertCircle } from 'lucide-react';

export default function EmployeeFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isSubmitting = false,
  backendErrors = {},
  conflictError = null,
}) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    salary: '',
    joiningDate: '',
  });

  const [clientErrors, setClientErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        firstName: initialData.firstName || '',
        lastName: initialData.lastName || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        department: initialData.department || '',
        salary: initialData.salary !== undefined && initialData.salary !== null ? String(initialData.salary) : '',
        joiningDate: initialData.joiningDate || '',
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        department: '',
        salary: '',
        joiningDate: new Date().toISOString().split('T')[0],
      });
    }
    setClientErrors({});
    setTouched({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const validateField = (field, value) => {
    let err = '';
    const trimmed = String(value || '').trim();

    switch (field) {
      case 'firstName':
        if (!trimmed) err = 'First name is required';
        break;
      case 'lastName':
        if (!trimmed) err = 'Last name is required';
        break;
      case 'email':
        if (!trimmed) {
          err = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
          err = 'Please enter a valid email address';
        }
        break;
      case 'phone':
        if (!trimmed) err = 'Phone number is required';
        break;
      case 'department':
        if (!trimmed) err = 'Department is required';
        break;
      case 'salary':
        if (!trimmed) {
          err = 'Salary is required';
        } else {
          const num = Number(trimmed);
          if (isNaN(num) || num <= 0) {
            err = 'Salary must be a positive number greater than 0';
          }
        }
        break;
      case 'joiningDate':
        if (!trimmed) {
          err = 'Joining date is required';
        } else {
          const selectedDate = new Date(trimmed);
          const today = new Date();
          today.setHours(23, 59, 59, 999);
          if (selectedDate > today) {
            err = 'Joining date cannot be in the future';
          }
        }
        break;
      default:
        break;
    }
    return err;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));

    const error = validateField(name, value);
    setClientErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setClientErrors((prev) => ({ ...prev, [name]: error }));
  };

  const validateAll = () => {
    const errors = {};
    Object.keys(formData).forEach((field) => {
      const err = validateField(field, formData[field]);
      if (err) errors[field] = err;
    });
    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const allTouched = Object.keys(formData).reduce((acc, k) => ({ ...acc, [k]: true }), {});
    setTouched(allTouched);

    const errors = validateAll();
    setClientErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    const payload = {
      ...formData,
      salary: Number(formData.salary),
    };

    onSubmit(payload);
  };

  // Combine client and backend validation errors
  const getFieldError = (field) => {
    if (clientErrors[field]) return clientErrors[field];
    if (backendErrors && backendErrors[field]) return backendErrors[field];
    return null;
  };

  const isEditing = Boolean(initialData && initialData.id);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex-between" style={{ marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              background: 'rgba(99, 102, 241, 0.15)',
              padding: '8px',
              borderRadius: '10px',
              color: '#818cf8'
            }}>
              {isEditing ? <Save size={20} /> : <UserPlus size={20} />}
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {isEditing ? 'Edit Employee Details' : 'Add New Employee'}
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {isEditing ? `Updating employee record #${initialData.id}` : 'Fill in the information below to add a record.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ padding: '6px', borderRadius: '50%', width: '32px', height: '32px' }}
            aria-label="Close Modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* 409 Conflict Alert */}
        {conflictError && (
          <div className="alert alert-danger">
            <AlertCircle size={18} />
            <span>{conflictError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            {/* First Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="emp-firstName">
                First Name <span className="required-star">*</span>
              </label>
              <input
                id="emp-firstName"
                name="firstName"
                type="text"
                className={`input-field ${getFieldError('firstName') ? 'has-error' : ''}`}
                placeholder="John"
                value={formData.firstName}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {getFieldError('firstName') && <span className="error-text">{getFieldError('firstName')}</span>}
            </div>

            {/* Last Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="emp-lastName">
                Last Name <span className="required-star">*</span>
              </label>
              <input
                id="emp-lastName"
                name="lastName"
                type="text"
                className={`input-field ${getFieldError('lastName') ? 'has-error' : ''}`}
                placeholder="Doe"
                value={formData.lastName}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {getFieldError('lastName') && <span className="error-text">{getFieldError('lastName')}</span>}
            </div>
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="emp-email">
              Email Address <span className="required-star">*</span>
            </label>
            <input
              id="emp-email"
              name="email"
              type="email"
              className={`input-field ${getFieldError('email') ? 'has-error' : ''}`}
              placeholder="john.doe@company.com"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {getFieldError('email') && <span className="error-text">{getFieldError('email')}</span>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            {/* Phone */}
            <div className="form-group">
              <label className="form-label" htmlFor="emp-phone">
                Phone Number <span className="required-star">*</span>
              </label>
              <input
                id="emp-phone"
                name="phone"
                type="text"
                className={`input-field ${getFieldError('phone') ? 'has-error' : ''}`}
                placeholder="+1 555-0199"
                value={formData.phone}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {getFieldError('phone') && <span className="error-text">{getFieldError('phone')}</span>}
            </div>

            {/* Department */}
            <div className="form-group">
              <label className="form-label" htmlFor="emp-department">
                Department <span className="required-star">*</span>
              </label>
              <input
                id="emp-department"
                name="department"
                type="text"
                className={`input-field ${getFieldError('department') ? 'has-error' : ''}`}
                placeholder="Engineering, HR, Sales..."
                value={formData.department}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {getFieldError('department') && <span className="error-text">{getFieldError('department')}</span>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            {/* Salary */}
            <div className="form-group">
              <label className="form-label" htmlFor="emp-salary">
                Salary (₹) <span className="required-star">*</span>
              </label>
              <input
                id="emp-salary"
                name="salary"
                type="number"
                step="0.01"
                min="0"
                className={`input-field ${getFieldError('salary') ? 'has-error' : ''}`}
                placeholder="75000"
                value={formData.salary}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {getFieldError('salary') && <span className="error-text">{getFieldError('salary')}</span>}
            </div>

            {/* Joining Date */}
            <div className="form-group">
              <label className="form-label" htmlFor="emp-joiningDate">
                Joining Date <span className="required-star">*</span>
              </label>
              <input
                id="emp-joiningDate"
                name="joiningDate"
                type="date"
                max={new Date().toISOString().split('T')[0]}
                className={`input-field ${getFieldError('joiningDate') ? 'has-error' : ''}`}
                value={formData.joiningDate}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {getFieldError('joiningDate') && <span className="error-text">{getFieldError('joiningDate')}</span>}
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="spinner"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>{isEditing ? 'Save Changes' : 'Create Employee'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
