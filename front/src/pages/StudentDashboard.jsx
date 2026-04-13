import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Avatar,
  Chip
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import { useAuthStore } from '../store/authStore';
import { useQuery } from 'react-query';
import { attendanceAPI } from '../api/attendance';
import { eventsAPI } from '../api/events';
import CheckInButton from '../components/attendance/CheckInButton';
import EventCard from '../components/events/EventCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const { data: attendanceData, isLoading: attendanceLoading } = useQuery(
    ['studentAttendance', user?.id],
    () => attendanceAPI.getAttendanceByStudent(user?.id)
  );

  const { data: upcomingEvents, isLoading: eventsLoading } = useQuery(
    'upcomingEvents',
    () => eventsAPI.getEvents({ status: 'published', limit: 3 })
  );

  if (attendanceLoading || eventsLoading) {
    return <LoadingSpinner />;
  }

  const totalAttended = attendanceData?.totalAttended || 0;

  const now = new Date();
  const activeEvents = upcomingEvents?.events?.filter(
    (event) => new Date(event.endDate) > now
  ) || [];

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        Добро пожаловать, {user?.fullName}!
      </Typography>

      <Grid container spacing={3}>
        {/* Профиль студента */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: 'primary.main',
                  fontSize: '2rem',
                  mx: 'auto',
                  mb: 2
                }}
              >
                {user?.fullName?.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {user?.fullName}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {user?.email}
              </Typography>
              <Chip label={user?.group} color="primary" size="small" sx={{ mb: 2 }} />

              <Box sx={{ mt: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {totalAttended}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Посещённых мероприятий
                </Typography>
              </Box>

              <Button
                variant="text"
                fullWidth
                startIcon={<HistoryIcon />}
                onClick={() => navigate('/student/history')}
                sx={{ mt: 1 }}
              >
                История посещений
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Действия */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Отметить посещение
              </Typography>
              <CheckInButton />
            </CardContent>
          </Card>

          {/* Ближайшие мероприятия */}
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Ближайшие мероприятия
          </Typography>
          <Grid container spacing={2}>
            {activeEvents.length > 0 ? (
              activeEvents.map((event) => (
                <Grid item xs={12} key={event.id}>
                  <EventCard event={event} />
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Нет предстоящих мероприятий
                </Typography>
              </Grid>
            )}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentDashboard;
