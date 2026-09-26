'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  Chip,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Stack,
  Divider,
  Snackbar,
  Alert
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  Badge as PayrollIcon,
  PersonAdd as PersonAddIcon,
  PlayArrow as RunIcon,
  PictureAsPdf as PdfIcon,
  CheckCircle as VerifiedIcon,
  People as PeopleIcon,
  ReceiptLong as SlipsIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { getAuthHeaders } from '../../lib/api';
import { useTenant } from '../../context/TenantContext';
import { exportSalarySlipPdf } from '../../lib/pdf-generator';

interface EmployeeRow {
  id: string;
  employeeCode: string;
  name: string;
  email?: string;
  phone?: string;
  designation: string;
  department: string;
  baseSalary: number;
  pan?: string;
  uan?: string;
  bankAccount?: string;
  bankIfsc?: string;
  status: string;
}

interface SalarySlipRow {
  id: string;
  employeeId: string;
  employee: EmployeeRow;
  month: number;
  year: number;
  basicPay: number;
  hra: number;
  allowances: number;
  grossSalary: number;
  pfDeduction: number;
  esiDeduction: number;
  professionalTax: number;
  netSalary: number;
  status: string;
  paymentDate?: string;
}

export default function PayrollPage() {
  const { activeTenant } = useTenant();
  const [tabValue, setTabValue] = useState(0);
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [salarySlips, setSalarySlips] = useState<SalarySlipRow[]>([]);
  const [loading, setLoading] = useState(true);

  // New Employee Modal
  const [openEmployeeModal, setOpenEmployeeModal] = useState(false);
  const [empCode, setEmpCode] = useState('');
  const [empName, setEmpName] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empPhone, setEmpPhone] = useState('');
  const [empDesignation, setEmpDesignation] = useState('Senior Software Engineer');
  const [empDepartment, setEmpDepartment] = useState('Engineering');
  const [empSalary, setEmpSalary] = useState(45000);
  const [empPan, setEmpPan] = useState('');
  const [empUan, setEmpUan] = useState('');
  const [empBankAcc, setEmpBankAcc] = useState('');
  const [empIfsc, setEmpIfsc] = useState('HDFC0001234');
  const [creatingEmp, setCreatingEmp] = useState(false);

  // Run Payroll State
  const [runningPayroll, setRunningPayroll] = useState(false);
  const [runMonth, setRunMonth] = useState(new Date().getMonth() + 1);
  const [runYear, setRunYear] = useState(new Date().getFullYear());

  const [snack, setSnack] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [empRes, slipRes] = await Promise.all([
        fetch('/api/payroll/employees', { headers: getAuthHeaders() }),
        fetch('/api/payroll/run', { headers: getAuthHeaders() }),
      ]);

      if (empRes.ok) {
        const empData = await empRes.json();
        setEmployees(empData || []);
      }
      if (slipRes.ok) {
        const slipData = await slipRes.json();
        setSalarySlips(slipData || []);
      }
    } catch (err) {
      console.error('Failed to load payroll data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingEmp(true);
    try {
      const res = await fetch('/api/payroll/employees', {
        method: 'POST',
        headers: getAuthHeaders(true),
        body: JSON.stringify({
          employeeCode: empCode || `EMP-${Date.now().toString().slice(-4)}`,
          name: empName,
          email: empEmail,
          phone: empPhone,
          designation: empDesignation,
          department: empDepartment,
          baseSalary: empSalary,
          pan: empPan,
          uan: empUan,
          bankAccount: empBankAcc,
          bankIfsc: empIfsc,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSnack(`✅ Employee ${empName} enrolled successfully!`);
        setOpenEmployeeModal(false);
        setEmpName('');
        setEmpCode('');
        await loadData();
      } else {
        alert(data.error || 'Failed to add employee');
      }
    } catch (err: any) {
      alert(err.message || 'Network error');
    } finally {
      setCreatingEmp(false);
    }
  };

  const handleRunPayroll = async () => {
    if (!employees.length) {
      alert('Please add at least one employee before running payroll.');
      return;
    }
    setRunningPayroll(true);
    try {
      const res = await fetch('/api/payroll/run', {
        method: 'POST',
        headers: getAuthHeaders(true),
        body: JSON.stringify({ month: runMonth, year: runYear }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSnack(`✅ Processed payroll for ${data.processedCount} employees. Total Net: ₹${data.totalNet.toLocaleString('en-IN')}`);
        setTabValue(1);
        await loadData();
      } else {
        alert(data.error || 'Failed to execute payroll run');
      }
    } catch (err: any) {
      alert(err.message || 'Network error');
    } finally {
      setRunningPayroll(false);
    }
  };

  const handleDownloadPayslip = (slip: SalarySlipRow) => {
    exportSalarySlipPdf({
      companyName: activeTenant?.name || 'SmartBooks Enterprise Ltd.',
      companyGstin: activeTenant?.gstin || '33AABCS1429B1ZB',
      employee: {
        name: slip.employee?.name || 'Employee',
        employeeCode: slip.employee?.employeeCode || 'EMP-101',
        designation: slip.employee?.designation || 'Staff',
        department: slip.employee?.department || 'Operations',
        pan: slip.employee?.pan,
        uan: slip.employee?.uan,
        bankAccount: slip.employee?.bankAccount,
        bankIfsc: slip.employee?.bankIfsc,
      },
      slip: {
        month: slip.month,
        year: slip.year,
        basicPay: Number(slip.basicPay),
        hra: Number(slip.hra),
        allowances: Number(slip.allowances),
        grossSalary: Number(slip.grossSalary),
        pfDeduction: Number(slip.pfDeduction),
        esiDeduction: Number(slip.esiDeduction),
        professionalTax: Number(slip.professionalTax),
        netSalary: Number(slip.netSalary),
        paymentDate: slip.paymentDate,
      },
    });
  };

  const employeeColumns: GridColDef[] = [
    { field: 'employeeCode', headerName: 'Emp Code', width: 120 },
    {
      field: 'name',
      headerName: 'Employee Name',
      width: 200,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="700">{params.value}</Typography>
          <Typography variant="caption" color="text.secondary">{params.row.email || '-'}</Typography>
        </Box>
      ),
    },
    { field: 'designation', headerName: 'Designation', width: 180 },
    { field: 'department', headerName: 'Department', width: 140 },
    {
      field: 'baseSalary',
      headerName: 'Monthly CTC (₹)',
      width: 140,
      valueFormatter: (value: any) => `₹${Number(value || 0).toLocaleString('en-IN')}`,
    },
    {
      field: 'uan',
      headerName: 'PF UAN',
      width: 140,
      renderCell: (params) => (
        <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
          {params.value || 'Not Configured'}
        </Typography>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 110,
      renderCell: (params) => (
        <Chip label={params.value} size="small" color={params.value === 'Active' ? 'success' : 'default'} />
      ),
    },
  ];

  const slipColumns: GridColDef[] = [
    {
      field: 'period',
      headerName: 'Period',
      width: 120,
      valueGetter: (_, row) => `${row.month}/${row.year}`,
    },
    {
      field: 'employeeName',
      headerName: 'Employee',
      width: 180,
      valueGetter: (_, row) => row.employee?.name || 'N/A',
    },
    {
      field: 'basicPay',
      headerName: 'Basic (₹)',
      width: 120,
      valueFormatter: (value: any) => `₹${Number(value || 0).toLocaleString('en-IN')}`,
    },
    {
      field: 'grossSalary',
      headerName: 'Gross (₹)',
      width: 120,
      valueFormatter: (value: any) => `₹${Number(value || 0).toLocaleString('en-IN')}`,
    },
    {
      field: 'pfDeduction',
      headerName: 'PF (12%)',
      width: 110,
      valueFormatter: (value: any) => `₹${Number(value || 0).toLocaleString('en-IN')}`,
    },
    {
      field: 'netSalary',
      headerName: 'Net Pay (₹)',
      width: 140,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="800" color="primary">
          ₹${Number(params.value || 0).toLocaleString('en-IN')}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'Payslip PDF',
      width: 140,
      sortable: false,
      renderCell: (params) => (
        <Button
          size="small"
          variant="outlined"
          color="primary"
          startIcon={<PdfIcon />}
          onClick={() => handleDownloadPayslip(params.row)}
        >
          Payslip
        </Button>
      ),
    },
  ];

  const totalMonthlyPayroll = employees.reduce((s, e) => s + Number(e.baseSalary || 0), 0);

  return (
    <Box sx={{ flexGrow: 1, p: { xs: 1, md: 2 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <PayrollIcon sx={{ fontSize: 36, color: '#10b981' }} />
            <Typography variant="h4" fontWeight="800" sx={{ color: '#0f172a', letterSpacing: '-0.5px' }}>
              Statutory Payroll & Salary Slips Engine
            </Typography>
            <Chip
              icon={<VerifiedIcon sx={{ fontSize: '16px !important' }} />}
              label="EPF & ESI Compliant"
              color="success"
              size="small"
              sx={{ fontWeight: 700 }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            Manage employee rosters, automated monthly payroll computation (Basic 50%, HRA 40%, EPF 12%, ESI), salary slip generation, and GL journal posting.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadData} disabled={loading}>
            Refresh
          </Button>
          <Button
            variant="outlined"
            startIcon={<PersonAddIcon />}
            onClick={() => setOpenEmployeeModal(true)}
          >
            Add Employee
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={<RunIcon />}
            onClick={handleRunPayroll}
            disabled={runningPayroll || !employees.length}
            sx={{ fontWeight: 700 }}
          >
            {runningPayroll ? 'Processing Payroll...' : `Run Payroll (${runMonth}/${runYear})`}
          </Button>
        </Box>
      </Box>

      {/* Metrics */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 2 }}>
            <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="caption" color="text.secondary" fontWeight="700">ENROLLED EMPLOYEES</Typography>
              <Typography variant="h5" fontWeight="800" color="#0f172a">{employees.length} Active Staff</Typography>
              <Typography variant="caption" color="#10b981" fontWeight="600">Onboarded with PF/UAN</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 2 }}>
            <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="caption" color="text.secondary" fontWeight="700">MONTHLY BASE PAYROLL COMMITMENT</Typography>
              <Typography variant="h5" fontWeight="800" color="#10b981">₹{totalMonthlyPayroll.toLocaleString('en-IN')}</Typography>
              <Typography variant="caption" color="text.secondary">Gross salary before statutory deductions</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 2 }}>
            <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="caption" color="text.secondary" fontWeight="700">ISSUED SALARY PAYSLIPS</Typography>
              <Typography variant="h5" fontWeight="800" color="#0284c7">{salarySlips.length} Vouchers</Typography>
              <Typography variant="caption" color="text.secondary">Auto-posted to GL Account 5020</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 2, borderRadius: 2 }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} indicatorColor="primary" textColor="primary">
          <Tab icon={<PeopleIcon />} iconPosition="start" label={`Employee Directory (${employees.length})`} sx={{ fontWeight: 700 }} />
          <Tab icon={<SlipsIcon />} iconPosition="start" label={`Processed Salary Slips (${salarySlips.length})`} sx={{ fontWeight: 700 }} />
        </Tabs>
      </Paper>

      {/* Table */}
      <Box sx={{ height: 480, width: '100%', bgcolor: '#ffffff', borderRadius: 2, p: 1 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={tabValue === 0 ? employees : salarySlips}
            columns={tabValue === 0 ? employeeColumns : slipColumns}
            pageSizeOptions={[10, 25, 50]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            disableRowSelectionOnClick
          />
        )}
      </Box>

      {/* Modal: Add Employee */}
      <Dialog open={openEmployeeModal} onClose={() => setOpenEmployeeModal(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleCreateEmployee}>
          <DialogTitle sx={{ bgcolor: '#0f172a', color: '#ffffff' }}>Enrol Employee into Payroll</DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Stack spacing={2.5}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    size="small"
                    label="Emp Code"
                    value={empCode}
                    onChange={(e) => setEmpCode(e.target.value)}
                    placeholder="EMP-101"
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={8}>
                  <TextField
                    size="small"
                    label="Full Name"
                    value={empName}
                    onChange={(e) => setEmpName(e.target.value)}
                    fullWidth
                    required
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    size="small"
                    label="Work Email"
                    value={empEmail}
                    onChange={(e) => setEmpEmail(e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    size="small"
                    label="Phone Number"
                    value={empPhone}
                    onChange={(e) => setEmpPhone(e.target.value)}
                    fullWidth
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    size="small"
                    label="Designation"
                    value={empDesignation}
                    onChange={(e) => setEmpDesignation(e.target.value)}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    size="small"
                    label="Department"
                    value={empDepartment}
                    onChange={(e) => setEmpDepartment(e.target.value)}
                    fullWidth
                    required
                  />
                </Grid>
              </Grid>

              <TextField
                size="small"
                label="Monthly CTC Base Salary (₹)"
                type="number"
                value={empSalary}
                onChange={(e) => setEmpSalary(Number(e.target.value))}
                helperText="Basic will be 50%, HRA 40%, and PF 12% computed automatically."
                fullWidth
                required
              />

              <Divider sx={{ my: 1 }}>Statutory Identification</Divider>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    size="small"
                    label="PAN Number"
                    value={empPan}
                    onChange={(e) => setEmpPan(e.target.value.toUpperCase())}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    size="small"
                    label="EPF UAN Number"
                    value={empUan}
                    onChange={(e) => setEmpUan(e.target.value)}
                    fullWidth
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={8}>
                  <TextField
                    size="small"
                    label="Bank Account Number"
                    value={empBankAcc}
                    onChange={(e) => setEmpBankAcc(e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    size="small"
                    label="IFSC Code"
                    value={empIfsc}
                    onChange={(e) => setEmpIfsc(e.target.value.toUpperCase())}
                    fullWidth
                  />
                </Grid>
              </Grid>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenEmployeeModal(false)} variant="outlined">Cancel</Button>
            <Button type="submit" variant="contained" color="success" disabled={creatingEmp} sx={{ fontWeight: 700 }}>
              {creatingEmp ? 'Enrolling...' : 'Enrol Employee'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar open={!!snack} autoHideDuration={4000} onClose={() => setSnack('')}>
        <Alert onClose={() => setSnack('')} severity="success" sx={{ width: '100%', fontWeight: 600 }}>
          {snack}
        </Alert>
      </Snackbar>
    </Box>
  );
}
