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
  const [selectedWallpaper, setSelectedWallpaper] = React.useState(wallpaper);

  const handleWallpaperSelect = (newWallpaper) => {
    console.log('🎨 Wallpaper selected:', newWallpaper);
    setSelectedWallpaper(newWallpaper);
  };

  const handleApply = () => {
    console.log('✅ Applying wallpaper:', selectedWallpaper);
    setWallpaper(selectedWallpaper);
    onClose();
  };

  const handleCancel = () => {
    console.log('❌ Cancelled, reverting to:', wallpaper);
    setSelectedWallpaper(wallpaper); // Reset to current wallpaper
    onClose();
  };

  // Sync when dialog opens
  React.useEffect(() => {
    if (open) {
      setSelectedWallpaper(wallpaper);
    }
  }, [open, wallpaper]);

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
                    elevation={selectedWallpaper.id === preset.id ? 8 : 2}
                    onClick={() => handleWallpaperSelect(preset)}
                    sx={{
                      position: 'relative',
                      aspectRatio: '1',
                      cursor: 'pointer',
                      overflow: 'hidden',
                      borderRadius: 2,
                      border: selectedWallpaper.id === preset.id 
                        ? '4px solid #667eea' 
                        : '2px solid transparent',
                      transition: 'all 0.3s ease',
                      transform: selectedWallpaper.id === preset.id ? 'scale(1.02)' : 'scale(1)',
                      boxShadow: selectedWallpaper.id === preset.id 
                        ? '0 8px 24px rgba(102, 126, 234, 0.4)'
                        : '0 2px 8px rgba(0,0,0,0.1)',
                      '&:hover': {
                        transform: 'translateY(-4px) scale(1.02)',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                      },
                    }}
                  >
                    {/* Wallpaper Preview */}
                    <Box
                      sx={{
                        width: '100%',
                        height: '100%',
                        ...(preset.type === 'gradient' 
                          ? {
                              background: preset.value,
                            }
                          : {
                              backgroundColor: preset.value,
                              backgroundImage: preset.pattern,
                              backgroundSize: 'auto',
                              backgroundRepeat: 'repeat',
                            }
                        ),
                      }}
                    />

                    {/* Selected Indicator */}
                    {selectedWallpaper.id === preset.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                      >
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
                            bgcolor: 'rgba(102, 126, 234, 0.25)',
                            backdropFilter: 'blur(4px)',
                          }}
                        >
                          <Box
                            sx={{
                              width: 48,
                              height: 48,
                              borderRadius: '50%',
                              bgcolor: '#667eea',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontWeight: 'bold',
                              fontSize: '1.8rem',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                              animation: 'pulse 2s infinite',
                              '@keyframes pulse': {
                                '0%, 100%': {
                                  transform: 'scale(1)',
                                },
                                '50%': {
                                  transform: 'scale(1.1)',
                                },
                              },
                            }}
                          >
                            ✓
                          </Box>
                        </Box>
                      </motion.div>
                    )}

                    {/* Wallpaper Name */}
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        bgcolor: selectedWallpaper.id === preset.id
                          ? 'rgba(102, 126, 234, 0.9)'
                          : 'rgba(0,0,0,0.7)',
                        color: 'white',
                        p: 0.75,
                        textAlign: 'center',
                        transition: 'all 0.3s',
                      }}
                    >
                      <Typography 
                        variant="caption" 
                        fontSize="0.75rem"
                        fontWeight={selectedWallpaper.id === preset.id ? 'bold' : 'medium'}
                      >
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
          <Button 
            onClick={handleCancel} 
            variant="outlined" 
            sx={{ 
              borderRadius: 2,
              px: 3,
              py: 1,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            variant="contained"
            sx={{
              borderRadius: 2,
              px: 4,
              py: 1,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Apply Changes
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ThemeSettings;
