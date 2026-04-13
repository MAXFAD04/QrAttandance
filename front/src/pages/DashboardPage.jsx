import React from 'react';
import { Box, Typography, Grid, Button } from '@mui/material';
import { useQuery } from 'react-query';
import { analyticsAPI } from '../api/analytics';
import { eventsAPI } from '../api/events';
import DashboardStats from '../components/analytics/DashboardStats';
import AttendanceChart from '../components/analytics/AttendanceChart';
import EventCard from '../components/events/EventCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
  const navigate = useNavigate();

  const { data: stats, isLoading: statsLoading } = useQuery(
    'dashboardStats',
    analyticsAPI.getDashboardStats
  );

  const { data: trends, isLoading: trendsLoading } = useQuery(
    'eventTrends',
    analyticsAPI.getEventTrends
  );

  const { data: recentEvents, isLoading: eventsLoading } = useQuery(
    'recentEvents',
    () => eventsAPI.getEvents({ limit: 3, status: 'published' })
  );

  if (statsLoading || trendsLoading || eventsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Панель управления
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/events/create')}
        >
          Создать мероприятие
        </Button>
      </Box>

      {/* Статистика */}
      <DashboardStats stats={stats?.stats} />

      {/* График посещаемости */}
      <Box sx={{ mt: 4 }}>
        <AttendanceChart data={trends?.trends} />
      </Box>

      {/* Последние мероприятия */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Последние мероприятия
        </Typography>
        <Grid container spacing={3}>
          {recentEvents?.events?.map((event) => (
            <Grid item xs={12} sm={6} md={4} key={event.id}>
              <EventCard event={event} />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default DashboardPage;
