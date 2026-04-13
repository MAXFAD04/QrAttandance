import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
  LinearProgress
} from '@mui/material';
import QRCode from 'react-qr-code';
import DownloadIcon from '@mui/icons-material/Download';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import { eventsAPI } from '../../api/events';

const ROTATION_INTERVAL_MS = 10_000;
const POLL_EARLY_MS = 1_000;

const EventQRCode = ({ open, onClose, event }) => {
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [timeLeft, setTimeLeft] = useState(ROTATION_INTERVAL_MS);
  const timerRef = useRef(null);
  const pollRef = useRef(null);
  const mountedRef = useRef(false);

  const fetchQR = useCallback(async () => {
    if (!event?.id) return;
    try {
      setLoading(prev => !prev && prev === prev ? false : false);
      const data = await eventsAPI.getRotatingQRCode(event.id);
      if (!mountedRef.current) return;
      setQrCode(data.qrCode);
      setLoadError(false);
      setTimeLeft(data.expiresIn > 0 ? data.expiresIn : data.lifetimeMs || ROTATION_INTERVAL_MS);
    } catch {
      if (!mountedRef.current) return;
      setLoadError(true);
    }
  }, [event?.id]);

  useEffect(() => {
    if (!open) {
      mountedRef.current = false;
      setQrCode(null);
      setTimeLeft(ROTATION_INTERVAL_MS);
      return;
    }

    mountedRef.current = true;
    setLoading(true);

    eventsAPI.getRotatingQRCode(event.id)
      .then((data) => {
        if (!mountedRef.current) return;
        setQrCode(data.qrCode);
        setLoadError(false);
        setTimeLeft(data.expiresIn > 0 ? data.expiresIn : data.lifetimeMs || ROTATION_INTERVAL_MS);
      })
      .catch(() => {
        if (!mountedRef.current) return;
        setLoadError(true);
      })
      .finally(() => {
        if (mountedRef.current) setLoading(false);
      });

    return () => { mountedRef.current = false; };
  }, [open, event?.id]);

  useEffect(() => {
    if (!open || loading) return;

    const tick = 100;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        const next = prev - tick;
        if (next <= 0) return 0;
        return next;
      });
    }, tick);

    return () => clearInterval(timerRef.current);
  }, [open, loading]);

  useEffect(() => {
    if (timeLeft > POLL_EARLY_MS || !open) return;

    if (pollRef.current) return;
    pollRef.current = true;

    fetchQR().finally(() => { pollRef.current = false; });
  }, [timeLeft, open, fetchQR]);

  const progress = Math.max(0, (timeLeft / ROTATION_INTERVAL_MS) * 100);
  const secondsLeft = Math.ceil(timeLeft / 1000);

  const handleDownload = () => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `qr-${event?.title || 'event'}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>QR-код мероприятия</DialogTitle>
      <DialogContent>
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {event?.title}
          </Typography>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: 280,
              p: 3,
              bgcolor: 'white',
              borderRadius: 2,
              position: 'relative',
            }}
          >
            {loading && !qrCode && <CircularProgress />}
            {!loading && loadError && (
              <Typography color="error">
                Не удалось загрузить QR. Проверьте сеть и попробуйте снова.
              </Typography>
            )}
            {qrCode && (
              <QRCode
                id="qr-code-svg"
                value={qrCode}
                size={256}
                level="M"
              />
            )}
            {!loading && !loadError && !qrCode && (
              <Typography color="text.secondary">Нет данных для QR-кода</Typography>
            )}
          </Box>

          <Box sx={{ mt: 2, px: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
              <AutorenewIcon
                fontSize="small"
                color="primary"
                sx={{
                  animation: timeLeft < 2000 ? 'spin 1s linear infinite' : 'none',
                  '@keyframes spin': { '100%': { transform: 'rotate(360deg)' } },
                }}
              />
              <Typography variant="body2" color="text.secondary">
                Обновление через {secondsLeft} сек
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 3,
                  transition: 'transform 0.1s linear',
                  bgcolor: timeLeft < 3000 ? 'warning.main' : 'primary.main',
                },
              }}
            />
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            QR-код автоматически обновляется каждые 10 секунд.
            Студенты должны сканировать актуальный код.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Закрыть</Button>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleDownload}
          disabled={loading || loadError || !qrCode}
        >
          Скачать
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EventQRCode;
