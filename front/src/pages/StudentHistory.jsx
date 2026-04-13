import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider
} from '@mui/material';
import { useAuthStore } from '../store/authStore';
import { useStudentAttendance } from '../hooks/useAttendance';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import EventIcon from '@mui/icons-material/Event';

const StudentHistory = () => {
  const { user } = useAuthStore();
  const { data, isLoading } = useStudentAttendance(user?.id);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const attendances = data?.attendances || [];

  if (attendances.length === 0) {
    return (
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
          История посещений
        </Typography>
        <EmptyState
          icon={EventIcon}
          title="История пуста"
          message="Вы ещё не посещали мероприятия"
        />
      </Box>
    );
  }

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
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        История посещений
      </Typography>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Всего посещено: {attendances.length}
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <List>
            {attendances.map((attendance, index) => (
              <React.Fragment key={attendance.id}>
                <ListItem
                  sx={{
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    gap: 2
                  }}
                >
                  <ListItemText
                    primary={attendance.event?.title}
                    secondary={
                      <>
                        <Typography variant="body2" color="text.secondary">
                          {format(
                            new Date(attendance.event?.startDate),
                            'dd MMMM yyyy, HH:mm',
                            { locale: ru }
                          )}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {attendance.event?.room}
                        </Typography>
                      </>
                    }
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip
                      label={getStatusLabel(attendance.status)}
                      color={getStatusColor(attendance.status)}
                      size="small"
                    />
                    <Chip
                      label={format(
                        new Date(attendance.checkinTime),
                        'HH:mm',
                        { locale: ru }
                      )}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                </ListItem>
                {index < attendances.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
};

export default StudentHistory;
