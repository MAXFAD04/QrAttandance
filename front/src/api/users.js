import axios from './axios';

export const usersAPI = {
  getUsers: async (params) => {
    const { data } = await axios.get('/users', { params });
    return data;
  },

  getUserById: async (id) => {
    const { data } = await axios.get(`/users/${id}`);
    return data;
  },

  updateUser: async (id, userData) => {
    const { data } = await axios.put(`/users/${id}`, userData);
    return data;
  },

  toggleUserStatus: async (id) => {
    const { data } = await axios.patch(`/users/${id}/toggle-status`);
    return data;
  },

  deleteUser: async (id) => {
    const { data } = await axios.delete(`/users/${id}`);
    return data;
  },

  getStudentQRCode: async (id) => {
    const { data } = await axios.get(`/users/${id}/qrcode`);
    return data;
  },

  changePassword: async (id, passwordData) => {
    const { data } = await axios.patch(`/users/${id}/change-password`, passwordData);
    return data;
  }
};
