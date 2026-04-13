import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  MenuItem
} from '@mui/material';
import { useQuery } from 'react-query';
import { analyticsAPI } from '../api/analytics';
import DashboardStats from '../components/analytics/DashboardStats';
import AttendanceChart from '../components/analytics/AttendanceChart';
import StudentAnalytics from '../components/analytics/StudentAnalytics';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ru } from 'date-fns/locale';

const AnalyticsPage = () => {
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    faculty: '',
    type: ''
  });

  const { data: stats, isLoading: statsLoading } = useQuery(
    ['analyticsStats', filters],
    () => analyticsAPI.getDashboardStats(filters)
  );

  const { data: trends, isLoading: trendsLoading } = useQuery(
    ['analyticsTrends', filters],
    () => analyticsAPI.getEventTrends(filters)
  );

  const { data: students, isLoading: studentsLoading } = useQuery(
    ['analyticsStudents', filters],
    () => analyticsAPI.getStudentAnalytics(filters)
  );

  if (statsLoading || trendsLoading || studentsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        Аналитика
      </Typography>

      {/* Фильтры */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Фильтры
          </Typography>
          <Grid container spacing={2}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
              <Grid item xs={12} sm={6} md={3}>
                <DatePicker
                  label="Дата начала"
                  value={filters.startDate}
                  onChange={(date) =>
                    setFilters({ ...filters, startDate: date })
                  }
                  slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <DatePicker
                  label="Дата окончания"
                  value={filters.endDate}
                  onChange={(date) =>
                    setFilters({ ...filters, endDate: date })
                  }
                  slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                />
              </Grid>
            </LocalizationProvider>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                size="small"
                label="Факультет"
                value={filters.faculty}
                onChange={(e) =>
                  setFilters({ ...filters, faculty: e.target.value })
                }
              >
                <MenuItem value="">Все</MenuItem>
                <MenuItem value="IT">IT</MenuItem>
                <MenuItem value="Engineering">Инженерный</MenuItem>
                <MenuItem value="Economics">Экономический</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                size="small"
                label="Тип мероприятия"
                value={filters.type}
                onChange={(e) =>
                  setFilters({ ...filters, type: e.target.value })
                }
              >
                <MenuItem value="">Все</MenuItem>
                <MenuItem value="lecture">Лекция</MenuItem>
                <MenuItem value="seminar">Семинар</MenuItem>
                <MenuItem value="practice">Практика</MenuItem>
                <MenuItem value="conference">Конференция</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Статистика */}
      <DashboardStats stats={stats?.stats} />

      {/* График посещаемости */}
      <Box sx={{ mt: 4 }}>
        <AttendanceChart data={trends?.trends} />
      </Box>

      {/* Аналитика студентов */}
      <Box sx={{ mt: 4 }}>
        <StudentAnalytics students={students?.students || []} />
      </Box>
    </Box>
  );
};

export default AnalyticsPage;
