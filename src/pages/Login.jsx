import { useFileHandler, useInputValidation } from "6pp";
import {
  CameraAlt as CameraAltIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  Wallpaper as WallpaperIcon,
  Visibility,
  VisibilityOff,
  PersonAdd,
  Login as LoginIcon,
} from "@mui/icons-material";
import {
  Avatar,
  Button,
  Container,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
  Box,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  Chip,
  Tooltip,
  Zoom,
  Fade,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { VisuallyHiddenInput } from "../components/styles/StyledComponents";
import { server } from "../constants/config";
import { userExists } from "../redux/reducers/auth";
import { usernameValidator } from "../utils/validators";
import { useTheme } from "../context/ThemeContext";

const MotionPaper = motion(Paper);
const MotionBox = motion(Box);

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [wallpaperDialogOpen, setWallpaperDialogOpen] = useState(false);

  const { mode, toggleTheme, wallpaper, changeWallpaper, getWallpaperStyle, presetWallpapers } = useTheme();

  const toggleLogin = () => setIsLogin((prev) => !prev);
  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const name = useInputValidation("");
  const bio = useInputValidation("");
  const username = useInputValidation("", usernameValidator);
  const password = useInputValidation("");

  const avatar = useFileHandler("single");

  const dispatch = useDispatch();

  const handleLogin = async (e) => {
    e.preventDefault();

    const toastId = toast.loading("Logging In...");

    setIsLoading(true);
    const config = {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    };

    try {
      const { data } = await axios.post(
        `${server}/api/v1/user/login`,
        {
          username: username.value,
          password: password.value,
        },
        config
      );
      dispatch(userExists(data.user));
      toast.success(data.message, {
        id: toastId,
      });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something Went Wrong", {
        id: toastId,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();

    const toastId = toast.loading("Signing Up...");
    setIsLoading(true);

    const formData = new FormData();
    formData.append("avatar", avatar.file);
    formData.append("name", name.value);
    formData.append("bio", bio.value);
    formData.append("username", username.value);
    formData.append("password", password.value);

    const config = {
      withCredentials: true,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };

    try {
      const { data } = await axios.post(
        `${server}/api/v1/user/new`,
        formData,
        config
      );

      dispatch(userExists(data.user));
      toast.success(data.message, {
        id: toastId,
      });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something Went Wrong", {
        id: toastId,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const WallpaperDialog = () => (
    <Dialog
      open={wallpaperDialogOpen}
      onClose={() => setWallpaperDialogOpen(false)}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: mode === 'dark' 
            ? 'linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)'
            : 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
        }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <WallpaperIcon />
          <Typography variant="h6" fontWeight={600}>Choose Wallpaper</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          {presetWallpapers.map((wp) => (
            <Grid item xs={6} sm={4} key={wp.id}>
              <MotionBox
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  changeWallpaper(wp);
                  setWallpaperDialogOpen(false);
                  toast.success(`Wallpaper changed to ${wp.name}`);
                }}
                sx={{
                  cursor: 'pointer',
                  borderRadius: 2,
                  overflow: 'hidden',
                  position: 'relative',
                  height: 100,
                  background: wp.type === 'pattern' ? wp.value : wp.thumbnail,
                  backgroundImage: wp.type === 'pattern' ? wp.pattern : wp.thumbnail,
                  border: wallpaper.id === wp.id ? '3px solid' : '2px solid',
                  borderColor: wallpaper.id === wp.id ? 'primary.main' : 'divider',
                  boxShadow: wallpaper.id === wp.id 
                    ? '0 4px 20px rgba(102, 126, 234, 0.4)'
                    : '0 2px 8px rgba(0,0,0,0.1)',
                }}
              >
                {wallpaper.id === wp.id && (
                  <Chip
                    label="Active"
                    size="small"
                    color="primary"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      fontWeight: 600,
                      fontSize: '0.7rem',
                    }}
                  />
                )}
              </MotionBox>
              <Typography 
                variant="caption" 
                align="center" 
                display="block" 
                sx={{ mt: 1, fontWeight: 500 }}
              >
                {wp.name}
              </Typography>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
    </Dialog>
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        ...getWallpaperStyle(),
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Floating controls */}
      <Box
        sx={{
          position: "fixed",
          top: 20,
          right: 20,
          display: "flex",
          gap: 1,
          zIndex: 10,
        }}
      >
        <Tooltip title="Change Wallpaper" TransitionComponent={Zoom}>
          <MotionBox whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <IconButton
              onClick={() => setWallpaperDialogOpen(true)}
              sx={{
                bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                backdropFilter: 'blur(10px)',
                '&:hover': {
                  bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
                },
              }}
            >
              <WallpaperIcon />
            </IconButton>
          </MotionBox>
        </Tooltip>
        
        <Tooltip title={mode === 'dark' ? 'Light Mode' : 'Dark Mode'} TransitionComponent={Zoom}>
          <MotionBox whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <IconButton
              onClick={toggleTheme}
              sx={{
                bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                backdropFilter: 'blur(10px)',
                '&:hover': {
                  bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
                },
              }}
            >
              {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </MotionBox>
        </Tooltip>
      </Box>

      <Container component="main" maxWidth="xs">
        <MotionPaper
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, type: "spring" }}
          elevation={24}
          sx={{
            padding: { xs: 3, sm: 4 },
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            backdropFilter: 'blur(20px)',
            background: mode === 'dark' 
              ? 'rgba(30, 30, 30, 0.85)'
              : 'rgba(255, 255, 255, 0.85)',
            border: '1px solid',
            borderColor: mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          }}
        >
          {/* Logo/Brand */}
          <MotionBox
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            sx={{ mb: 2 }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
                mb: 1,
              }}
            >
              <Typography variant="h3" sx={{ color: 'white', fontWeight: 700 }}>
                CK
              </Typography>
            </Box>
          </MotionBox>

          <Typography
            variant="h4"
            component={motion.h1}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1,
            }}
          >
            ChatKroo!
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 3, textAlign: 'center' }}
          >
            {isLogin ? 'Welcome back! Sign in to continue' : 'Create your account to get started'}
          </Typography>

          <AnimatePresence mode="wait">
            {isLogin ? (
              <MotionBox
                key="login"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.3 }}
                component="form"
                onSubmit={handleLogin}
                sx={{ width: '100%' }}
              >
                <TextField
                  required
                  fullWidth
                  label="Username"
                  margin="normal"
                  variant="outlined"
                  value={username.value}
                  onChange={username.changeHandler}
                  autoComplete="username"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonAdd sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  required
                  fullWidth
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  margin="normal"
                  variant="outlined"
                  value={password.value}
                  onChange={password.changeHandler}
                  autoComplete="current-password"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={togglePasswordVisibility}
                          edge="end"
                          size="small"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <MotionBox
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  sx={{ mt: 3 }}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    fullWidth
                    disabled={isLoading}
                    startIcon={<LoginIcon />}
                    sx={{
                      py: 1.5,
                      fontSize: '1rem',
                    }}
                  >
                    {isLoading ? "Logging In..." : "Login"}
                  </Button>
                </MotionBox>

                <Box sx={{ textAlign: 'center', my: 2 }}>
                  <Chip 
                    label="OR" 
                    size="small" 
                    sx={{ 
                      bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                      fontWeight: 600,
                    }} 
                  />
                </Box>

                <Button
                  disabled={isLoading}
                  fullWidth
                  variant="outlined"
                  onClick={toggleLogin}
                  sx={{ py: 1.2 }}
                >
                  Create New Account
                </Button>
              </MotionBox>
            ) : (
              <MotionBox
                key="signup"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                component="form"
                onSubmit={handleSignUp}
                sx={{ width: '100%' }}
              >
                <Stack position="relative" width="10rem" margin="auto" mb={2}>
                  <MotionBox
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Avatar
                      sx={{
                        width: "10rem",
                        height: "10rem",
                        objectFit: "contain",
                        border: '4px solid',
                        borderColor: 'primary.main',
                        boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)',
                      }}
                      src={avatar.preview}
                    />
                  </MotionBox>

                  <MotionBox
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <IconButton
                      sx={{
                        position: "absolute",
                        bottom: 0,
                        right: 0,
                        color: "white",
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                        "&:hover": {
                          background: 'linear-gradient(135deg, #5568d3 0%, #623d85 100%)',
                        },
                      }}
                      component="label"
                    >
                      <CameraAltIcon />
                      <VisuallyHiddenInput
                        type="file"
                        onChange={avatar.changeHandler}
                      />
                    </IconButton>
                  </MotionBox>
                </Stack>

                {avatar.error && (
                  <Fade in>
                    <Typography
                      m="1rem auto"
                      width="fit-content"
                      display="block"
                      color="error"
                      variant="caption"
                    >
                      {avatar.error}
                    </Typography>
                  </Fade>
                )}

                <TextField
                  required
                  fullWidth
                  label="Full Name"
                  margin="normal"
                  variant="outlined"
                  value={name.value}
                  onChange={name.changeHandler}
                  autoComplete="name"
                />

                <TextField
                  required
                  fullWidth
                  label="Bio"
                  margin="normal"
                  variant="outlined"
                  value={bio.value}
                  onChange={bio.changeHandler}
                  multiline
                  rows={2}
                  placeholder="Tell us about yourself..."
                />

                <TextField
                  required
                  fullWidth
                  label="Username"
                  margin="normal"
                  variant="outlined"
                  value={username.value}
                  onChange={username.changeHandler}
                  autoComplete="username"
                />

                {username.error && (
                  <Fade in>
                    <Typography color="error" variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                      {username.error}
                    </Typography>
                  </Fade>
                )}

                <TextField
                  required
                  fullWidth
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  margin="normal"
                  variant="outlined"
                  value={password.value}
                  onChange={password.changeHandler}
                  autoComplete="new-password"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={togglePasswordVisibility}
                          edge="end"
                          size="small"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <MotionBox
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  sx={{ mt: 3 }}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    fullWidth
                    disabled={isLoading}
                    startIcon={<PersonAdd />}
                    sx={{
                      py: 1.5,
                      fontSize: '1rem',
                    }}
                  >
                    {isLoading ? "Creating Account..." : "Sign Up"}
                  </Button>
                </MotionBox>

                <Box sx={{ textAlign: 'center', my: 2 }}>
                  <Chip 
                    label="OR" 
                    size="small" 
                    sx={{ 
                      bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                      fontWeight: 600,
                    }} 
                  />
                </Box>

                <Button
                  disabled={isLoading}
                  fullWidth
                  variant="outlined"
                  onClick={toggleLogin}
                  sx={{ py: 1.2 }}
                >
                  Already have an account? Login
                </Button>
              </MotionBox>
            )}
          </AnimatePresence>

          {/* Footer */}
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 3, textAlign: 'center' }}
          >
            By continuing, you agree to ChatKroo&apos;s Terms & Privacy Policy
          </Typography>
        </MotionPaper>
      </Container>

      <WallpaperDialog />
    </Box>
  );
};

export default Login;
