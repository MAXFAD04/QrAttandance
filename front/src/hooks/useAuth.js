import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuthStore } from '../store/authStore';
import { authAPI } from '../api/auth';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';

export const useAuth = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { setAuth, logout: logoutStore, user, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  // Логин
  const loginMutation = useMutation(
    ({ email, password }) => authAPI.login(email, password),
    {
      onSuccess: (data) => {
        setAuth(data.user, data.tokens);
        enqueueSnackbar('Вход выполнен успешно', { variant: 'success' });
        
        // Редирект в зависимости от роли
        if (data.user.role === 'student') {
          navigate('/student/dashboard');
        } else {
          navigate('/dashboard');
        }
      },
      onError: (error) => {
        enqueueSnackbar(
          error.response?.data?.error || 'Ошибка входа',
          { variant: 'error' }
        );
      }
    }
  );

  // Выход
  const logoutMutation = useMutation(() => authAPI.logout(), {
    onSuccess: () => {
      logoutStore();
      queryClient.clear();
      navigate('/login');
      enqueueSnackbar('Выход выполнен', { variant: 'info' });
    },
    onError: () => {
      // Выход в любом случае
      logoutStore();
      navigate('/login');
    }
  });

  // Получение текущего пользователя
  const { data: currentUser, refetch: refetchUser } = useQuery(
    'currentUser',
    authAPI.getCurrentUser,
    {
      enabled: isAuthenticated,
      retry: false,
      onError: () => {
        logoutStore();
        navigate('/login');
      }
    }
  );

  return {
    user,
    isAuthenticated,
    login: loginMutation.mutate,
    loginLoading: loginMutation.isLoading,
    logout: logoutMutation.mutate,
    refetchUser
  };
};
