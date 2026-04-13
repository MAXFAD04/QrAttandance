import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1565C0', // Основной синий
      light: '#42A5F5',
      dark: '#0D47A1',
      contrastText: '#FFFFFF'
    },
    secondary: {
      main: '#26C6DA', // Бирюзовый акцент
      light: '#4DD0E1',
      dark: '#00ACC1',
      contrastText: '#000000'
    },
    success: {
      main: '#43A047', // Зелёный
      light: '#66BB6A',
      dark: '#2E7D32'
    },
    error: {
      main: '#E53935', // Красный
      light: '#EF5350',
      dark: '#C62828'
    },
    warning: {
      main: '#FB8C00',
      light: '#FFB74D',
      dark: '#F57C00'
    },
    background: {
      default: '#F5F5F5', // Светло-серый фон
      paper: '#FAFAFA'
    },
    text: {
      primary: '#212121', // Тёмно-серый
      secondary: '#757575' // Серый
    }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Arial", sans-serif',
    h1: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.2
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.3
    },
    h3: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4
    },
    h4: {
      fontSize: '1.125rem',
      fontWeight: 500
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.43
    },
    button: {
      textTransform: 'none',
      fontWeight: 500
    }
  },
  shape: {
    borderRadius: 8
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }
        },
        containedPrimary: {
          '&:hover': {
            backgroundColor: '#0D47A1'
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)'
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8
          }
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16
        }
      }
    }
  }
});

export default theme;
