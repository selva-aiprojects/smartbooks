'use client';

import { Box, Typography, Card, CardContent, Button, Stack, Paper, Chip } from '@mui/material';
import { 
  AddBox as AddIcon, 
  AccountBalance as AccountsIcon, 
  Assessment as ReportsIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalanceWallet as WalletIcon
} from '@mui/icons-material';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { BarChart, PieChart } from '@mui/x-charts';

export default function DashboardPage() {
  const { user } = useAuth();

  const revenueData = [
    { month: 'Jan', revenue: 4000 },
    { month: 'Feb', revenue: 6500 },
    { month: 'Mar', revenue: 8200 },
    { month: 'Apr', revenue: 9800 },
    { month: 'May', revenue: 12500 },
    { month: 'Jun', revenue: 15000 },
  ];

  const expenseData = [
    { category: 'Salaries & Payroll', value: 8000 },
    { category: 'General & Admin', value: 15000 },
    { category: 'Utilities & Rent', value: 2000 },
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" color="text.primary" gutterBottom>
            Financial Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome back, <strong>{user?.email || 'admin@smartbooks.com'}</strong>
          </Typography>
        </Box>

        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            component={Link}
            href="/journal/new"
            sx={{ borderRadius: 2 }}
          >
            New Journal Entry
          </Button>
          <Button
            variant="outlined"
            startIcon={<AccountsIcon />}
            component={Link}
            href="/accounts"
            sx={{ borderRadius: 2 }}
          >
            Chart of Accounts
          </Button>
          <Button
            variant="outlined"
            startIcon={<ReportsIcon />}
            component={Link}
            href="/reports"
            sx={{ borderRadius: 2 }}
          >
            Financial Reports
          </Button>
        </Stack>
      </Box>

      {/* Top Metric KPI Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
        <Paper sx={{ p: 2.5, borderRadius: 3, borderLeft: '5px solid #0284c7', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
          <Typography variant="body2" color="text.secondary" fontWeight="500">Cash on Hand</Typography>
          <Typography variant="h4" fontWeight="bold" sx={{ mt: 1, color: '#0f172a' }}>₹2,50,000</Typography>
          <Chip icon={<TrendingUpIcon />} label="+12% this month" size="small" color="success" sx={{ mt: 1.5, fontSize: 11 }} />
        </Paper>

        <Paper sx={{ p: 2.5, borderRadius: 3, borderLeft: '5px solid #10b981', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
          <Typography variant="body2" color="text.secondary" fontWeight="500">Total Accounts Receivable</Typography>
          <Typography variant="h4" fontWeight="bold" sx={{ mt: 1, color: '#0f172a' }}>₹85,000</Typography>
          <Chip label="2 Pending Invoices" size="small" color="info" sx={{ mt: 1.5, fontSize: 11 }} />
        </Paper>

        <Paper sx={{ p: 2.5, borderRadius: 3, borderLeft: '5px solid #ef4444', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
          <Typography variant="body2" color="text.secondary" fontWeight="500">Accounts Payable</Typography>
          <Typography variant="h4" fontWeight="bold" sx={{ mt: 1, color: '#0f172a' }}>₹42,000</Typography>
          <Chip label="Due in 15 days" size="small" color="warning" sx={{ mt: 1.5, fontSize: 11 }} />
        </Paper>

        <Paper sx={{ p: 2.5, borderRadius: 3, borderLeft: '5px solid #8b5cf6', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
          <Typography variant="body2" color="text.secondary" fontWeight="500">Net Profit (YTD)</Typography>
          <Typography variant="h4" fontWeight="bold" sx={{ mt: 1, color: '#8b5cf6' }}>₹1,00,000</Typography>
          <Chip label="Revenue ₹3.5L / Expense ₹2.5L" size="small" sx={{ mt: 1.5, fontSize: 11 }} />
        </Paper>
      </Box>

      {/* Analytics Charts */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        <Card sx={{ borderRadius: 3, boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Monthly Revenue Trajectory ($)
            </Typography>
            <Box sx={{ height: 320 }}>
              <BarChart
                xAxis={[{ scaleType: 'band', data: revenueData.map(d => d.month) }]}
                series={[{ data: revenueData.map(d => d.revenue), color: '#0284c7' }]}
              />
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 3, boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Operating Expense Breakdown ($)
            </Typography>
            <Box sx={{ height: 320 }}>
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
      </Box>
    </Box>
  );
}
