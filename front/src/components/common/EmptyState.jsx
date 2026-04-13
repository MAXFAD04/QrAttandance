import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';

const EmptyState = ({ 
  icon: Icon = InboxIcon,
  title = 'Данных нет',
  message = 'Здесь пока ничего нет',
  action,
  actionLabel
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        gap: 2,
        p: 4,
        textAlign: 'center'
      }}
    >
      <Icon sx={{ fontSize: 64, color: 'text.disabled' }} />
      <Typography variant="h5" color="text.secondary">
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
      {action && (
        <Button
          variant="contained"
          onClick={action}
          sx={{ mt: 2 }}
        >
          {actionLabel}
        </Button>
      )}
    </Box>
  );
};

export default EmptyState;
