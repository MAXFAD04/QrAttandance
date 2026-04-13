import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

export const formatDate = (date, formatStr = 'dd MMMM yyyy') => {
  if (!date) return '';
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return format(parsedDate, formatStr, { locale: ru });
};

export const formatDateTime = (date) => {
  return formatDate(date, 'dd MMMM yyyy, HH:mm');
};

export const getInitials = (fullName) => {
  if (!fullName) return '';
  const names = fullName.split(' ');
  return names.map((name) => name.charAt(0).toUpperCase()).join('');
};

export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const calculateAttendanceRate = (attended, total) => {
  if (!total || total === 0) return 0;
  return Math.round((attended / total) * 100);
};
