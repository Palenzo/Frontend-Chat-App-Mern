import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { createTheme, ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import {
  brand,
  accent,
  neutral,
  semantic,
  radii,
  brandGradient,
  brandGradientHover,
  fontStack,
} from '../theme/tokens';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

const THEME_STORAGE_KEY = 'chatkroo-theme';
const WALLPAPER_STORAGE_KEY = 'chatkroo-wallpaper';

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

  const theme = useMemo(() => {
    const isLight = mode === 'light';

    return createTheme({
      palette: {
        mode,
        primary: {
          main: isLight ? brand[500] : brand[400],
          light: isLight ? brand[400] : brand[300],
          dark: isLight ? brand[600] : brand[500],
          contrastText: '#fff',
        },
        secondary: {
          main: isLight ? accent[500] : accent[400],
          light: isLight ? accent[400] : accent[300],
          dark: isLight ? accent[600] : accent[500],
          contrastText: '#fff',
        },
        background: {
          default: isLight ? neutral[50] : neutral[900],
          paper: isLight ? neutral[0] : neutral[850],
        },
        text: {
          primary: isLight ? neutral[900] : neutral[100],
          secondary: isLight ? neutral[500] : neutral[400],
        },
        divider: isLight ? 'rgba(17, 19, 29, 0.08)' : 'rgba(255, 255, 255, 0.08)',
        error: { main: isLight ? semantic.error.light : semantic.error.dark },
        success: { main: isLight ? semantic.success.light : semantic.success.dark },
        warning: { main: isLight ? semantic.warning.light : semantic.warning.dark },
        info: { main: isLight ? semantic.info.light : semantic.info.dark },
      },
      shape: { borderRadius: radii.md },
      typography: {
        fontFamily: fontStack,
        h1: { fontWeight: 800, letterSpacing: '-0.02em' },
        h2: { fontWeight: 800, letterSpacing: '-0.02em' },
        h3: { fontWeight: 700, letterSpacing: '-0.01em' },
        h4: { fontWeight: 700, letterSpacing: '-0.01em' },
        h5: { fontWeight: 700 },
        h6: { fontWeight: 700 },
        button: { textTransform: 'none', fontWeight: 600 },
      },
      components: {
        MuiButton: {
          defaultProps: { disableElevation: true },
          styleOverrides: {
            root: {
              borderRadius: radii.pill,
              textTransform: 'none',
              fontWeight: 600,
              padding: '8px 18px',
            },
            containedPrimary: {
              backgroundImage: brandGradient,
              '&:hover': { backgroundImage: brandGradientHover },
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: { backgroundImage: 'none', borderRadius: radii.lg },
          },
        },
        MuiOutlinedInput: {
          styleOverrides: { root: { borderRadius: radii.md } },
        },
        MuiIconButton: {
          styleOverrides: {
            root: {
              '&:hover': {
                backgroundColor: isLight
                  ? 'rgba(102, 126, 234, 0.08)'
                  : 'rgba(127, 140, 246, 0.12)',
              },
            },
          },
        },
        MuiTooltip: {
          styleOverrides: {
            tooltip: { borderRadius: radii.sm, fontSize: '0.75rem' },
          },
        },
      },
    });
  }, [mode]);

  const value = {
    mode,
    toggleTheme,
    wallpaper,
    setWallpaper: changeWallpaper, // Alias for better API
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
