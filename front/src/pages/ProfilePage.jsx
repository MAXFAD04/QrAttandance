import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Avatar,
  Divider,
  Alert
} from '@mui/material';
import { useAuthStore } from '../store/authStore';
import { useMutation } from 'react-query';
import { usersAPI } from '../api/users';
import { useSnackbar } from 'notistack';
import SaveIcon from '@mui/icons-material/Save';
import LockIcon from '@mui/icons-material/Lock';

const ProfilePage = () => {
  const { user, updateUser } = useAuthStore();
  const { enqueueSnackbar } = useSnackbar();
  const isStudent = user?.role === 'student';

  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    faculty: user?.faculty || '',
    group: user?.group || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const updateProfileMutation = useMutation(
    (data) => usersAPI.updateUser(user.id, data),
    {
      onSuccess: (data) => {
        updateUser(data.user);
        enqueueSnackbar('Профиль обновлён', { variant: 'success' });
      },
      onError: () => {
        enqueueSnackbar('Ошибка обновления', { variant: 'error' });
      }
    }
  );

  const changePasswordMutation = useMutation(
    (data) => usersAPI.changePassword(user.id, data),
    {
      onSuccess: () => {
        enqueueSnackbar('Пароль изменён', { variant: 'success' });
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      },
      onError: (error) => {
        enqueueSnackbar(
          error.response?.data?.error || 'Ошибка смены пароля',
          { variant: 'error' }
        );
      }
    }
  );

  const handleProfileUpdate = () => {
    updateProfileMutation.mutate(profileData);
  };

  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      enqueueSnackbar('Пароли не совпадают', { variant: 'error' });
      return;
    }
    if (passwordData.newPassword.length < 6) {
      enqueueSnackbar('Пароль должен быть не менее 6 символов', { variant: 'error' });
      return;
    }
    changePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    });
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        Профиль
      </Typography>

      <Grid container spacing={3}>
        {/* Информация профиля */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Личная информация
              </Typography>

              {isStudent && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  ФИО, email, факультет и группа задаются администратором. При
                  необходимости изменений обратитесь в учебный отдел.
                </Alert>
              )}

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="ФИО"
                    value={profileData.fullName}
                    onChange={(e) =>
                      setProfileData({ ...profileData, fullName: e.target.value })
                    }
                    InputProps={{ readOnly: isStudent }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={profileData.email}
                    onChange={(e) =>
                      setProfileData({ ...profileData, email: e.target.value })
                    }
                    InputProps={{ readOnly: isStudent }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Факультет"
                    value={profileData.faculty}
                    onChange={(e) =>
                      setProfileData({ ...profileData, faculty: e.target.value })
                    }
                    InputProps={{ readOnly: isStudent }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Группа"
                    value={profileData.group}
                    onChange={(e) =>
                      setProfileData({ ...profileData, group: e.target.value })
                    }
                    InputProps={{ readOnly: isStudent }}
                  />
                </Grid>
              </Grid>

              {!isStudent && (
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleProfileUpdate}
                  disabled={updateProfileMutation.isLoading}
                  sx={{ mt: 3 }}
                >
                  Сохранить изменения
                </Button>
              )}
            </CardContent>
          </Card>

          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Изменить пароль
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="password"
                    label="Текущий пароль"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value
                      })
                    }
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="password"
                    label="Новый пароль"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value
                      })
                    }
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="password"
                    label="Подтвердите пароль"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value
                      })
                    }
                  />
                </Grid>
              </Grid>

              <Button
                variant="contained"
                color="secondary"
                startIcon={<LockIcon />}
                onClick={handlePasswordChange}
                disabled={changePasswordMutation.isLoading}
                sx={{ mt: 3 }}
              >
                Изменить пароль
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Аватар и роль */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  bgcolor: 'primary.main',
                  fontSize: '3rem',
                  mx: 'auto',
                  mb: 2
                }}
              >
                {user?.fullName?.charAt(0).toUpperCase()}
              </Avatar>

              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {user?.fullName}
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {user?.email}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="body2" color="text.secondary">
                  Роль
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {user?.role === 'admin' && 'Администратор'}
                  {user?.role === 'organizer' && 'Организатор'}
                  {user?.role === 'student' && 'Студент'}
                </Typography>

                {user?.faculty && (
                  <>
                    <Typography variant="body2" color="text.secondary">
                      Факультет
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {user.faculty}
                    </Typography>
                  </>
                )}

                {user?.group && (
                  <>
                    <Typography variant="body2" color="text.secondary">
                      Группа
                    </Typography>
                    <Typography variant="body1">{user.group}</Typography>
                  </>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProfilePage;
