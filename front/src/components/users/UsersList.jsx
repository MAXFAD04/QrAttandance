import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Avatar,
  Box,
  Typography
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const UsersList = ({ users, onEditStudent, onDelete, onToggleStatus }) => {
  const getRoleColor = (role) => {
    const colors = {
      admin: 'error',
      organizer: 'warning',
      student: 'primary'
    };
    return colors[role] || 'default';
  };

  const getRoleLabel = (role) => {
    const labels = {
      admin: 'Администратор',
      organizer: 'Организатор',
      student: 'Студент'
    };
    return labels[role] || role;
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Пользователь</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Роль</TableCell>
            <TableCell>Факультет</TableCell>
            <TableCell>Группа</TableCell>
            <TableCell align="center">Статус</TableCell>
            <TableCell align="right">Действия</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} align="center">
                <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                  Пользователей нет
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {user.fullName?.charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography variant="body2">{user.fullName}</Typography>
                  </Box>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip
                    label={getRoleLabel(user.role)}
                    color={getRoleColor(user.role)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{user.faculty || '—'}</TableCell>
                <TableCell>{user.group || '—'}</TableCell>
                <TableCell align="center">
                  <Chip
                    icon={user.isActive ? <CheckCircleIcon /> : <BlockIcon />}
                    label={user.isActive ? 'Активен' : 'Заблокирован'}
                    color={user.isActive ? 'success' : 'error'}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => onToggleStatus(user.id)}
                    color={user.isActive ? 'warning' : 'success'}
                    title={user.isActive ? 'Заблокировать' : 'Разблокировать'}
                  >
                    {user.isActive ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                  </IconButton>
                  {user.role === 'student' && (
                    <IconButton
                      size="small"
                      onClick={() => onEditStudent(user)}
                      color="primary"
                      title="Редактировать личные данные"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  )}
                  <IconButton
                    size="small"
                    onClick={() => onDelete(user.id)}
                    color="error"
                    title="Удалить"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default UsersList;
