import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { createTheme, ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

const THEME_STORAGE_KEY = 'chaткroo-theme';
const WALLPAPER_STORAGE_KEY = 'chaткroo-wallpaper';

// Preset wallpapers
export const presetWallpapers = [
  {
    id: 'gradient-1',
    name: 'Purple Dream',
    type: 'gradient',
    value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    thumbnail: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  {
    id: 'gradient-2',
    name: 'Ocean Blue',
    type: 'gradient',
    value: 'linear-gradient(135deg, #2E3192 0%, #1BFFFF 100%)',
    thumbnail: 'linear-gradient(135deg, #2E3192 0%, #1BFFFF 100%)',
  },
  {
    id: 'gradient-3',
    name: 'Sunset Orange',
    type: 'gradient',
    value: 'linear-gradient(135deg, #FA8BFF 0%, #2BD2FF 50%, #2BFF88 100%)',
    thumbnail: 'linear-gradient(135deg, #FA8BFF 0%, #2BD2FF 50%, #2BFF88 100%)',
  },
  {
    id: 'gradient-4',
    name: 'Forest Green',
    type: 'gradient',
    value: 'linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%)',
    thumbnail: 'linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%)',
  },
  {
    id: 'gradient-5',
    name: 'Pink Paradise',
    type: 'gradient',
    value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    thumbnail: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  },
  {
    id: 'gradient-6',
    name: 'Aurora',
    type: 'gradient',
    value: 'linear-gradient(135deg, #00F260 0%, #0575E6 100%)',
    thumbnail: 'linear-gradient(135deg, #00F260 0%, #0575E6 100%)',
  },
  {
    id: 'pattern-1',
    name: 'Dark Geometric',
    type: 'pattern',
    value: '#1a1a2e',
    pattern: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
    thumbnail: '#1a1a2e',
  },
  {
    id: 'pattern-2',
    name: 'Light Dots',
    type: 'pattern',
    value: '#f0f0f0',
    pattern: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.2\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E")',
    thumbnail: '#f0f0f0',
  },
];

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return saved || 'dark';
  });

  const [wallpaper, setWallpaper] = useState(() => {
    const saved = localStorage.getItem(WALLPAPER_STORAGE_KEY);
    return saved ? JSON.parse(saved) : presetWallpapers[0];
  });

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  }, [mode]);

  useEffect(() => {
    localStorage.setItem(WALLPAPER_STORAGE_KEY, JSON.stringify(wallpaper));
  }, [wallpaper]);

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const changeWallpaper = (newWallpaper) => {
    setWallpaper(newWallpaper);
  };

  const getWallpaperStyle = () => {
    if (wallpaper.type === 'pattern') {
      return {
        backgroundColor: wallpaper.value,
        backgroundImage: wallpaper.pattern,
      };
    }
    return {
      backgroundImage: wallpaper.value,
    };
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === 'light'
            ? {
                // Light mode colors
                primary: {
                  main: '#667eea',
                  light: '#8b9aee',
                  dark: '#4d5fc7',
                  contrastText: '#fff',
                },
                secondary: {
                  main: '#764ba2',
                  light: '#9568b8',
                  dark: '#5a3a7d',
                  contrastText: '#fff',
                },
                background: {
                  default: '#f5f5f5',
                  paper: '#ffffff',
                },
                text: {
                  primary: '#2c3e50',
                  secondary: '#546e7a',
                },
                divider: 'rgba(0, 0, 0, 0.08)',
              }
            : {
                // Dark mode colors
                primary: {
                  main: '#667eea',
                  light: '#8b9aee',
                  dark: '#4d5fc7',
                  contrastText: '#fff',
                },
                secondary: {
                  main: '#764ba2',
                  light: '#9568b8',
                  dark: '#5a3a7d',
                  contrastText: '#fff',
                },
                background: {
                  default: '#121212',
                  paper: '#1e1e1e',
                },
                text: {
                  primary: '#ffffff',
                  secondary: '#b0b0b0',
                },
                divider: 'rgba(255, 255, 255, 0.08)',
              }),
        },
        typography: {
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
          h1: {
            fontWeight: 700,
          },
          h2: {
            fontWeight: 700,
          },
          h3: {
            fontWeight: 600,
          },
          h4: {
            fontWeight: 600,
          },
          h5: {
            fontWeight: 600,
          },
          h6: {
            fontWeight: 600,
          },
          button: {
            textTransform: 'none',
            fontWeight: 600,
          },
        },
        shape: {
          borderRadius: 12,
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 12,
                padding: '10px 24px',
                fontSize: '0.95rem',
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                },
              },
              contained: {
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5568d3 0%, #623d85 100%)',
                },
              },
            },
          },
          MuiTextField: {
            styleOverrides: {
              root: {
                '& .MuiOutlinedInput-root': {
                  borderRadius: 12,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                  },
                  '&.Mui-focused': {
                    transform: 'translateY(-2px)',
                  },
                },
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                borderRadius: 16,
                boxShadow: mode === 'light'
                  ? '0 8px 32px rgba(0, 0, 0, 0.08)'
                  : '0 8px 32px rgba(0, 0, 0, 0.4)',
              },
            },
          },
          MuiAvatar: {
            styleOverrides: {
              root: {
                border: mode === 'light' 
                  ? '3px solid #fff'
                  : '3px solid rgba(255,255,255,0.1)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              },
            },
          },
        },
      }),
    [mode]
  );

  const value = {
    mode,
    toggleTheme,
    wallpaper,
    changeWallpaper,
    getWallpaperStyle,
    presetWallpapers,
  };

  return (
    <ThemeContext.Provider value={value}>
      <MUIThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MUIThemeProvider>
    </ThemeContext.Provider>
  );
};
