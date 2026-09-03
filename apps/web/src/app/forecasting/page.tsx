'use client';

import { Box, Typography, Paper, Chip, Card, CardContent } from '@mui/material';
import { ShowChart as ForecastIcon, TrendingUp as TrendingUpIcon } from '@mui/icons-material';
import { LineChart } from '@mui/x-charts';

export default function ForecastingPage() {
  const forecastData = [
    { month: 'Jul', actual: 12000, projected: 12000 },
    { month: 'Aug', actual: 15000, projected: 15000 },
    { month: 'Sep', actual: null, projected: 18500 },
    { month: 'Oct', actual: null, projected: 22000 },
    { month: 'Nov', actual: null, projected: 26500 },
    { month: 'Dec', actual: null, projected: 31000 },
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <ForecastIcon sx={{ fontSize: 36, color: '#8b5cf6' }} />
          Financial Forecasting & Cash Runway
          <Chip label="Enterprise / Premium Plan" color="secondary" size="small" />
        </Typography>
        <Typography variant="body2" color="text.secondary">
          12-month predictive revenue projections, cash runway analytics, and burn-rate scenarios powered by AI.
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3, mb: 3 }}>
        <Card sx={{ borderLeft: '5px solid #10b981' }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary">Estimated Cash Runway</Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ color: '#10b981', mt: 1 }}>24 Months</Typography>
          </CardContent>
        </Card>

        <Card sx={{ borderLeft: '5px solid #0284c7' }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary">Projected Q4 Revenue</Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ color: '#0284c7', mt: 1 }}>₹79,500</Typography>
          </CardContent>
        </Card>

        <Card sx={{ borderLeft: '5px solid #8b5cf6' }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary">Forecasted Growth Rate</Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ color: '#8b5cf6', mt: 1 }}>+22.4% MoM</Typography>
          </CardContent>
        </Card>
      </Box>

      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          6-Month Projected Revenue vs Actuals (₹)
        </Typography>
        <Box sx={{ height: 350 }}>
          <LineChart
            xAxis={[{ scaleType: 'band', data: forecastData.map(d => d.month) }]}
            series={[
              { data: forecastData.map(d => d.projected), label: 'Projected Growth', color: '#8b5cf6' },
              { data: forecastData.map(d => d.actual), label: 'Actual Revenue', color: '#0284c7' }
            ]}
          />
        </Box>
      </Paper>
    </Box>
  );
}
