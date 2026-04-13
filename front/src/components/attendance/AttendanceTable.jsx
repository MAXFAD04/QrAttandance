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
  Typography,
  Box,
  Avatar
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const AttendanceTable = ({ attendances, onDelete }) => {
  const getStatusColor = (status) => {
    const colors = {
      present: 'success',
      late: 'warning',
      absent: 'error'
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const labels = {
      present: 'Присутствовал',
      late: 'Опоздал',
      absent: 'Отсутствовал'
    };
    return labels[status] || status;
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Студент</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Группа</TableCell>
            <TableCell>Время отметки</TableCell>
            <TableCell>Статус</TableCell>
            {onDelete && <TableCell align="right">Действия</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {attendances.length === 0 ? (
            <TableRow>
              <TableCell colSpan={onDelete ? 6 : 5} align="center">
                <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                  Посещений пока нет
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            attendances.map((attendance) => (
              <TableRow key={attendance.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                      {attendance.user?.fullName?.charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography variant="body2">
                      {attendance.user?.fullName}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>{attendance.user?.email}</TableCell>
                <TableCell>{attendance.user?.group || '—'}</TableCell>
                <TableCell>
                  {format(new Date(attendance.checkinTime), 'dd.MM.yyyy HH:mm', {
                    locale: ru
                  })}
                </TableCell>
                <TableCell>
                  <Chip
                    label={getStatusLabel(attendance.status)}
                    color={getStatusColor(attendance.status)}
                    size="small"
                  />
                </TableCell>
                {onDelete && (
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => onDelete(attendance.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default AttendanceTable;
