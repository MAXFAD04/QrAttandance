import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  InputAdornment,
  LinearProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { usersAPI } from '../api/users';
import UsersList from '../components/users/UsersList';
import EditStudentDialog from '../components/users/EditStudentDialog';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useSnackbar } from 'notistack';

const UsersPage = () => {
  const [editStudent, setEditStudent] = useState(null);

  const [filters, setFilters] = useState({
    role: '',
    faculty: '',
    search: '',
    page: 1,
    limit: 20
  });

  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const { data: usersData, isLoading, isFetching } = useQuery(
    ['users', filters],
    () => usersAPI.getUsers(filters),
    { keepPreviousData: true }
  );

  const deleteMutation = useMutation(usersAPI.deleteUser, {
    onSuccess: () => {
      queryClient.invalidateQueries('users');
      enqueueSnackbar('Пользователь удалён', { variant: 'success' });
    },
    onError: () => {
      enqueueSnackbar('Ошибка удаления', { variant: 'error' });
    }
  });

  const toggleStatusMutation = useMutation(usersAPI.toggleUserStatus, {
    onSuccess: () => {
      queryClient.invalidateQueries('users');
      enqueueSnackbar('Статус изменён', { variant: 'success' });
    },
    onError: () => {
      enqueueSnackbar('Ошибка изменения статуса', { variant: 'error' });
    }
  });

  const updateStudentMutation = useMutation(
    ({ id, data }) => usersAPI.updateUser(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        enqueueSnackbar('Данные студента обновлены', { variant: 'success' });
        setEditStudent(null);
      },
      onError: (error) => {
        enqueueSnackbar(
          error.response?.data?.error || 'Не удалось сохранить изменения',
          { variant: 'error' }
        );
      }
    }
  );

  const handleDelete = (id) => {
    if (window.confirm('Удалить пользователя?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleStatus = (id) => {
    toggleStatusMutation.mutate(id);
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value, page: 1 }));
  };

  if (isLoading && !usersData) {
    return <LoadingSpinner />;
  }

  return (
    <Box>
      {isFetching ? (
        <LinearProgress sx={{ position: 'sticky', top: 0, zIndex: 1, mb: 2 }} />
      ) : null}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Пользователи
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />}>
          Добавить пользователя
        </Button>
      </Box>

      {/* Фильтры */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Поиск по имени или email..."
          size="small"
          sx={{ minWidth: 300 }}
          value={filters.search}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
          onChange={(e) => handleFilterChange('search', e.target.value)}
        />

        <TextField
          select
          label="Роль"
          size="small"
          value={filters.role}
          onChange={(e) => handleFilterChange('role', e.target.value)}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">Все</MenuItem>
          <MenuItem value="admin">Администратор</MenuItem>
          <MenuItem value="organizer">Организатор</MenuItem>
          <MenuItem value="student">Студент</MenuItem>
        </TextField>

        <TextField
          select
          label="Факультет"
          size="small"
          value={filters.faculty}
          onChange={(e) => handleFilterChange('faculty', e.target.value)}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">Все</MenuItem>
          <MenuItem value="IT">IT</MenuItem>
          <MenuItem value="Engineering">Инженерный</MenuItem>
          <MenuItem value="Economics">Экономический</MenuItem>
        </TextField>
      </Box>

      {/* Список пользователей */}
      <UsersList
        users={usersData?.users || []}
        onEditStudent={setEditStudent}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
      />

      <EditStudentDialog
        open={Boolean(editStudent)}
        user={editStudent}
        onClose={() => setEditStudent(null)}
        onSave={(id, data) => updateStudentMutation.mutate({ id, data })}
        isSaving={updateStudentMutation.isLoading}
      />
    </Box>
  );
};

export default UsersPage;
