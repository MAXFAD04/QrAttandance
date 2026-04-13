import React, { useState } from 'react';
import {
  Box,
  Grid,
  TextField,
  MenuItem,
  InputAdornment,
  Pagination
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EventCard from './EventCard';
import EmptyState from '../common/EmptyState';
import LoadingSpinner from '../common/LoadingSpinner';
import { useEvents } from '../../hooks/useEvents';

const EventsList = ({ onEdit, onDelete, onPublish }) => {
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    page: 1,
    limit: 9
  });

  const { events, pagination, isLoading, refetch, deleteEvent } = useEvents(filters);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
      page: 1 // Сброс на первую страницу
    }));
  };

  const handlePageChange = (event, value) => {
    setFilters((prev) => ({ ...prev, page: value }));
  };

  const handleDelete = async (id) => {
    if (window.confirm('Удалить мероприятие?')) {
      await deleteEvent(id);
      refetch();
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Box>
      {/* Фильтры */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Поиск..."
          size="small"
          sx={{ minWidth: 250 }}
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
          label="Тип"
          size="small"
          value={filters.type}
          onChange={(e) => handleFilterChange('type', e.target.value)}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">Все</MenuItem>
          <MenuItem value="lecture">Лекция</MenuItem>
          <MenuItem value="seminar">Семинар</MenuItem>
          <MenuItem value="practice">Практика</MenuItem>
          <MenuItem value="conference">Конференция</MenuItem>
          <MenuItem value="other">Другое</MenuItem>
        </TextField>

        <TextField
          select
          label="Статус"
          size="small"
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">Все</MenuItem>
          <MenuItem value="draft">Черновик</MenuItem>
          <MenuItem value="published">Опубликовано</MenuItem>
          <MenuItem value="ongoing">Идёт сейчас</MenuItem>
          <MenuItem value="completed">Завершено</MenuItem>
        </TextField>
      </Box>

      {/* Список мероприятий */}
      {events.length === 0 ? (
        <EmptyState
          title="Мероприятий нет"
          message="Создайте первое мероприятие"
        />
      ) : (
        <>
          <Grid container spacing={3}>
            {events.map((event) => (
              <Grid item xs={12} sm={6} md={4} key={event.id}>
                <EventCard
                  event={event}
                  onEdit={onEdit}
                  onDelete={handleDelete}
                  onPublish={onPublish}
                />
              </Grid>
            ))}
          </Grid>

          {/* Пагинация */}
          {pagination && pagination.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={pagination.totalPages}
                page={pagination.page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default EventsList;
