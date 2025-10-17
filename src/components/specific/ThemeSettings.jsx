import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Switch,
  Grid,
  Paper,
  Stack,
  Divider,
  Button,
} from '@mui/material';
import {
  Close as CloseIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  Palette as PaletteIcon,
} from '@mui/icons-material';
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';

const ThemeSettings = ({ open, onClose }) => {
  const { mode, toggleTheme, wallpaper, setWallpaper, presetWallpapers } = useTheme();

  const handleWallpaperChange = (newWallpaper) => {
    setWallpaper(newWallpaper);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '80vh',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <PaletteIcon sx={{ color: '#667eea' }} />
          <Typography variant="h6" fontWeight="bold">
            Theme & Wallpaper Settings
          </Typography>
        </Stack>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 3 }}>
        {/* Theme Mode Toggle */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Theme Mode
          </Typography>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              bgcolor: 'action.hover',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              {mode === 'light' ? (
                <LightModeIcon sx={{ fontSize: 28, color: '#f59e0b' }} />
              ) : (
                <DarkModeIcon sx={{ fontSize: 28, color: '#3b82f6' }} />
              )}
              <Box>
                <Typography variant="body1" fontWeight="medium">
                  {mode === 'light' ? 'Light Mode' : 'Dark Mode'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Switch between light and dark theme
                </Typography>
              </Box>
            </Stack>
            <Switch
              checked={mode === 'dark'}
              onChange={toggleTheme}
              color="primary"
              sx={{
                '& .MuiSwitch-thumb': {
                  bgcolor: mode === 'dark' ? '#3b82f6' : '#f59e0b',
                },
              }}
            />
          </Paper>
        </Box>

        {/* Chat Wallpapers */}
        <Box>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Chat Wallpaper
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
            Choose a background for your chat
          </Typography>

          <Grid container spacing={2}>
            {presetWallpapers.map((preset) => (
              <Grid item xs={6} sm={4} md={3} key={preset.id}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Paper
                    elevation={wallpaper.id === preset.id ? 8 : 2}
                    onClick={() => handleWallpaperChange(preset)}
                    sx={{
                      position: 'relative',
                      aspectRatio: '1',
                      cursor: 'pointer',
                      overflow: 'hidden',
                      borderRadius: 2,
                      border: wallpaper.id === preset.id ? '3px solid #667eea' : '3px solid transparent',
                      transition: 'all 0.3s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 6,
                      },
                    }}
                  >
                    {/* Wallpaper Preview */}
                    <Box
                      sx={{
                        width: '100%',
                        height: '100%',
                        background: preset.type === 'gradient' ? preset.value : preset.value,
                        backgroundImage: preset.pattern || 'none',
                      }}
                    />

                    {/* Selected Indicator */}
                    {wallpaper.id === preset.id && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: 'rgba(102, 126, 234, 0.3)',
                          backdropFilter: 'blur(2px)',
                        }}
                      >
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            bgcolor: '#667eea',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '1.5rem',
                          }}
                        >
                          ✓
                        </Box>
                      </Box>
                    )}

                    {/* Wallpaper Name */}
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        bgcolor: 'rgba(0,0,0,0.6)',
                        color: 'white',
                        p: 0.5,
                        textAlign: 'center',
                      }}
                    >
                      <Typography variant="caption" fontSize="0.7rem">
                        {preset.name}
                      </Typography>
                    </Box>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2 }}>
            Cancel
          </Button>
          <Button
            onClick={onClose}
            variant="contained"
            sx={{
              borderRadius: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
              },
            }}
          >
            Apply
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ThemeSettings;
