import axios from './axios';

export const eventsAPI = {
  // Получение списка мероприятий с фильтрами
  getEvents: async (params) => {
    const { data } = await axios.get('/events', { params });
    return data;
  },

  // Получение одного мероприятия
  getEventById: async (id) => {
    const { data } = await axios.get(`/events/${id}`);
    return data;
  },

  // Создание мероприятия
  createEvent: async (eventData) => {
    const { data } = await axios.post('/events', eventData);
    return data;
  },

  // Обновление мероприятия
  updateEvent: async (id, eventData) => {
    const { data } = await axios.put(`/events/${id}`, eventData);
    return data;
  },

  // Удаление мероприятия
  deleteEvent: async (id) => {
    const { data } = await axios.delete(`/events/${id}`);
    return data;
  },

  // Публикация мероприятия
  publishEvent: async (id) => {
    const { data } = await axios.patch(`/events/${id}/publish`);
    return data;
  },

  // Получение QR-кода (статический, legacy)
  getEventQRCode: async (id) => {
    const { data } = await axios.get(`/events/${id}/qrcode`);
    return data;
  },

  // Ротируемый QR-код (обновляется каждые 10 сек)
  getRotatingQRCode: async (id) => {
    const { data } = await axios.get(`/events/${id}/qrcode/active`);
    return data;
  }
};
