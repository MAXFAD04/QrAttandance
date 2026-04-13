import axios from './axios';

export const attendanceAPI = {
  // Отметка посещаемости
  checkIn: async (checkInData) => {
    const { data } = await axios.post('/attendance/checkin', checkInData);
    return data;
  },

  // Посещаемость по мероприятию
  getAttendanceByEvent: async (eventId) => {
    const { data } = await axios.get(`/attendance/event/${eventId}`);
    return data;
  },

  // Посещаемость студента
  getAttendanceByStudent: async (userId) => {
    const { data } = await axios.get(`/attendance/student/${userId}`);
    return data;
  },

  // Обновление статуса
  updateAttendanceStatus: async (id, statusData) => {
    const { data } = await axios.patch(`/attendance/${id}`, statusData);
    return data;
  },

  // Удаление записи
  deleteAttendance: async (id) => {
    const { data } = await axios.delete(`/attendance/${id}`);
    return data;
  }
};
