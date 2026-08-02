import { Box, Button, Container, Typography } from '@mui/material';
import Link from 'next/link';

export default function HomePage() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ 
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        gap: 3
      }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Welcome to SmartBooks
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Your intelligent accounting solution
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="contained" 
            size="large"
            component={Link}
            href="/login"
          >
            Get Started
          </Button>
          <Button 
            variant="outlined" 
            size="large"
            component={Link}
            href="/features"
          >
            Learn More
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
