import React, { useState } from 'react';
import { Button, CircularProgress } from '@mui/material';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import QRScanner from './QRScanner';
import { useAttendance } from '../../hooks/useAttendance';
import { useAuthStore } from '../../store/authStore';

const CheckInButton = () => {
  const [scannerOpen, setScannerOpen] = useState(false);
  const { checkIn, checkInLoading } = useAttendance();
  const { user } = useAuthStore();

  const handleScan = (qrData) => {
    if (qrData.type === 'event') {
      checkIn({
        eventId: qrData.eventId,
        userId: user.id,
        qrData: JSON.stringify(qrData),
        qrToken: qrData.token || null,
      });
      setScannerOpen(false);
    } else {
      alert('Это не QR-код мероприятия');
    }
  };

  return (
    <>
      <Button
        variant="contained"
        size="large"
        startIcon={checkInLoading ? <CircularProgress size={20} /> : <QrCodeScannerIcon />}
        onClick={() => setScannerOpen(true)}
        disabled={checkInLoading}
        fullWidth
      >
        Сканировать QR-код
      </Button>

      <QRScanner
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={handleScan}
      />
    </>
  );
};

export default CheckInButton;
