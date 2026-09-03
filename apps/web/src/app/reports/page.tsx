'use client';

import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Tabs, 
  Tab, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Button,
  Chip,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import { Download as DownloadIcon, Print as PrintIcon } from '@mui/icons-material';

export default function FinancialReportsPage() {
  const [tabValue, setTabValue] = useState(0);

  // Financial report data
  const balanceSheet = {
    assets: [
      { code: '1010', name: 'Cash on Hand', amount: 25000 },
      { code: '1020', name: 'Accounts Receivable', amount: 8500 },
    ],
    liabilities: [
      { code: '2010', name: 'Accounts Payable', amount: 4200 },
    ],
    equity: [
      { code: '3010', name: 'Owner Equity', amount: 29300 },
    ]
  };

  const incomeStatement = {
    revenue: [
      { code: '4010', name: 'Sales Revenue', amount: 35000 },
    ],
    expenses: [
      { code: '5010', name: 'General & Administrative Expense', amount: 15000 },
      { code: '5020', name: 'Salaries & Payroll Expense', amount: 8000 },
      { code: '5030', name: 'Utilities & Rent Expense', amount: 2000 }
    ]
  };

  const totalAssets = balanceSheet.assets.reduce((sum, item) => sum + item.amount, 0);
  const totalLiabilities = balanceSheet.liabilities.reduce((sum, item) => sum + item.amount, 0);
  const totalEquity = balanceSheet.equity.reduce((sum, item) => sum + item.amount, 0);

  const totalRevenue = incomeStatement.revenue.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = incomeStatement.expenses.reduce((sum, item) => sum + item.amount, 0);
  const netIncome = totalRevenue - totalExpenses;

  const handleExport = () => {
    alert('Report downloaded successfully!');
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="600" gutterBottom>
            Financial Reports
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Standard GAAP & IFRS compliant balance sheet and profit & loss statements.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button variant="outlined" startIcon={<PrintIcon />} onClick={() => window.print()}>
            Print
          </Button>
          <Button variant="contained" startIcon={<DownloadIcon />} onClick={handleExport}>
            Export PDF / CSV
          </Button>
        </Box>
      </Box>

      <Paper sx={{ mb: 3, borderRadius: 2 }}>
        <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)} sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Balance Sheet" />
          <Tab label="Profit & Loss (P&L)" />
        </Tabs>
      </Paper>

      {/* Tab 0: Balance Sheet */}
      {tabValue === 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
            <Card sx={{ borderLeft: '4px solid #0284c7' }}>
              <CardContent>
                <Typography color="text.secondary" variant="body2">Total Assets</Typography>
                <Typography variant="h4" fontWeight="bold" sx={{ color: '#0284c7', mt: 0.5 }}>
                  ₹{totalAssets.toLocaleString('en-IN')}
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ borderLeft: '4px solid #ef4444' }}>
              <CardContent>
                <Typography color="text.secondary" variant="body2">Total Liabilities</Typography>
                <Typography variant="h4" fontWeight="bold" sx={{ color: '#ef4444', mt: 0.5 }}>
                  ₹{totalLiabilities.toLocaleString('en-IN')}
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ borderLeft: '4px solid #10b981' }}>
              <CardContent>
                <Typography color="text.secondary" variant="body2">Total Equity</Typography>
                <Typography variant="h4" fontWeight="bold" sx={{ color: '#10b981', mt: 0.5 }}>
                  ₹{totalEquity.toLocaleString('en-IN')}
                </Typography>
              </CardContent>
            </Card>
          </Box>

          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Assets
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f1f5f9' }}>
                    <TableCell>Code</TableCell>
                    <TableCell>Account Name</TableCell>
                    <TableCell align="right">Balance (₹)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {balanceSheet.assets.map((row) => (
                    <TableRow key={row.code}>
                      <TableCell><Chip label={row.code} size="small" variant="outlined" /></TableCell>
                      <TableCell>{row.name}</TableCell>
                      <TableCell align="right">₹{row.amount.toLocaleString('en-IN')}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow sx={{ backgroundColor: '#f8fafc', fontWeight: 'bold' }}>
                    <TableCell colSpan={2}><strong>Total Current Assets</strong></TableCell>
                    <TableCell align="right"><strong>₹{totalAssets.toLocaleString('en-IN')}</strong></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Liabilities & Equity
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f1f5f9' }}>
                    <TableCell>Code</TableCell>
                    <TableCell>Account Name</TableCell>
                    <TableCell align="right">Balance (₹)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {balanceSheet.liabilities.map((row) => (
                    <TableRow key={row.code}>
                      <TableCell><Chip label={row.code} size="small" color="error" variant="outlined" /></TableCell>
                      <TableCell>{row.name}</TableCell>
                      <TableCell align="right">₹{row.amount.toLocaleString('en-IN')}</TableCell>
                    </TableRow>
                  ))}
                  {balanceSheet.equity.map((row) => (
                    <TableRow key={row.code}>
                      <TableCell><Chip label={row.code} size="small" color="success" variant="outlined" /></TableCell>
                      <TableCell>{row.name}</TableCell>
                      <TableCell align="right">₹{row.amount.toLocaleString('en-IN')}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow sx={{ backgroundColor: '#f8fafc', fontWeight: 'bold' }}>
                    <TableCell colSpan={2}><strong>Total Liabilities & Owner Equity</strong></TableCell>
                    <TableCell align="right"><strong>₹{(totalLiabilities + totalEquity).toLocaleString('en-IN')}</strong></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      )}

      {/* Tab 1: Profit & Loss Statement */}
      {tabValue === 1 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
            <Card sx={{ borderLeft: '4px solid #10b981' }}>
              <CardContent>
                <Typography color="text.secondary" variant="body2">Total Operating Revenue</Typography>
                <Typography variant="h4" fontWeight="bold" sx={{ color: '#10b981', mt: 0.5 }}>
                  ₹{totalRevenue.toLocaleString('en-IN')}
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ borderLeft: '4px solid #ef4444' }}>
              <CardContent>
                <Typography color="text.secondary" variant="body2">Total Operating Expenses</Typography>
                <Typography variant="h4" fontWeight="bold" sx={{ color: '#ef4444', mt: 0.5 }}>
                  ₹{totalExpenses.toLocaleString('en-IN')}
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ borderLeft: '4px solid #0284c7' }}>
              <CardContent>
                <Typography color="text.secondary" variant="body2">Net Income (Profit)</Typography>
                <Typography variant="h4" fontWeight="bold" sx={{ color: netIncome >= 0 ? '#0284c7' : '#ef4444', mt: 0.5 }}>
                  ₹{netIncome.toLocaleString('en-IN')}
                </Typography>
              </CardContent>
            </Card>
          </Box>

          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Income / Revenue Statement
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f1f5f9' }}>
                    <TableCell>Code</TableCell>
                    <TableCell>Account Name</TableCell>
                    <TableCell align="right">Amount (₹)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {incomeStatement.revenue.map((row) => (
                    <TableRow key={row.code}>
                      <TableCell><Chip label={row.code} size="small" color="success" variant="outlined" /></TableCell>
                      <TableCell>{row.name}</TableCell>
                      <TableCell align="right">₹{row.amount.toLocaleString('en-IN')}</TableCell>
                    </TableRow>
                  ))}
                  {incomeStatement.expenses.map((row) => (
                    <TableRow key={row.code}>
                      <TableCell><Chip label={row.code} size="small" color="error" variant="outlined" /></TableCell>
                      <TableCell>{row.name}</TableCell>
                      <TableCell align="right">-₹{row.amount.toLocaleString('en-IN')}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow sx={{ backgroundColor: '#f8fafc', fontWeight: 'bold' }}>
                    <TableCell colSpan={2}><strong>Net Profit / (Loss)</strong></TableCell>
                    <TableCell align="right"><strong>₹{netIncome.toLocaleString('en-IN')}</strong></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      )}
    </Box>
  );
}
