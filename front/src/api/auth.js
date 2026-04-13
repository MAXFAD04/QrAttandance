import axios from './axios';

export const authAPI = {
  login: async (email, password) => {
    const { data } = await axios.post('/auth/login', { email, password });
    return data;
  },

  register: async (userData) => {
    const { data } = await axios.post('/auth/register', userData);
    return data;
  },

  logout: async () => {
    const { data } = await axios.post('/auth/logout');
    return data;
  },

  getCurrentUser: async () => {
    const { data } = await axios.get('/auth/me');
    return data;
  },

  refreshToken: async (refreshToken) => {
    const { data } = await axios.post('/auth/refresh-token', { refreshToken });
    return data;
  }
};
