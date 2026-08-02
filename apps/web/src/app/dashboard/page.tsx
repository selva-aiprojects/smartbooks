import { Box, Grid, Typography } from '@mui/material';
import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Welcome back, {user?.name || 'User'}
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6} lg={4}>
          {/* Quick Stats Card */}
          <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
            <Typography variant="h6">Recent Activity</Typography>
            {/* TODO: Add activity feed */}
          </Box>
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          {/* Financial Overview Card */}
          <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
            <Typography variant="h6">Financial Overview</Typography>
            {/* TODO: Add financial metrics */}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
