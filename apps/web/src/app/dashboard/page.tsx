import { Box, Grid, Typography, Card, CardContent } from '@mui/material';
import { useAuth } from '@/context/AuthContext';
import { BarChart, PieChart } from '@mui/x-charts';

export default function DashboardPage() {
  const { user } = useAuth();

  // Mock data for charts
  const revenueData = [
    { month: 'Jan', revenue: 4000 },
    { month: 'Feb', revenue: 3000 },
    { month: 'Mar', revenue: 2000 },
    { month: 'Apr', revenue: 2780 },
    { month: 'May', revenue: 1890 },
  ];

  const expenseData = [
    { category: 'Salaries', value: 4000 },
    { category: 'Supplies', value: 3000 },
    { category: 'Utilities', value: 2000 },
  ];

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
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              {/* TODO: Add activity feed */}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Financial Overview
              </Typography>
              <Box sx={{ height: 300 }}>
                <BarChart
                  xAxis={[{ scaleType: 'band', data: revenueData.map(d => d.month) }]}
                  series={[{ data: revenueData.map(d => d.revenue) }]}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Expense Breakdown
              </Typography>
              <Box sx={{ height: 300 }}>
                <PieChart
                  series={[{
                    data: expenseData.map((d, index) => ({
                      id: index,
                      value: d.value,
                      label: d.category
                    }))
                  }]}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
