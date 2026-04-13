import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Divider
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from 'react-query';
import { eventsAPI } from '../api/events';
import { attendanceAPI } from '../api/attendance';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AttendanceTable from '../components/attendance/AttendanceTable';
import EventQRCode from '../components/events/EventQRCode';
import EventForm from '../components/events/EventForm';
import QrCodeIcon from '@mui/icons-material/QrCode';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlaceIcon from '@mui/icons-material/Place';
import EventIcon from '@mui/icons-material/Event';
import PeopleIcon from '@mui/icons-material/People';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useSnackbar } from 'notistack';
import { EVENT_TYPES, EVENT_STATUSES } from '../utils/constants';

const EventDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [editFormOpen, setEditFormOpen] = useState(false);

  const { data: eventData, isLoading: eventLoading } = useQuery(
    ['event', id],
    () => eventsAPI.getEventById(id)
  );

  const { data: attendanceData, isLoading: attendanceLoading } = useQuery(
    ['attendance', 'event', id],
    () => attendanceAPI.getAttendanceByEvent(id)
  );

  if (eventLoading || attendanceLoading) {
    return <LoadingSpinner />;
  }

  const event = eventData?.event;

  const handleEditSubmit = async (data) => {
    try {
      await eventsAPI.updateEvent(id, data);
      enqueueSnackbar('Мероприятие обновлено', { variant: 'success' });
      setEditFormOpen(false);
      queryClient.invalidateQueries(['event', id]);
      queryClient.invalidateQueries('events');
    } catch (error) {
      enqueueSnackbar(
        error.response?.data?.error || 'Ошибка обновления',
        { variant: 'error' }
      );
    }
  };

  const editInitialData = event
    ? {
        title: event.title,
        description: event.description || '',
        type: event.type,
        startDate: new Date(event.startDate),
        endDate: new Date(event.endDate),
        room: event.room || '',
        faculty: event.faculty || '',
        group: event.group || '',
        maxAttendees: event.maxAttendees || '',
        allowLateCheckin: event.allowLateCheckin || false,
        requireAuth: event.requireAuth !== undefined ? event.requireAuth : true,
      }
    : null;

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/events')}
        sx={{ mb: 2 }}
      >
        Назад к мероприятиям
      </Button>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {event?.title}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<QrCodeIcon />}
            onClick={() => setQrDialogOpen(true)}
          >
            QR-код
          </Button>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => setEditFormOpen(true)}
          >
            Редактировать
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Информация о мероприятии */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Chip label={EVENT_TYPES[event?.type] || event?.type} color="primary" />
                <Chip label={EVENT_STATUSES[event?.status] || event?.status} color="secondary" />
              </Box>

              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {event?.description}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <EventIcon color="action" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Начало
                      </Typography>
                      <Typography variant="body1">
                        {format(new Date(event?.startDate), 'dd MMMM yyyy, HH:mm', {
                          locale: ru
                        })}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <EventIcon color="action" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Окончание
                      </Typography>
                      <Typography variant="body1">
                        {format(new Date(event?.endDate), 'dd MMMM yyyy, HH:mm', {
                          locale: ru
                        })}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PlaceIcon color="action" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Место
                      </Typography>
                      <Typography variant="body1">{event?.room}</Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PeopleIcon color="action" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Участники
                      </Typography>
                      <Typography variant="body1">
                        {attendanceData?.totalAttendees || 0}
                        {event?.maxAttendees && ` / ${event.maxAttendees}`}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Организатор */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Организатор
              </Typography>
              <Typography variant="body1">{event?.organizer?.fullName}</Typography>
              <Typography variant="body2" color="text.secondary">
                {event?.organizer?.email}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Список посещаемости */}
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Список посещаемости ({attendanceData?.totalAttendees || 0})
          </Typography>
          <AttendanceTable attendances={attendanceData?.attendances || []} />
        </Grid>
      </Grid>

      <EventQRCode
        open={qrDialogOpen}
        onClose={() => setQrDialogOpen(false)}
        event={event}
      />

      {editInitialData && (
        <EventForm
          open={editFormOpen}
          onClose={() => setEditFormOpen(false)}
          onSubmit={handleEditSubmit}
          initialData={editInitialData}
        />
      )}
    </Box>
  );
};

export default EventDetailsPage;
