import api from './api';

export const dashboardService = {
  // My Profile
  getMyProfile: async () => {
    const response = await api.get('/api/employee/me');
    return response.data;
  },

  // Attendance
  getTodayAttendance: async () => {
    const response = await api.get('/api/attendance/me');
    return response.data;
  },

  checkIn: async () => {
    const response = await api.post('/api/attendance/check-in');
    return response.data;
  },

  checkOut: async () => {
    const response = await api.post('/api/attendance/check-out');
    return response.data;
  },

  getAttendanceHistory: async () => {
    const response = await api.get('/api/attendance/me/history');
    return response.data;
  },

  getAttendanceSummary: async () => {
    const response = await api.get('/api/attendance/me/summary');
    return response.data;
  },

  // Leave Management
  getLeaveSummary: async () => {
    const response = await api.get('/api/leaves/me');
    return response.data;
  },

  applyLeave: async (leaveData) => {
    const response = await api.post('/api/leaves', leaveData);
    return response.data;
  },

  cancelLeave: async (leaveId) => {
    const response = await api.delete(`/api/leaves/${leaveId}`);
    return response.data;
  },

  // Payroll
  getPayrollHistory: async () => {
    const response = await api.get('/api/payroll/me');
    return response.data;
  },

  // Notifications
  getNotifications: async () => {
    const response = await api.get('/api/notifications/me');
    return response.data;
  },

  markNotificationAsRead: async (notificationId) => {
    const response = await api.put(`/api/notifications/${notificationId}/read`);
    return response.data;
  },
};
