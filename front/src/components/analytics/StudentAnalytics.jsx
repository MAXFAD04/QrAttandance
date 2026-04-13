import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  Box
} from '@mui/material';

const StudentAnalytics = ({ students = [] }) => {
  const getAttendanceColor = (rate) => {
    if (rate >= 80) return 'success';
    if (rate >= 60) return 'warning';
    return 'error';
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          Статистика студентов
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Студент</TableCell>
                <TableCell>Группа</TableCell>
                <TableCell align="center">Посещено</TableCell>
                <TableCell align="center">Процент</TableCell>
                <TableCell>Посещаемость</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                      Данных нет
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                students.map((student) => (
                  <TableRow key={student.id} hover>
                    <TableCell>{student.fullName}</TableCell>
                    <TableCell>{student.group}</TableCell>
                    <TableCell align="center">
                      {student.attendedEvents} / {student.totalEvents}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={`${student.attendanceRate}%`}
                        color={getAttendanceColor(student.attendanceRate)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={student.attendanceRate}
                          color={getAttendanceColor(student.attendanceRate)}
                          sx={{ flexGrow: 1, height: 8, borderRadius: 1 }}
                        />
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default StudentAnalytics;
