import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { employeeService } from '../services/employeeService';
import Navbar from '../components/Navbar';
import EmployeeFilter from '../components/EmployeeFilter';
import EmployeeTable from '../components/EmployeeTable';
import Pagination from '../components/Pagination';
import EmployeeFormModal from '../components/EmployeeFormModal';
import ConfirmModal from '../components/ConfirmModal';
import { UserPlus, AlertCircle, RefreshCw, ShieldAlert } from 'lucide-react';

export default function EmployeeListPage() {
  const { canCreateOrUpdate, canDelete, role } = useAuth();

  // State management
  const [employees, setEmployees] = useState([]);
  const [pageData, setPageData] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [sort, setSort] = useState('');
  const [filters, setFilters] = useState({
    firstName: '',
    department: '',
    minSalary: '',
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [forbiddenError, setForbiddenError] = useState('');
  const [successToast, setSuccessToast] = useState('');

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [isSubmittingModal, setIsSubmittingModal] = useState(false);
  const [modalBackendErrors, setModalBackendErrors] = useState({});
  const [modalConflictError, setModalConflictError] = useState(null);

  // Modal State for Delete Confirmation
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingEmployee, setDeletingEmployee] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch employees
  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setError('');
    setForbiddenError('');

    try {
      const data = await employeeService.getEmployees({
        page: currentPage,
        size: pageSize,
        sort: sort || undefined,
        firstName: filters.firstName,
        department: filters.department,
        minSalary: filters.minSalary,
      });

      setEmployees(data.content || []);
      setPageData({
        content: data.content || [],
        totalElements: data.totalElements || 0,
        totalPages: data.totalPages || 0,
        number: data.number !== undefined ? data.number : currentPage,
        size: data.size || pageSize,
        first: data.first !== undefined ? data.first : true,
        last: data.last !== undefined ? data.last : true,
      });
    } catch (err) {
      console.error('Failed to fetch employees:', err);
      if (err.response) {
        if (err.response.status === 403) {
          setForbiddenError('Forbidden: You do not have permission to view employee records.');
        } else if (err.response.data && err.response.data.message) {
          setError(err.response.data.message);
        } else {
          setError(`Failed to fetch employees (Status ${err.response.status})`);
        }
      } else {
        setError('Network error: Could not reach backend server.');
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, sort, filters]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Debounced search reset to page 0 when filters change
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(0);
  };

  const handleClearFilters = () => {
    setFilters({ firstName: '', department: '', minSalary: '' });
    setCurrentPage(0);
  };

  const handleSortChange = (newSort) => {
    setSort(newSort);
    setCurrentPage(0);
  };

  const showToast = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 3500);
  };

  // Add / Edit Modal handlers
  const handleOpenAddModal = () => {
    if (!canCreateOrUpdate) {
      setForbiddenError('Forbidden: Your role does not allow creating employees.');
      return;
    }
    setEditingEmployee(null);
    setModalBackendErrors({});
    setModalConflictError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (emp) => {
    if (!canCreateOrUpdate) {
      setForbiddenError('Forbidden: Your role does not allow editing employees.');
      return;
    }
    setEditingEmployee(emp);
    setModalBackendErrors({});
    setModalConflictError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEmployee(null);
    setModalBackendErrors({});
    setModalConflictError(null);
  };

  const handleFormSubmit = async (formData) => {
    setIsSubmittingModal(true);
    setModalBackendErrors({});
    setModalConflictError(null);
    setForbiddenError('');

    try {
      if (editingEmployee) {
        await employeeService.updateEmployee(editingEmployee.id, formData);
        showToast(`Employee "${formData.firstName} ${formData.lastName}" updated successfully!`);
      } else {
        await employeeService.createEmployee(formData);
        showToast(`Employee "${formData.firstName} ${formData.lastName}" created successfully!`);
      }
      handleCloseModal();
      fetchEmployees();
    } catch (err) {
      console.error('Save employee error:', err);
      if (err.response) {
        const { status, data } = err.response;
        if (status === 409) {
          // Conflict error (duplicate email)
          setModalConflictError(data.message || 'Email already exists. Please use a unique email address.');
        } else if (status === 400) {
          // Bad request (field validation error object)
          if (typeof data === 'object' && !data.message) {
            setModalBackendErrors(data);
          } else {
            setModalConflictError(data.message || 'Validation error. Please check form inputs.');
          }
        } else if (status === 403) {
          setForbiddenError('Forbidden: You are not authorized to perform this operation.');
          handleCloseModal();
        } else if (data && data.message) {
          setModalConflictError(data.message);
        } else {
          setModalConflictError(`Server error (${status}). Could not save record.`);
        }
      } else {
        setModalConflictError('Network error while saving employee.');
      }
    } finally {
      setIsSubmittingModal(false);
    }
  };

  // Delete Modal handlers
  const handleOpenDeleteModal = (emp) => {
    if (!canDelete) {
      setForbiddenError('Forbidden: Only ADMIN role can delete employee records.');
      return;
    }
    setDeletingEmployee(emp);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingEmployee(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingEmployee) return;
    setIsDeleting(true);
    setForbiddenError('');

    try {
      await employeeService.deleteEmployee(deletingEmployee.id);
      showToast(`Employee "${deletingEmployee.firstName} ${deletingEmployee.lastName}" deleted.`);
      handleCloseDeleteModal();
      fetchEmployees();
    } catch (err) {
      console.error('Delete employee error:', err);
      if (err.response) {
        if (err.response.status === 403) {
          setForbiddenError('Forbidden: You do not have permission to delete this employee.');
        } else if (err.response.data && err.response.data.message) {
          setError(err.response.data.message);
        } else {
          setError(`Delete failed (Status ${err.response.status})`);
        }
      } else {
        setError('Network error while deleting employee.');
      }
      handleCloseDeleteModal();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1, maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '28px 24px' }}>
        {/* Page Top Banner */}
        <div className="flex-between" style={{ marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Employee Directory
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Manage employee profiles, roles, salaries, and department information.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={fetchEmployees}
              className="btn btn-secondary"
              title="Refresh table data"
            >
              <RefreshCw size={16} className={loading ? 'spinner' : ''} />
              <span>Refresh</span>
            </button>

            {canCreateOrUpdate && (
              <button
                onClick={handleOpenAddModal}
                className="btn btn-primary"
                style={{ padding: '10px 20px' }}
              >
                <UserPlus size={18} />
                <span>Add Employee</span>
              </button>
            )}
          </div>
        </div>

        {/* Global Notifications */}
        {forbiddenError && (
          <div className="alert alert-danger" style={{ marginBottom: '20px' }}>
            <ShieldAlert size={20} />
            <div style={{ flex: 1 }}>
              <strong>Access Denied: </strong>
              {forbiddenError}
            </div>
            <button
              onClick={() => setForbiddenError('')}
              style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer', fontWeight: 700 }}
            >
              ×
            </button>
          </div>
        )}

        {error && (
          <div className="alert alert-danger" style={{ marginBottom: '20px' }}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {successToast && (
          <div className="alert alert-success" style={{ marginBottom: '20px' }}>
            <span style={{ fontWeight: 600 }}>{successToast}</span>
          </div>
        )}

        {/* Search & Filter Bar */}
        <EmployeeFilter
          filters={filters}
          onChange={handleFilterChange}
          onClear={handleClearFilters}
        />

        {/* Employee Table & Pagination */}
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          <EmployeeTable
            employees={employees}
            loading={loading}
            currentSort={sort}
            onSortChange={handleSortChange}
            onEdit={handleOpenEditModal}
            onDelete={handleOpenDeleteModal}
          />

          {!loading && pageData && pageData.totalPages > 0 && (
            <Pagination
              pageData={pageData}
              onPageChange={(newP) => setCurrentPage(newP)}
            />
          )}
        </div>
      </main>

      {/* Add / Edit Form Modal */}
      <EmployeeFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        initialData={editingEmployee}
        isSubmitting={isSubmittingModal}
        backendErrors={modalBackendErrors}
        conflictError={modalConflictError}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete Employee Record"
        message={
          deletingEmployee
            ? `Are you sure you want to permanently delete employee "${deletingEmployee.firstName} ${deletingEmployee.lastName}" (#${deletingEmployee.id})?`
            : 'Are you sure you want to delete this record?'
        }
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseDeleteModal}
        isConfirming={isDeleting}
      />
    </div>
  );
}
