import React, { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EventsList from '../components/events/EventsList';
import EventForm from '../components/events/EventForm';
import { useEvents } from '../hooks/useEvents';
import { useSnackbar } from 'notistack';
import { eventsAPI } from '../api/events';

const EventsPage = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const { createEvent, updateEvent, refetch } = useEvents();
  const { enqueueSnackbar } = useSnackbar();

  const handleCreate = () => {
    setEditingEvent(null);
    setFormOpen(true);
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormOpen(true);
  };

  const handleSubmit = async (data) => {
    try {
      if (editingEvent) {
        await updateEvent({ id: editingEvent.id, data });
      } else {
        await createEvent(data);
      }
      setFormOpen(false);
      setEditingEvent(null);
      refetch();
    } catch (error) {
      console.error('Form submit error:', error);
    }
  };

  const handlePublish = async (id) => {
    try {
      await eventsAPI.publishEvent(id);
      enqueueSnackbar('Мероприятие опубликовано', { variant: 'success' });
      refetch();
    } catch (error) {
      enqueueSnackbar('Ошибка публикации', { variant: 'error' });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Мероприятия
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
        >
          Создать мероприятие
        </Button>
      </Box>

      <EventsList onEdit={handleEdit} onPublish={handlePublish} />

      <EventForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingEvent(null);
        }}
        onSubmit={handleSubmit}
        initialData={editingEvent}
      />
    </Box>
  );
};

export default EventsPage;
