'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Button, 
  TextField, 
  Box, 
  Alert, 
  IconButton, 
  InputAdornment, 
  FormControlLabel, 
  Checkbox, 
  Typography, 
  Paper
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  Lock as LockIcon, 
  AutoFixHigh as AutoFillIcon,
  ArrowForward as ArrowForwardIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { useAuth } from '../../../context/AuthContext';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { login } = useAuth();

  const handleAutoFillDemo = () => {
    setEmail('admin@smartbooks.com');
    setPassword('admin123');
    setError('');
  };

  const handleClear = () => {
    setEmail('');
    setPassword('');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const success = await login(email, password);
    if (success) {
      router.push('/dashboard');
    } else {
      setError('Invalid email address or password. Please try admin@smartbooks.com / admin123');
    }
    setIsLoading(false);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      {/* 1-Click Demo Fill Banner */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 2, 
          mb: 3, 
          borderRadius: 2.5, 
          bgcolor: '#f0f9ff', 
          border: '1px solid #bae6fd',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AutoFillIcon sx={{ color: '#0284c7', fontSize: 20 }} />
          <Typography variant="body2" color="#0369a1" fontWeight="600">
            Testing Demo Account?
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            size="small" 
            variant="contained" 
            onClick={handleAutoFillDemo}
            sx={{ 
              bgcolor: '#0284c7', 
              '&:hover': { bgcolor: '#0369a1' }, 
              textTransform: 'none', 
              fontSize: 12,
              fontWeight: 600,
              borderRadius: 1.5
            }}
          >
            Auto-Fill Admin Demo
          </Button>
          {(email || password) && (
            <Button 
              size="small" 
              variant="outlined" 
              onClick={handleClear}
              sx={{ textTransform: 'none', fontSize: 12, borderRadius: 1.5 }}
            >
              Clear Fields
            </Button>
          )}
        </Box>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      <TextField
        fullWidth
        label="Business Email Address"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        margin="normal"
        placeholder="admin@smartbooks.com"
        autoComplete="email"
        required
        InputProps={{
          sx: { borderRadius: 2 },
          endAdornment: email ? (
            <InputAdornment position="end">
              <IconButton size="small" onClick={() => setEmail('')} edge="end">
                <ClearIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ) : null
        }}
      />
      
      <TextField
        fullWidth
        label="Account Password"
        type={showPassword ? 'text' : 'password'}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        margin="normal"
        placeholder="••••••••"
        autoComplete="current-password"
        required
        InputProps={{
          sx: { borderRadius: 2 },
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          )
        }}
      />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', my: 1.5 }}>
        <FormControlLabel
          control={<Checkbox checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} color="primary" size="small" />}
          label={<Typography variant="body2" color="text.secondary">Remember this session</Typography>}
        />
        <Typography variant="body2" color="primary" sx={{ cursor: 'pointer', fontWeight: 600 }}>
          Forgot password?
        </Typography>
      </Box>

      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        disabled={isLoading}
        endIcon={<ArrowForwardIcon />}
        sx={{ 
          mt: 2, 
          mb: 3, 
          py: 1.5, 
          borderRadius: 2.5, 
          bgcolor: '#0284c7', 
          '&:hover': { bgcolor: '#0369a1' },
          fontSize: '1rem',
          fontWeight: 600,
          textTransform: 'none',
          boxShadow: '0 4px 14px 0 rgba(2, 132, 199, 0.39)'
        }}
      >
        {isLoading ? 'Authenticating...' : 'Sign In to Workspace'}
      </Button>

      <Box sx={{ textAlign: 'center', mt: 1 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
          <LockIcon sx={{ fontSize: 13, color: '#10b981' }} />
          Secured by SmartBooks 256-bit TLS Encryption
        </Typography>
      </Box>
    </Box>
  );
}
