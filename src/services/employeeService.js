import api from './api';

export const employeeService = {
  getEmployees: async (params = {}) => {
    const queryParams = new URLSearchParams();

    if (params.page !== undefined && params.page !== null) {
      queryParams.append('page', params.page);
    }
    if (params.size !== undefined && params.size !== null) {
      queryParams.append('size', params.size);
    }
    if (params.sort) {
      queryParams.append('sort', params.sort);
    }
    if (params.department && params.department.trim() !== '') {
      queryParams.append('department', params.department.trim());
    }
    if (params.firstName && params.firstName.trim() !== '') {
      queryParams.append('firstName', params.firstName.trim());
    }
    if (params.minSalary !== undefined && params.minSalary !== null && params.minSalary !== '') {
      queryParams.append('minSalary', params.minSalary);
    }

    const response = await api.get(`/api/employee?${queryParams.toString()}`);
    return response.data;
  },

  getEmployeeById: async (id) => {
    const response = await api.get(`/api/employee/${id}`);
    return response.data;
  },

  createEmployee: async (employeeData) => {
    const response = await api.post('/api/employee', employeeData);
    return response.data;
  },

  updateEmployee: async (id, employeeData) => {
    const response = await api.put(`/api/employee/${id}`, employeeData);
    return response.data;
  },

  deleteEmployee: async (id) => {
    const response = await api.delete(`/api/employee/${id}`);
    return response.data;
  },
};
