import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControlLabel,
  Switch
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ru } from 'date-fns/locale';

const EventForm = ({ open, onClose, onSubmit, initialData }) => {
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: initialData || {
      title: '',
      description: '',
      type: 'lecture',
      startDate: new Date(),
      endDate: new Date(),
      room: '',
      faculty: '',
      group: '',
      maxAttendees: '',
      allowLateCheckin: false,
      requireAuth: true
    }
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {initialData ? 'Редактировать мероприятие' : 'Создать мероприятие'}
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Controller
                name="title"
                control={control}
                rules={{ required: 'Обязательное поле' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Название"
                    error={!!errors.title}
                    helperText={errors.title?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Описание"
                    multiline
                    rows={3}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <TextField {...field} fullWidth select label="Тип">
                    <MenuItem value="lecture">Лекция</MenuItem>
                    <MenuItem value="seminar">Семинар</MenuItem>
                    <MenuItem value="practice">Практика</MenuItem>
                    <MenuItem value="conference">Конференция</MenuItem>
                    <MenuItem value="other">Другое</MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="room"
                control={control}
                rules={{ required: 'Обязательное поле' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Аудитория"
                    error={!!errors.room}
                    helperText={errors.room?.message}
                  />
                )}
              />
            </Grid>

            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="startDate"
                  control={control}
                  render={({ field }) => (
                    <DateTimePicker
                      {...field}
                      label="Дата начала"
                      slotProps={{
                        textField: { fullWidth: true }
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="endDate"
                  control={control}
                  render={({ field }) => (
                    <DateTimePicker
                      {...field}
                      label="Дата окончания"
                      slotProps={{
                        textField: { fullWidth: true }
                      }}
                    />
                  )}
                />
              </Grid>
            </LocalizationProvider>

            <Grid item xs={12} sm={6}>
              <Controller
                name="faculty"
                control={control}
                render={({ field }) => (
                  <TextField {...field} fullWidth label="Факультет" />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="group"
                control={control}
                render={({ field }) => (
                  <TextField {...field} fullWidth label="Группа" />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="maxAttendees"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Макс. участников"
                    type="number"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="allowLateCheckin"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch {...field} checked={field.value} />}
                    label="Разрешить опоздавших"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="requireAuth"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch {...field} checked={field.value} />}
                    label="Требовать авторизацию"
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Отмена</Button>
          <Button type="submit" variant="contained">
            {initialData ? 'Сохранить' : 'Создать'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EventForm;
