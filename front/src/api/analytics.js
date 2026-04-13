import axios from './axios';

export const analyticsAPI = {
  getDashboardStats: async (params) => {
    const { data } = await axios.get('/analytics/dashboard', { params });
    return data;
  },

  getStudentAnalytics: async (params) => {
    const { data } = await axios.get('/analytics/students', { params });
    return data;
  },

  getEventTrends: async (params) => {
    const { data } = await axios.get('/analytics/events/trends', { params });
    return data;
  }
};
