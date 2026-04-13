import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PlaceIcon from '@mui/icons-material/Place';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

const EventCard = ({ event, onEdit, onDelete, onPublish }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenuOpen = (e) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleCardClick = () => {
    navigate(`/events/${event.id}`);
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'default',
      published: 'primary',
      ongoing: 'success',
      completed: 'secondary',
      cancelled: 'error'
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const labels = {
      draft: 'Черновик',
      published: 'Опубликовано',
      ongoing: 'Идёт сейчас',
      completed: 'Завершено',
      cancelled: 'Отменено'
    };
    return labels[status] || status;
  };

  const getTypeLabel = (type) => {
    const labels = {
      lecture: 'Лекция',
      seminar: 'Семинар',
      practice: 'Практика',
      conference: 'Конференция',
      other: 'Другое'
    };
    return labels[type] || type;
  };

  return (
    <Card
      sx={{
        cursor: 'pointer',
        transition: 'all 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 3
        }
      }}
      onClick={handleCardClick}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip
              label={getStatusLabel(event.status)}
              color={getStatusColor(event.status)}
              size="small"
            />
            <Chip
              label={getTypeLabel(event.type)}
              variant="outlined"
              size="small"
            />
          </Box>
          {onEdit && (
            <IconButton
              size="small"
              onClick={handleMenuOpen}
              sx={{ mt: -1, mr: -1 }}
            >
              <MoreVertIcon />
            </IconButton>
          )}
        </Box>

        <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
          {event.title}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {event.description}
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EventIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {format(new Date(event.startDate), 'dd MMMM yyyy, HH:mm', {
                locale: ru
              })}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PlaceIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {event.room}
            </Typography>
          </Box>

          {event.attendanceStats && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PeopleIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {event.attendanceStats.registered}
                {event.maxAttendees && ` / ${event.maxAttendees}`} участников
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {event.status === 'draft' && onPublish && (
          <MenuItem
            onClick={(e) => {
              e.stopPropagation();
              onPublish(event.id);
              handleMenuClose();
            }}
          >
            Опубликовать
          </MenuItem>
        )}
        {onEdit && (
          <MenuItem
            onClick={(e) => {
              e.stopPropagation();
              onEdit(event);
              handleMenuClose();
            }}
          >
            Редактировать
          </MenuItem>
        )}
        {onDelete && (
          <MenuItem
            onClick={(e) => {
              e.stopPropagation();
              onDelete(event.id);
              handleMenuClose();
            }}
            sx={{ color: 'error.main' }}
          >
            Удалить
          </MenuItem>
        )}
      </Menu>
    </Card>
  );
};

export default EventCard;
