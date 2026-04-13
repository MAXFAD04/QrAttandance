import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (user, tokens) => {
        set({
          user,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          isAuthenticated: true
        });
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);
      },

      updateUser: (user) => {
        set({ user });
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false
        });
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      },

      isAdmin: () => get().user?.role === 'admin',
      isOrganizer: () => ['admin', 'organizer'].includes(get().user?.role),
      isStudent: () => get().user?.role === 'student'
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        // Храним токены в Zustand-хранилище, чтобы после перезагрузки страницы
        // axios-интерцептор мог подставить Authorization и не получать 401.
        accessToken: state.accessToken,
        refreshToken: state.refreshToken
      })
    }
  )
);
