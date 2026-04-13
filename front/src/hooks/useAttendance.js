import { useQuery, useMutation, useQueryClient } from 'react-query';
import { attendanceAPI } from '../api/attendance';
import { useSnackbar } from 'notistack';

export const useAttendance = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  // Check-in
  const checkInMutation = useMutation(attendanceAPI.checkIn, {
    onSuccess: (data) => {
      queryClient.invalidateQueries('attendance');
      enqueueSnackbar(
        `Отмечено посещение: ${data.attendance.user.fullName}`,
        { variant: 'success' }
      );
    },
    onError: (error) => {
      enqueueSnackbar(
        error.response?.data?.error || 'Ошибка отметки',
        { variant: 'error' }
      );
    }
  });

  return {
    checkIn: checkInMutation.mutate,
    checkInLoading: checkInMutation.isLoading
  };
};

// Посещаемость по мероприятию
export const useEventAttendance = (eventId) => {
  return useQuery(
    ['attendance', 'event', eventId],
    () => attendanceAPI.getAttendanceByEvent(eventId),
    {
      enabled: !!eventId
    }
  );
};

// Посещаемость студента
export const useStudentAttendance = (userId) => {
  return useQuery(
    ['attendance', 'student', userId],
    () => attendanceAPI.getAttendanceByStudent(userId),
    {
      enabled: !!userId
    }
  );
};
