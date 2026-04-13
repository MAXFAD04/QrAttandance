import React, { useState, useEffect, useRef, useId } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Alert
} from '@mui/material';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import { Html5QrcodeScanner } from 'html5-qrcode';

const QRScanner = ({ open, onClose, onScan }) => {
  const [error, setError] = useState('');
  const onScanRef = useRef(onScan);
  const scannerRef = useRef(null);
  const readerId = `qr-reader-${useId().replace(/:/g, '')}`;

  onScanRef.current = onScan;

  const cameraBlocked =
    typeof window !== 'undefined' &&
    !window.isSecureContext &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1';

  useEffect(() => {
    if (!open) return undefined;

    setError('');
    scannerRef.current = null;

    let cancelled = false;
    let attempts = 0;

    const start = () => {
      if (cancelled || attempts++ > 90) return;
      const el = document.getElementById(readerId);
      if (!el) {
        requestAnimationFrame(start);
        return;
      }

      const html5QrcodeScanner = new Html5QrcodeScanner(
        readerId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        false
      );

      scannerRef.current = html5QrcodeScanner;

      html5QrcodeScanner.render(
        (decodedText) => {
          try {
            const qrData = JSON.parse(decodedText);
            onScanRef.current(qrData);
            html5QrcodeScanner.clear().catch(() => {});
            scannerRef.current = null;
          } catch {
            setError('Неверный формат QR-кода');
          }
        },
        () => {}
      );
    };

    requestAnimationFrame(start);

    return () => {
      cancelled = true;
      scannerRef.current?.clear().catch(() => {});
      scannerRef.current = null;
    };
  }, [open, readerId]);

  const handleClose = () => {
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <QrCodeScannerIcon color="primary" />
          Сканировать QR-код
        </Box>
      </DialogTitle>
      <DialogContent>
        {cameraBlocked && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Браузер может не открыть камеру по адресу{' '}
            <code>http://&lt;IP в локальной сети&gt;</code> — нужен HTTPS или открытие сайта с{' '}
            <code>localhost</code> на этом устройстве. Для проверки с телефона используйте туннель
            (ngrok, localtunnel) с HTTPS.
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        <Box id={readerId} sx={{ width: '100%' }} />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
          Наведите камеру на QR-код мероприятия
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Отмена</Button>
      </DialogActions>
    </Dialog>
  );
};

export default QRScanner;
