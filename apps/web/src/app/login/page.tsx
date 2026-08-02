import LoginForm from './components/LoginForm';
import { Box, Container, Typography } from '@mui/material';

export default function LoginPage() {
  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          SmartBooks Login
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary">
          Enter your credentials to access your account
        </Typography>
      </Box>
      <LoginForm />
    </Container>
  );
}
