import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid
} from '@mui/material';
import { useSnackbar } from 'notistack';

const emptyForm = {
  fullName: '',
  email: '',
  faculty: '',
  group: ''
};

const EditStudentDialog = ({ open, user, onClose, onSave, isSaving }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (user && open) {
      setForm({
        fullName: user.fullName || '',
        email: user.email || '',
        faculty: user.faculty || '',
        group: user.group || ''
      });
    }
  }, [user, open]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = () => {
    if (!user) return;
    const fullName = form.fullName.trim();
    const email = form.email.trim();
    if (!fullName || !email) {
      enqueueSnackbar('Укажите ФИО и email', { variant: 'warning' });
      return;
    }
    onSave(user.id, {
      fullName,
      email,
      faculty: form.faculty.trim() || null,
      group: form.group.trim() || null
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Личные данные студента</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="ФИО"
              value={form.fullName}
              onChange={handleChange('fullName')}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={form.email}
              onChange={handleChange('email')}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Факультет"
              value={form.faculty}
              onChange={handleChange('faculty')}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Группа"
              value={form.group}
              onChange={handleChange('group')}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={isSaving}>
          Отмена
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={isSaving}>
          Сохранить
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditStudentDialog;
