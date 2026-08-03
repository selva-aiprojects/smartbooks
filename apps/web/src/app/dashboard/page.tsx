'use client';

import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Stack, 
  Paper, 
  Chip, 
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  LinearProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  AddBox as AddIcon, 
  AccountBalance as AccountsIcon, 
  Assessment as ReportsIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalanceWallet as WalletIcon,
  Receipt as InvoicesIcon,
  Calculate as CalculateIcon,
  Psychology as AIIcon,
  Shield as ShieldIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  ArrowForward as ArrowForwardIcon,
  Lightbulb as LightbulbIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { useTenant } from '../../context/TenantContext';
import { BarChart, PieChart, LineChart } from '@mui/x-charts';

export default function DashboardPage() {
  const { user } = useAuth();
  const { activeTenant } = useTenant();
  const [timeframe, setTimeframe] = useState<'this_month' | 'quarter' | 'ytd'>('this_month');

  // Metrics dynamically sourced from Active Tenant Schema/Context
  const m = activeTenant.metrics;

  // 1. Today's Collections Data
  const todaysCollections = m.todaysCollections;
  const todaysCollectionsGrowth = `+${m.collectionsGrowth}% vs yesterday`;

  // 2. GST Due Data
  const gstDueAmount = m.gstDue;
  const outputGST = m.outputGst;
  const inputTaxCredit = m.inputTaxCredit;
  const gstDueDate = m.gstDueDate;

  // 3. Cash Position Data
  const cashPosition = m.cashPosition;
  const bankBreakdown = m.bankAccounts.map(b => ({ bank: b.name, balance: b.balance }));

  // 4. Upcoming Vendor Payments
  const upcomingVendorPayments = [
    { vendor: 'AWS Cloud Services', amount: Math.round(m.upcomingPayments * 0.45), dueIn: '2 Days', category: 'Software & Cloud' },
    { vendor: 'Airtel Telecom & Utilities', amount: Math.round(m.upcomingPayments * 0.15), dueIn: '4 Days', category: 'Utilities' },
    { vendor: 'DLF Commercial Workspace', amount: Math.round(m.upcomingPayments * 0.40), dueIn: '6 Days', category: 'Rent & Infra' },
  ];

  // 5 & 6. Receivables & Payables Aging Data
  const receivablesAging = m.receivablesAging.map(a => ({ range: a.bracket, amount: a.amount }));
  const payablesAging = m.payablesAging.map(a => ({ range: a.bracket, amount: a.amount }));

  const totalReceivables = m.receivables;
  const totalPayables = m.payables;

  // 7 & 8. Burn Rate & Cash Runway
  const monthlyBurnRate = m.burnRate;
  const cashRunwayMonths = m.cashRunwayMonths.toFixed(1);

  // 9. Top 10 Customers Leaderboard
  const top10Customers = m.topCustomers.map((c, i) => ({
    rank: i + 1,
    name: c.name,
    revenue: c.revenue,
    invoices: c.invoices,
    status: c.status
  }));

  // 10. AI Insights
  const aiInsights = m.aiAlerts.map(alert => ({
    type: alert.type === 'warning' ? 'tax' : 'opportunity',
    title: alert.type === 'warning' ? 'Expense Anomaly & Audit Alert' : 'Business Intelligence Opportunity',
    desc: alert.message
  }));

  return (
    <Box sx={{ flexGrow: 1, pb: 4 }}>
      {/* Top Header Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight="800" color="text.primary" letterSpacing="-0.5px">
            Financial Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Tenant Schema: <strong style={{ color: '#0284c7' }}>{activeTenant.schema}</strong> · <strong>{activeTenant.name}</strong> ({activeTenant.edition} · GSTIN: {activeTenant.gstin})
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" gap={1}>
          <Chip
            label={timeframe === 'this_month' ? 'This Month' : (timeframe === 'quarter' ? 'This Quarter' : 'YTD 2026')}
            onClick={() => setTimeframe(timeframe === 'this_month' ? 'quarter' : (timeframe === 'quarter' ? 'ytd' : 'this_month'))}
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 600, cursor: 'pointer', borderRadius: 2 }}
          />

          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            component={Link}
            href="/invoices/new"
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            Create Invoice
          </Button>

          <Button
            variant="outlined"
            startIcon={<AccountsIcon />}
            component={Link}
            href="/journal/new"
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            Post Journal
          </Button>
        </Stack>
      </Box>

      {/* Row 1: Primary Liquid & Financial Position Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* 1. Today's Collections */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2.5, borderRadius: 3, borderLeft: '5px solid #10b981', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Typography variant="body2" color="text.secondary" fontWeight="600">Today's Collections</Typography>
              <Avatar sx={{ bgcolor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', width: 34, height: 34 }}>
                <TrendingUpIcon fontSize="small" />
              </Avatar>
            </Box>
            <Typography variant="h4" fontWeight="800" sx={{ mt: 1.5, color: '#0f172a' }}>
              ₹{todaysCollections.toLocaleString('en-IN')}
            </Typography>
            <Chip label={todaysCollectionsGrowth} size="small" color="success" sx={{ mt: 1.5, fontSize: 11, fontWeight: 700 }} />
          </Paper>
        </Grid>

        {/* 2. Cash Position */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2.5, borderRadius: 3, borderLeft: '5px solid #0284c7', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Typography variant="body2" color="text.secondary" fontWeight="600">Cash Position</Typography>
              <Avatar sx={{ bgcolor: 'rgba(2, 132, 199, 0.15)', color: '#0284c7', width: 34, height: 34 }}>
                <WalletIcon fontSize="small" />
              </Avatar>
            </Box>
            <Typography variant="h4" fontWeight="800" sx={{ mt: 1.5, color: '#0f172a' }}>
              ₹{cashPosition.toLocaleString('en-IN')}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block', fontWeight: 500 }}>
              Across HDFC, ICICI & Cash
            </Typography>
          </Paper>
        </Grid>

        {/* 3. Total Receivables */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2.5, borderRadius: 3, borderLeft: '5px solid #38bdf8', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Typography variant="body2" color="text.secondary" fontWeight="600">Total Receivables</Typography>
              <Avatar sx={{ bgcolor: 'rgba(56, 189, 248, 0.15)', color: '#0284c7', width: 34, height: 34 }}>
                <InvoicesIcon fontSize="small" />
              </Avatar>
            </Box>
            <Typography variant="h4" fontWeight="800" sx={{ mt: 1.5, color: '#0f172a' }}>
              ₹{totalReceivables.toLocaleString('en-IN')}
            </Typography>
            <Chip label="7 Outstanding Invoices" size="small" color="info" sx={{ mt: 1.5, fontSize: 11, fontWeight: 700 }} />
          </Paper>
        </Grid>

        {/* 4. Total Payables */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2.5, borderRadius: 3, borderLeft: '5px solid #f59e0b', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Typography variant="body2" color="text.secondary" fontWeight="600">Total Payables</Typography>
              <Avatar sx={{ bgcolor: 'rgba(245, 158, 11, 0.15)', color: '#d97706', width: 34, height: 34 }}>
                <ScheduleIcon fontSize="small" />
              </Avatar>
            </Box>
            <Typography variant="h4" fontWeight="800" sx={{ mt: 1.5, color: '#0f172a' }}>
              ₹{totalPayables.toLocaleString('en-IN')}
            </Typography>
            <Chip label="5 Pending Bills" size="small" color="warning" sx={{ mt: 1.5, fontSize: 11, fontWeight: 700 }} />
          </Paper>
        </Grid>
      </Grid>

      {/* Row 2: Secondary Operational KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* 5. GST Due */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" color="text.secondary" fontWeight="600">GST Net Liability</Typography>
                <Chip label={`Due ${gstDueDate}`} size="small" color="error" sx={{ height: 20, fontSize: 10, fontWeight: 700 }} />
              </Box>
              <Typography variant="h5" fontWeight="800" color="#ef4444">
                ₹{gstDueAmount.toLocaleString('en-IN')}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                Output ₹82.5k - Input ITC ₹34.25k
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* 6. Upcoming Vendor Payments */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" color="text.secondary" fontWeight="600">Upcoming Vendor Pay</Typography>
                <Chip label="Next 7 Days" size="small" sx={{ height: 20, fontSize: 10, bgcolor: '#fef3c7', color: '#b45309', fontWeight: 700 }} />
              </Box>
              <Typography variant="h5" fontWeight="800" color="#0f172a">
                ₹1,83,500
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                3 Vendors Pending Approval
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* 7. Burn Rate */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" color="text.secondary" fontWeight="600">Monthly Net Burn Rate</Typography>
                <TrendingDownIcon sx={{ color: '#0284c7', fontSize: 18 }} />
              </Box>
              <Typography variant="h5" fontWeight="800" color="#0f172a">
                ₹{monthlyBurnRate.toLocaleString('en-IN')}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                OpEx minus Recurring Revenue
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* 8. Cash Runway */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" color="text.secondary" fontWeight="600">Estimated Cash Runway</Typography>
                <Chip label="Healthy" size="small" color="success" sx={{ height: 20, fontSize: 10, fontWeight: 700 }} />
              </Box>
              <Typography variant="h5" fontWeight="800" color="#8b5cf6">
                {cashRunwayMonths} Months
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                Based on ₹14.85L Liquid Reserves
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Row 3: Analytics Graphs & Breakdown */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Receivables & Payables Aging Bar Chart */}
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="h6" fontWeight="700" color="text.primary">
                    Receivables & Payables Aging Analysis (₹)
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Compare outstanding customer receivables vs vendor payables across aging brackets
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                  <Chip label="Receivables ₹5.8L" size="small" sx={{ bgcolor: 'rgba(2, 132, 199, 0.15)', color: '#0284c7', fontWeight: 700 }} />
                  <Chip label="Payables ₹3.4L" size="small" sx={{ bgcolor: 'rgba(245, 158, 11, 0.15)', color: '#d97706', fontWeight: 700 }} />
                </Stack>
              </Box>

              <Box sx={{ height: 310 }}>
                <BarChart
                  xAxis={[{ scaleType: 'band', data: ['0-30 Days', '31-60 Days', '61-90 Days', '>90 Days'] }]}
                  series={[
                    { label: 'Receivables (AR)', data: receivablesAging.map(d => d.amount), color: '#0284c7' },
                    { label: 'Payables (AP)', data: payablesAging.map(d => d.amount), color: '#f59e0b' }
                  ]}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Bank Liquidity Breakdown Pie Chart */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="700" color="text.primary" gutterBottom>
                Liquid Bank Reserves Distribution
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                Real-time bank account balances
              </Typography>

              <Box sx={{ height: 260, display: 'flex', justifyContent: 'center' }}>
                <PieChart
                  series={[{
                    data: bankBreakdown.map((b, index) => ({
                      id: index,
                      value: b.balance,
                      label: b.bank.split(' ')[0]
                    })),
                    innerRadius: 40,
                    outerRadius: 90,
                    paddingAngle: 3
                  }]}
                />
              </Box>

              <Stack spacing={1} sx={{ mt: 1 }}>
                {bankBreakdown.map((b, i) => (
                  <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary" fontWeight="600">{b.bank}</Typography>
                    <Typography variant="caption" fontWeight="700" color="#0f172a">₹{b.balance.toLocaleString('en-IN')}</Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Row 4: Top 10 Customers & AI Insights */}
      <Grid container spacing={3}>
        {/* 9. Top 10 Customers Leaderboard */}
        <Grid item xs={12} md={7}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="h6" fontWeight="700" color="text.primary">
                    Top 10 Customers Leaderboard
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Ranked by total billed invoice revenue and payment performance
                  </Typography>
                </Box>
                <Button component={Link} href="/invoices" size="small" endIcon={<ArrowForwardIcon />} sx={{ textTransform: 'none', fontWeight: 600 }}>
                  View All
                </Button>
              </Box>

              <TableContainer sx={{ maxHeight: 380 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Rank</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Customer Name</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, fontSize: 12 }}>Revenue (₹)</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, fontSize: 12 }}>Invoices</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, fontSize: 12 }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {top10Customers.map((cust) => (
                      <TableRow key={cust.rank} hover>
                        <TableCell sx={{ fontWeight: 700, color: '#0284c7', fontSize: 12 }}>#{cust.rank}</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>{cust.name}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, fontSize: 12 }}>
                          ₹{cust.revenue.toLocaleString('en-IN')}
                        </TableCell>
                        <TableCell align="center" sx={{ fontSize: 12 }}>{cust.invoices}</TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={cust.status} 
                            size="small" 
                            color={cust.status === 'On Time' ? 'success' : 'warning'} 
                            sx={{ height: 18, fontSize: 10, fontWeight: 700 }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* 10. AI Insights & Recommendations Panel */}
        <Grid item xs={12} md={5}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', height: '100%', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#ffffff' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Avatar sx={{ bgcolor: 'rgba(56, 189, 248, 0.2)', border: '1px solid #0284c7' }}>
                  <AIIcon sx={{ color: '#38bdf8' }} />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="700" color="#ffffff">
                    SmartBooks AI Financial Insights
                  </Typography>
                  <Typography variant="caption" color="#94a3b8">
                    Continuous ledger analysis & tax optimization
                  </Typography>
                </Box>
              </Box>

              <Stack spacing={2} sx={{ mt: 3 }}>
                {aiInsights.map((insight, idx) => (
                  <Paper 
                    key={idx} 
                    sx={{ 
                      p: 2, 
                      borderRadius: 2.5, 
                      bgcolor: 'rgba(15, 23, 42, 0.8)', 
                      border: '1px solid rgba(56, 189, 248, 0.25)' 
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <LightbulbIcon sx={{ color: insight.type === 'opportunity' ? '#f59e0b' : (insight.type === 'tax' ? '#10b981' : '#38bdf8'), fontSize: 18 }} />
                      <Typography variant="subtitle2" fontWeight="700" color="#f8fafc">
                        {insight.title}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="#cbd5e1" sx={{ fontSize: 12.5, lineHeight: 1.5 }}>
                      {insight.desc}
                    </Typography>
                  </Paper>
                ))}
              </Stack>

              {/* Upcoming Vendor Payments Widget */}
              <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <Typography variant="subtitle2" fontWeight="700" color="#38bdf8" sx={{ mb: 1 }}>
                  Upcoming Vendor Due List (Next 7 Days)
                </Typography>
                <Stack spacing={1}>
                  {upcomingVendorPayments.map((v, i) => (
                    <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="#cbd5e1">{v.vendor} ({v.dueIn})</Typography>
                      <Typography variant="caption" fontWeight="700" color="#f8fafc">₹{v.amount.toLocaleString('en-IN')}</Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
