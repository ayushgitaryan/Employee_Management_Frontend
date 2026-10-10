import api from './api';

export const authService = {
  login: async (username, password) => {
    const response = await api.post('/api/auth/login', { username, password });
    return response.data; // { token: string }
  },

  register: async (username, password, role) => {
    const response = await api.post('/api/auth/register', { username, password, role });
    return response.data; // string response (e.g. "User registered successfully")
  },
};
