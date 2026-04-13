import { useQuery, useMutation, useQueryClient } from 'react-query';
import { eventsAPI } from '../api/events';
import { useSnackbar } from 'notistack';

export const useEvents = (filters = {}) => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  // Получение списка
  const {
    data: eventsData,
    isLoading,
    error,
    refetch
  } = useQuery(['events', filters], () => eventsAPI.getEvents(filters), {
    keepPreviousData: true
  });

  // Создание
  const createMutation = useMutation(eventsAPI.createEvent, {
    onSuccess: () => {
      queryClient.invalidateQueries('events');
      enqueueSnackbar('Мероприятие создано', { variant: 'success' });
    },
    onError: (error) => {
      enqueueSnackbar(
        error.response?.data?.error || 'Ошибка создания',
        { variant: 'error' }
      );
    }
  });

  // Обновление
  const updateMutation = useMutation(
    ({ id, data }) => eventsAPI.updateEvent(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('events');
        enqueueSnackbar('Мероприятие обновлено', { variant: 'success' });
      },
      onError: (error) => {
        enqueueSnackbar(
          error.response?.data?.error || 'Ошибка обновления',
          { variant: 'error' }
        );
      }
    }
  );

  // Удаление
  const deleteMutation = useMutation(eventsAPI.deleteEvent, {
    onSuccess: () => {
      queryClient.invalidateQueries('events');
      enqueueSnackbar('Мероприятие удалено', { variant: 'success' });
    },
    onError: (error) => {
      enqueueSnackbar(
        error.response?.data?.error || 'Ошибка удаления',
        { variant: 'error' }
      );
    }
  });

  return {
    events: eventsData?.events || [],
    pagination: eventsData?.pagination,
    isLoading,
    error,
    refetch,
    createEvent: createMutation.mutate,
    updateEvent: updateMutation.mutate,
    deleteEvent: deleteMutation.mutate
  };
};

// Хук для одного мероприятия
export const useEvent = (id) => {
  return useQuery(['event', id], () => eventsAPI.getEventById(id), {
    enabled: !!id
  });
};
