import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import CheckInButton from '../components/attendance/CheckInButton';

const StudentScanPage = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        Отметить посещение
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Наведите камеру на QR-код мероприятия, который показал организатор.
          </Typography>
          <CheckInButton />
        </CardContent>
      </Card>
    </Box>
  );
};

export default StudentScanPage;
