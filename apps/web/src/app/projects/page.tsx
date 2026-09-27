'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Tabs,
  Tab,
  Tooltip,
  Divider,
  Alert,
  CircularProgress,
  InputAdornment,
  Menu,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Assessment as PnlIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as ActiveIcon,
  DoneAll as CompletedIcon,
  PauseCircle as OnHoldIcon,
  Archive as ArchiveIcon,
  DateRange as CalendarIcon,
  AccountBalanceWallet as BudgetIcon,
  TrendingUp as RevenueIcon,
  TrendingDown as ExpenseIcon,
  Business as ClientIcon,
  Receipt as InvoiceIcon,
  ReceiptLong as BillIcon,
  FileDownload as ExportIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  ViewModule as GridViewIcon,
  ViewList as TableViewIcon,
} from '@mui/icons-material';
import { getAuthHeaders } from '../../lib/api';

interface CustomerRef {
  id: string;
  name: string;
  email?: string | null;
}

interface ProjectMetrics {
  totalRevenue: number;
  grossBilled: number;
  paidRevenue: number;
  totalExpenses: number;
  billExpenses: number;
  journalExpenses: number;
  netProfit: number;
  profitMargin: number;
  budgetUtilization: number;
  budgetVariance: number;
  invoiceCount: number;
  billCount: number;
}

interface Project {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  budget: number;
  status: 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'ARCHIVED';
  customer?: CustomerRef | null;
  metrics: ProjectMetrics;
}

interface ProjectsSummary {
  totalProjects: number;
  activeProjects: number;
  aggregateRevenue: number;
  aggregateExpenses: number;
  aggregateNetProfit: number;
  aggregateMargin: number;
  aggregateBudget: number;
  aggregateBudgetUtilization: number;
}

interface DetailedPnlData {
  project: {
    id: string;
    code: string;
    name: string;
    description?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    budget: number;
    status: string;
    customer?: CustomerRef | null;
  };
  pnl: {
    revenue: {
      taxableRevenue: number;
      gstCollected: number;
      grossRevenue: number;
      collectedRevenue: number;
      outstandingReceivables: number;
      invoices: Array<{
        id: string;
        number: string;
        date: string;
        taxable: number;
        gst: number;
        total: number;
        status: string;
        customerName: string;
      }>;
    };
    expenses: {
      taxableExpenses: number;
      itcClaimed: number;
      grossExpenses: number;
      paidExpenses: number;
      outstandingPayables: number;
      journalAdjustment: number;
      totalOperatingCost: number;
      byCategory: Record<string, number>;
      bills: Array<{
        id: string;
        number: string;
        date: string;
        taxable: number;
        gst: number;
        total: number;
        status: string;
        vendorName: string;
        items: Array<{ description: string; amount: number; category: string }>;
      }>;
    };
    profitability: {
      netProfit: number;
      profitMargin: number;
      budget: number;
      budgetUtilization: number;
      budgetVariance: number;
      isProfitable: boolean;
      isWithinBudget: boolean;
    };
  };
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [summary, setSummary] = useState<ProjectsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusTab, setStatusTab] = useState('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Customers list for dropdown
  const [customers, setCustomers] = useState<Array<{ id: string; name: string }>>([]);

  // Create / Edit modal state
  const [openModal, setOpenModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCustomerId, setFormCustomerId] = useState('');
  const [formBudget, setFormBudget] = useState('0');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formStatus, setFormStatus] = useState<'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'ARCHIVED'>('ACTIVE');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Detailed P&L Modal State
  const [openPnlModal, setOpenPnlModal] = useState(false);
  const [pnlLoading, setPnlLoading] = useState(false);
  const [pnlData, setPnlData] = useState<DetailedPnlData | null>(null);
  const [pnlTab, setPnlTab] = useState(0);

  // Status context menu
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuTargetProject, setMenuTargetProject] = useState<Project | null>(null);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/projects?status=ALL', { credentials: 'include', headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
        setSummary(data.summary || null);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/invoices/customers', { credentials: 'include', headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setCustomers(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchCustomers();
  }, []);

  const openPnlStatement = async (project: Project) => {
    setPnlLoading(true);
    setOpenPnlModal(true);
    setPnlTab(0);
    try {
      const res = await fetch(`/api/projects/${project.id}`, { credentials: 'include', headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setPnlData(data);
      }
    } catch (err) {
      console.error('Failed to load project P&L:', err);
    } finally {
      setPnlLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingProject(null);
    const year = new Date().getFullYear();
    const nextSeq = projects.length + 1;
    setFormCode(`PRJ-${year}-${String(nextSeq).padStart(3, '0')}`);
    setFormName('');
    setFormDesc('');
    setFormCustomerId('');
    setFormBudget('1000000');
    setFormStartDate(new Date().toISOString().split('T')[0]);
    setFormEndDate(new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0]);
    setFormStatus('ACTIVE');
    setFormError('');
    setOpenModal(true);
  };

  const handleOpenEditModal = (project: Project) => {
    setEditingProject(project);
    setFormCode(project.code);
    setFormName(project.name);
    setFormDesc(project.description || '');
    setFormCustomerId(project.customer?.id || '');
    setFormBudget(String(project.budget));
    setFormStartDate(project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '');
    setFormEndDate(project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '');
    setFormStatus(project.status);
    setFormError('');
    setOpenModal(true);
  };

  const handleSaveProject = async () => {
    if (!formName.trim()) {
      setFormError('Project Name is required');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      const payload = {
        code: formCode.trim(),
        name: formName.trim(),
        description: formDesc.trim(),
        customerId: formCustomerId || null,
        budget: Number(formBudget) || 0,
        startDate: formStartDate || null,
        endDate: formEndDate || null,
        status: formStatus,
      };

      const url = editingProject ? `/api/projects/${editingProject.id}` : '/api/projects';
      const method = editingProject ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to save project');
      }

      setOpenModal(false);
      fetchProjects();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (project: Project, newStatus: 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'ARCHIVED') => {
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchProjects();
      }
    } catch (err) {
      console.error('Failed to change status:', err);
    }
    setMenuAnchor(null);
  };

  const exportPnlToCsv = () => {
    if (!pnlData) return;
    const { project, pnl } = pnlData;
    let csv = `Project P&L Statement - ${project.name} (${project.code})\n`;
    csv += `Client:,"${project.customer?.name || 'N/A'}"\n`;
    csv += `Timeline:,"${project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'} to ${project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A'}"\n`;
    csv += `Status:,"${project.status}"\n\n`;

    csv += `SECTION,ITEM,AMOUNT (INR)\n`;
    csv += `REVENUE,Taxable Invoiced Revenue,${pnl.revenue.taxableRevenue}\n`;
    csv += `REVENUE,GST Collected,${pnl.revenue.gstCollected}\n`;
    csv += `REVENUE,Gross Invoiced Amount,${pnl.revenue.grossRevenue}\n`;
    csv += `REVENUE,Collected from Client,${pnl.revenue.collectedRevenue}\n`;
    csv += `REVENUE,Outstanding Receivables,${pnl.revenue.outstandingReceivables}\n\n`;

    csv += `EXPENSES,Taxable Vendor Bills,${pnl.expenses.taxableExpenses}\n`;
    csv += `EXPENSES,Input Tax Credit (GST),${pnl.expenses.itcClaimed}\n`;
    csv += `EXPENSES,Direct Overhead Adjustments,${pnl.expenses.journalAdjustment}\n`;
    csv += `EXPENSES,Total Operating Cost,${pnl.expenses.totalOperatingCost}\n`;
    csv += `EXPENSES,Paid to Vendors,${pnl.expenses.paidExpenses}\n`;
    csv += `EXPENSES,Outstanding Payables,${pnl.expenses.outstandingPayables}\n\n`;

    csv += `PROFITABILITY,Net Profit / (Loss),${pnl.profitability.netProfit}\n`;
    csv += `PROFITABILITY,Net Profit Margin %,${pnl.profitability.profitMargin.toFixed(2)}%\n`;
    csv += `BUDGET,Total Allocated Budget,${pnl.profitability.budget}\n`;
    csv += `BUDGET,Budget Utilization %,${pnl.profitability.budgetUtilization.toFixed(2)}%\n`;
    csv += `BUDGET,Variance (Budget - Actual Cost),${pnl.profitability.budgetVariance}\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${project.code}_PNL_Statement.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.code.toLowerCase().includes(search.toLowerCase()) ||
        (p.customer?.name || '').toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusTab === 'ALL' || p.status === statusTab;
      return matchesSearch && matchesStatus;
    });
  }, [projects, search, statusTab]);

  const fmt = (n: number) =>
    '₹' + Math.round(n).toLocaleString('en-IN');

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Chip icon={<ActiveIcon sx={{ fontSize: '16px !important' }} />} label="Active" color="success" size="small" variant="filled" sx={{ fontWeight: 600 }} />;
      case 'COMPLETED':
        return <Chip icon={<CompletedIcon sx={{ fontSize: '16px !important' }} />} label="Completed" color="info" size="small" variant="filled" sx={{ fontWeight: 600 }} />;
      case 'ON_HOLD':
        return <Chip icon={<OnHoldIcon sx={{ fontSize: '16px !important' }} />} label="On Hold" color="warning" size="small" variant="filled" sx={{ fontWeight: 600 }} />;
      case 'ARCHIVED':
        return <Chip icon={<ArchiveIcon sx={{ fontSize: '16px !important' }} />} label="Archived" size="small" variant="outlined" sx={{ fontWeight: 600 }} />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  const getBudgetProgressColor = (utilization: number) => {
    if (utilization > 100) return 'error';
    if (utilization >= 80) return 'warning';
    return 'success';
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1600, mx: 'auto' }}>
      {/* Page Title & Actions */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 2, mb: 3 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.5px' }}>
              Projects & Cost Centers
            </Typography>
            <Chip label="FY 2026-27" color="primary" size="small" sx={{ fontWeight: 700 }} />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Track project-level P&L, budget burn rate, client billings, and multi-program margins under your unified entity.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchProjects}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateModal}
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              fontWeight: 700,
              boxShadow: '0 4px 14px rgba(59, 130, 246, 0.35)',
            }}
          >
            New Project
          </Button>
        </Box>
      </Box>

      {/* KPI Overview Summary Cards */}
      {summary && (
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
                    Active Programs
                  </Typography>
                  <ActiveIcon color="success" fontSize="small" />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, color: 'text.primary' }}>
                  {summary.activeProjects} <Typography component="span" variant="body2" color="text.secondary">/ {summary.totalProjects} Total</Typography>
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  Budget: {fmt(summary.aggregateBudget)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
                    Total Project Revenue
                  </Typography>
                  <RevenueIcon color="primary" fontSize="small" />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, color: 'primary.main' }}>
                  {fmt(summary.aggregateRevenue)}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  Billed across all tagged customer invoices
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
                    Direct Costs & Bills
                  </Typography>
                  <ExpenseIcon color="warning" fontSize="small" />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, color: 'warning.dark' }}>
                  {fmt(summary.aggregateExpenses)}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">Budget Burn</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                      {summary.aggregateBudgetUtilization.toFixed(1)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(100, summary.aggregateBudgetUtilization)}
                    color={getBudgetProgressColor(summary.aggregateBudgetUtilization)}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
                    Net Project Margin
                  </Typography>
                  <PnlIcon color={summary.aggregateNetProfit >= 0 ? 'success' : 'error'} fontSize="small" />
                </Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    mt: 1,
                    color: summary.aggregateNetProfit >= 0 ? 'success.main' : 'error.main',
                  }}
                >
                  {fmt(summary.aggregateNetProfit)}
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, color: summary.aggregateNetProfit >= 0 ? 'success.dark' : 'error.dark', display: 'block', mt: 0.5 }}>
                  {summary.aggregateMargin >= 0 ? '+' : ''}{summary.aggregateMargin.toFixed(1)}% Average ROI Margin
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filter and Control Bar */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { md: 'center' }, gap: 2 }}>
          {/* Status Tabs */}
          <Tabs
            value={statusTab}
            onChange={(_, val) => setStatusTab(val)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ minHeight: 40 }}
          >
            <Tab label={`All (${projects.length})`} value="ALL" sx={{ textTransform: 'none', fontWeight: 600, minHeight: 40 }} />
            <Tab label={`Active (${projects.filter((p) => p.status === 'ACTIVE').length})`} value="ACTIVE" sx={{ textTransform: 'none', fontWeight: 600, minHeight: 40 }} />
            <Tab label={`On Hold (${projects.filter((p) => p.status === 'ON_HOLD').length})`} value="ON_HOLD" sx={{ textTransform: 'none', fontWeight: 600, minHeight: 40 }} />
            <Tab label={`Completed (${projects.filter((p) => p.status === 'COMPLETED').length})`} value="COMPLETED" sx={{ textTransform: 'none', fontWeight: 600, minHeight: 40 }} />
            <Tab label={`Archived (${projects.filter((p) => p.status === 'ARCHIVED').length})`} value="ARCHIVED" sx={{ textTransform: 'none', fontWeight: 600, minHeight: 40 }} />
          </Tabs>

          {/* Search & View Toggle */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <TextField
              size="small"
              placeholder="Search by code, project or client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ width: { xs: '100%', sm: 280 } }}
            />
            <Box sx={{ display: 'flex', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
              <IconButton
                size="small"
                color={viewMode === 'grid' ? 'primary' : 'default'}
                onClick={() => setViewMode('grid')}
                title="Grid View"
              >
                <GridViewIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                color={viewMode === 'table' ? 'primary' : 'default'}
                onClick={() => setViewMode('table')}
                title="Table View"
              >
                <TableViewIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Projects List View */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : filteredProjects.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: '1px dashed', borderColor: 'divider' }}>
          <BudgetIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>No projects found</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 450, mx: 'auto', mt: 1, mb: 3 }}>
            {search || statusTab !== 'ALL'
              ? 'Try changing your search keywords or status filter.'
              : 'Create your first project or cost-center to begin tracking timeline-level revenues, expenses, and dedicated P&L.'}
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreateModal} sx={{ borderRadius: 2 }}>
            Create Project
          </Button>
        </Paper>
      ) : viewMode === 'grid' ? (
        <Grid container spacing={2.5}>
          {filteredProjects.map((p) => {
            const util = p.metrics.budgetUtilization;
            const isProfitable = p.metrics.netProfit >= 0;

            return (
              <Grid item xs={12} sm={6} lg={4} key={p.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 2.5, flexGrow: 1 }}>
                    {/* Header: Code & Status */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={p.code}
                          size="small"
                          sx={{ fontWeight: 800, fontFamily: 'monospace', letterSpacing: '0.5px' }}
                        />
                        {getStatusChip(p.status)}
                      </Box>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          setMenuAnchor(e.currentTarget);
                          setMenuTargetProject(p);
                        }}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Box>

                    {/* Name & Client */}
                    <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.3, mb: 0.5, color: 'text.primary' }}>
                      {p.name}
                    </Typography>
                    {p.customer ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: 'text.secondary', mb: 1.5 }}>
                        <ClientIcon sx={{ fontSize: 16 }} />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {p.customer.name}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.disabled" sx={{ mb: 1.5 }}>
                        Internal Entity Project
                      </Typography>
                    )}

                    {p.description && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mb: 2,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          fontSize: '0.85rem',
                        }}
                      >
                        {p.description}
                      </Typography>
                    )}

                    {/* Timeline dates */}
                    {(p.startDate || p.endDate) && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 2, color: 'text.secondary', fontSize: '0.8rem' }}>
                        <CalendarIcon sx={{ fontSize: 15 }} />
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          {p.startDate ? new Date(p.startDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'Start'}
                          {' — '}
                          {p.endDate ? new Date(p.endDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'Ongoing'}
                        </Typography>
                      </Box>
                    )}

                    {/* Budget Utilization Bar */}
                    {p.budget > 0 && (
                      <Box sx={{ mb: 2, p: 1.5, bgcolor: 'background.default', borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                          <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                            Budget: {fmt(p.budget)}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 700,
                              color: util > 100 ? 'error.main' : util >= 80 ? 'warning.dark' : 'text.primary',
                            }}
                          >
                            {fmt(p.metrics.totalExpenses)} ({util.toFixed(0)}%)
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(100, util)}
                          color={getBudgetProgressColor(util)}
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                      </Box>
                    )}

                    {/* P&L Scorecard Mini-Grid */}
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr',
                        gap: 1,
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: 'background.default',
                        border: '1px solid',
                        borderColor: 'divider',
                        textAlign: 'center',
                      }}
                    >
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.72rem' }}>
                          Revenue ({p.metrics.invoiceCount})
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main', mt: 0.2 }}>
                          {fmt(p.metrics.totalRevenue)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.72rem' }}>
                          Expenses ({p.metrics.billCount})
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'warning.dark', mt: 0.2 }}>
                          {fmt(p.metrics.totalExpenses)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.72rem' }}>
                          Net Profit
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 800,
                            color: isProfitable ? 'success.main' : 'error.main',
                            mt: 0.2,
                          }}
                        >
                          {fmt(p.metrics.netProfit)}
                        </Typography>
                        <Typography variant="caption" sx={{ fontSize: '0.68rem', color: isProfitable ? 'success.dark' : 'error.dark' }}>
                          {p.metrics.profitMargin.toFixed(0)}% Margin
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>

                  <Divider />

                  <CardActions sx={{ p: 1.5, justifyContent: 'space-between' }}>
                    <Button
                      size="small"
                      startIcon={<PnlIcon />}
                      variant="outlined"
                      color="primary"
                      onClick={() => openPnlStatement(p)}
                      sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
                    >
                      View P&L
                    </Button>
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => handleOpenEditModal(p)}
                      sx={{ textTransform: 'none', color: 'text.secondary' }}
                    >
                      Edit
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        /* Table View */
        <Paper sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
          <Table>
            <TableHead sx={{ bgcolor: 'background.default' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Code</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Project Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Client</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Budget</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Invoiced Revenue</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Direct Costs</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Net Profit</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Margin %</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProjects.map((p) => {
                const isProfitable = p.metrics.netProfit >= 0;
                return (
                  <TableRow key={p.id} hover>
                    <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700 }}>{p.code}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{p.name}</TableCell>
                    <TableCell>{p.customer?.name || <Typography variant="caption" color="text.secondary">Internal</Typography>}</TableCell>
                    <TableCell>{getStatusChip(p.status)}</TableCell>
                    <TableCell align="right">{fmt(p.budget)}</TableCell>
                    <TableCell align="right" sx={{ color: 'primary.main', fontWeight: 600 }}>{fmt(p.metrics.totalRevenue)}</TableCell>
                    <TableCell align="right" sx={{ color: 'warning.dark', fontWeight: 600 }}>{fmt(p.metrics.totalExpenses)}</TableCell>
                    <TableCell align="right" sx={{ color: isProfitable ? 'success.main' : 'error.main', fontWeight: 700 }}>
                      {fmt(p.metrics.netProfit)}
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        label={`${p.metrics.profitMargin.toFixed(1)}%`}
                        size="small"
                        color={isProfitable ? 'success' : 'error'}
                        variant="outlined"
                        sx={{ fontWeight: 700 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<PnlIcon />}
                          onClick={() => openPnlStatement(p)}
                          sx={{ textTransform: 'none', borderRadius: 1.5, py: 0.3 }}
                        >
                          P&L
                        </Button>
                        <IconButton size="small" onClick={() => handleOpenEditModal(p)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Paper>
      )}

      {/* Project Status Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem onClick={() => menuTargetProject && handleUpdateStatus(menuTargetProject, 'ACTIVE')}>
          <ActiveIcon fontSize="small" color="success" sx={{ mr: 1 }} /> Set to Active
        </MenuItem>
        <MenuItem onClick={() => menuTargetProject && handleUpdateStatus(menuTargetProject, 'ON_HOLD')}>
          <OnHoldIcon fontSize="small" color="warning" sx={{ mr: 1 }} /> Set to On Hold
        </MenuItem>
        <MenuItem onClick={() => menuTargetProject && handleUpdateStatus(menuTargetProject, 'COMPLETED')}>
          <CompletedIcon fontSize="small" color="info" sx={{ mr: 1 }} /> Mark as Completed
        </MenuItem>
        <MenuItem onClick={() => menuTargetProject && handleUpdateStatus(menuTargetProject, 'ARCHIVED')}>
          <ArchiveIcon fontSize="small" sx={{ mr: 1 }} /> Archive Project
        </MenuItem>
      </Menu>

      {/* Detailed P&L Statement Dialog */}
      <Dialog
        open={openPnlModal}
        onClose={() => setOpenPnlModal(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, minHeight: '80vh' } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', pb: 1 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                {pnlData?.project.name || 'Project P&L Statement'}
              </Typography>
              {pnlData && <Chip label={pnlData.project.code} size="small" sx={{ fontWeight: 700 }} />}
              {pnlData && getStatusChip(pnlData.project.status)}
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Client: <strong>{pnlData?.project.customer?.name || 'Internal'}</strong>
              {pnlData?.project.startDate && ` · Duration: ${new Date(pnlData.project.startDate).toLocaleDateString()} to ${pnlData.project.endDate ? new Date(pnlData.project.endDate).toLocaleDateString() : 'Ongoing'}`}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<ExportIcon />}
              onClick={exportPnlToCsv}
              sx={{ textTransform: 'none', borderRadius: 2 }}
            >
              Export CSV
            </Button>
            <IconButton onClick={() => setOpenPnlModal(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ p: 3 }}>
          {pnlLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
              <CircularProgress />
            </Box>
          ) : !pnlData ? (
            <Alert severity="error">Failed to load project P&L statement.</Alert>
          ) : (
            <Box>
              {/* Executive P&L Scorecard Cards */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={3}>
                  <Paper sx={{ p: 2, borderRadius: 2.5, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
                      Billed Revenue (ex-GST)
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5, color: 'primary.main' }}>
                      {fmt(pnlData.pnl.revenue.taxableRevenue)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Gross: {fmt(pnlData.pnl.revenue.grossRevenue)} (Collected: {fmt(pnlData.pnl.revenue.collectedRevenue)})
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={3}>
                  <Paper sx={{ p: 2, borderRadius: 2.5, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
                      Direct Costs (ex-GST)
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5, color: 'warning.dark' }}>
                      {fmt(pnlData.pnl.expenses.totalOperatingCost)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Paid: {fmt(pnlData.pnl.expenses.paidExpenses)} | Payable: {fmt(pnlData.pnl.expenses.outstandingPayables)}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={3}>
                  <Paper sx={{ p: 2, borderRadius: 2.5, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
                      Net Project Profit
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 800,
                        mt: 0.5,
                        color: pnlData.pnl.profitability.isProfitable ? 'success.main' : 'error.main',
                      }}
                    >
                      {fmt(pnlData.pnl.profitability.netProfit)}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 700, color: pnlData.pnl.profitability.isProfitable ? 'success.dark' : 'error.dark' }}
                    >
                      {pnlData.pnl.profitability.profitMargin.toFixed(1)}% Operating Margin
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={3}>
                  <Paper sx={{ p: 2, borderRadius: 2.5, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
                      Budget Variance
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 800,
                        mt: 0.5,
                        color: pnlData.pnl.profitability.isWithinBudget ? 'success.main' : 'error.main',
                      }}
                    >
                      {pnlData.pnl.profitability.budgetVariance >= 0 ? '+' : ''}{fmt(pnlData.pnl.profitability.budgetVariance)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {pnlData.pnl.profitability.budgetUtilization.toFixed(0)}% of {fmt(pnlData.pnl.profitability.budget)} budget
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* Tabs for Statement vs Line Items */}
              <Tabs value={pnlTab} onChange={(_, val) => setPnlTab(val)} sx={{ borderBottom: 1, borderColor: 'divider', mb: 2.5 }}>
                <Tab label="P&L Financial Statement" sx={{ textTransform: 'none', fontWeight: 700 }} />
                <Tab label={`Tagged Invoices (${pnlData.pnl.revenue.invoices.length})`} sx={{ textTransform: 'none', fontWeight: 700 }} />
                <Tab label={`Tagged Vendor Bills (${pnlData.pnl.expenses.bills.length})`} sx={{ textTransform: 'none', fontWeight: 700 }} />
                <Tab label="Cost by Category" sx={{ textTransform: 'none', fontWeight: 700 }} />
              </Tabs>

              {/* Tab 0: Formal Income Statement */}
              {pnlTab === 0 && (
                <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                    Statement of Profit and Loss for Project {pnlData.project.code}
                  </Typography>

                  <Table size="small">
                    <TableHead sx={{ bgcolor: 'background.default' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Accounting Head / Particulars</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>Taxable Amount (₹)</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>GST / Tax (₹)</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>Total (₹)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {/* Revenue Section */}
                      <TableRow sx={{ bgcolor: 'rgba(59, 130, 246, 0.04)' }}>
                        <TableCell colSpan={4} sx={{ fontWeight: 800, color: 'primary.main' }}>
                          I. OPERATING REVENUE & BILLINGS
                        </TableCell>
                      </TableRow>
                      {pnlData.pnl.revenue.invoices.map((inv) => (
                        <TableRow key={inv.id} hover>
                          <TableCell sx={{ pl: 4 }}>
                            Invoice #{inv.number} — {inv.customerName} ({new Date(inv.date).toLocaleDateString()})
                          </TableCell>
                          <TableCell align="right">{fmt(inv.taxable)}</TableCell>
                          <TableCell align="right">{fmt(inv.gst)}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>{fmt(inv.total)}</TableCell>
                        </TableRow>
                      ))}
                      {pnlData.pnl.revenue.invoices.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} sx={{ pl: 4, color: 'text.secondary' }}>No customer invoices billed yet.</TableCell>
                        </TableRow>
                      )}
                      <TableRow sx={{ bgcolor: 'background.default' }}>
                        <TableCell sx={{ fontWeight: 800 }}>Total Revenue (A)</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 800 }}>{fmt(pnlData.pnl.revenue.taxableRevenue)}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 800 }}>{fmt(pnlData.pnl.revenue.gstCollected)}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 800, color: 'primary.main' }}>{fmt(pnlData.pnl.revenue.grossRevenue)}</TableCell>
                      </TableRow>

                      {/* Expenses Section */}
                      <TableRow sx={{ bgcolor: 'rgba(234, 88, 12, 0.04)' }}>
                        <TableCell colSpan={4} sx={{ fontWeight: 800, color: 'warning.dark' }}>
                          II. DIRECT OPERATING COSTS & SUB-CONTRACTOR EXPENSES
                        </TableCell>
                      </TableRow>
                      {pnlData.pnl.expenses.bills.map((b) => (
                        <TableRow key={b.id} hover>
                          <TableCell sx={{ pl: 4 }}>
                            Bill #{b.number} — {b.vendorName} ({new Date(b.date).toLocaleDateString()})
                          </TableCell>
                          <TableCell align="right">{fmt(b.taxable)}</TableCell>
                          <TableCell align="right">{fmt(b.gst)}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>{fmt(b.total)}</TableCell>
                        </TableRow>
                      ))}
                      {pnlData.pnl.expenses.bills.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} sx={{ pl: 4, color: 'text.secondary' }}>No direct vendor bills tagged yet.</TableCell>
                        </TableRow>
                      )}
                      {pnlData.pnl.expenses.journalAdjustment > 0 && (
                        <TableRow hover>
                          <TableCell sx={{ pl: 4 }}>Direct Journal Cost Adjustments / Allocations</TableCell>
                          <TableCell align="right">{fmt(pnlData.pnl.expenses.journalAdjustment)}</TableCell>
                          <TableCell align="right">₹0</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>{fmt(pnlData.pnl.expenses.journalAdjustment)}</TableCell>
                        </TableRow>
                      )}
                      <TableRow sx={{ bgcolor: 'background.default' }}>
                        <TableCell sx={{ fontWeight: 800 }}>Total Operating Costs (B)</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 800 }}>{fmt(pnlData.pnl.expenses.totalOperatingCost)}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 800 }}>{fmt(pnlData.pnl.expenses.itcClaimed)}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 800, color: 'warning.dark' }}>{fmt(pnlData.pnl.expenses.grossExpenses)}</TableCell>
                      </TableRow>

                      {/* Net Margin Row */}
                      <TableRow sx={{ bgcolor: pnlData.pnl.profitability.isProfitable ? 'rgba(34, 197, 94, 0.08)' : 'rgba(239, 68, 68, 0.08)' }}>
                        <TableCell sx={{ fontWeight: 900, fontSize: '1.05rem', color: pnlData.pnl.profitability.isProfitable ? 'success.dark' : 'error.dark' }}>
                          III. NET PROJECT PROFIT / (LOSS) (A - B)
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 900, fontSize: '1.05rem', color: pnlData.pnl.profitability.isProfitable ? 'success.dark' : 'error.dark' }}>
                          {fmt(pnlData.pnl.profitability.netProfit)}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>
                          GST Net: {fmt(pnlData.pnl.revenue.gstCollected - pnlData.pnl.expenses.itcClaimed)}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 900, fontSize: '1.05rem', color: pnlData.pnl.profitability.isProfitable ? 'success.dark' : 'error.dark' }}>
                          {pnlData.pnl.profitability.profitMargin.toFixed(1)}% Margin
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Paper>
              )}

              {/* Tab 1: Invoices Drilldown */}
              {pnlTab === 1 && (
                <Paper sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: 'background.default' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Invoice #</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Issue Date</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>Taxable (₹)</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>GST (₹)</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>Total (₹)</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700 }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pnlData.pnl.revenue.invoices.map((inv) => (
                        <TableRow key={inv.id} hover>
                          <TableCell sx={{ fontWeight: 700 }}>{inv.number}</TableCell>
                          <TableCell>{inv.customerName}</TableCell>
                          <TableCell>{new Date(inv.date).toLocaleDateString()}</TableCell>
                          <TableCell align="right">{fmt(inv.taxable)}</TableCell>
                          <TableCell align="right">{fmt(inv.gst)}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700, color: 'primary.main' }}>{fmt(inv.total)}</TableCell>
                          <TableCell align="center">
                            <Chip label={inv.status} size="small" color={inv.status === 'Paid' ? 'success' : 'default'} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Paper>
              )}

              {/* Tab 2: Vendor Bills Drilldown */}
              {pnlTab === 2 && (
                <Paper sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: 'background.default' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Bill #</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Vendor</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Bill Date</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Items / Scope</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>Taxable (₹)</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>GST (₹)</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>Total (₹)</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700 }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pnlData.pnl.expenses.bills.map((b) => (
                        <TableRow key={b.id} hover>
                          <TableCell sx={{ fontWeight: 700 }}>{b.number}</TableCell>
                          <TableCell>{b.vendorName}</TableCell>
                          <TableCell>{new Date(b.date).toLocaleDateString()}</TableCell>
                          <TableCell>{b.items.map((i) => i.description).join(', ') || 'Direct Cost'}</TableCell>
                          <TableCell align="right">{fmt(b.taxable)}</TableCell>
                          <TableCell align="right">{fmt(b.gst)}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700, color: 'warning.dark' }}>{fmt(b.total)}</TableCell>
                          <TableCell align="center">
                            <Chip label={b.status} size="small" color={b.status === 'Paid' ? 'success' : 'warning'} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Paper>
              )}

              {/* Tab 3: Cost by Category */}
              {pnlTab === 3 && (
                <Grid container spacing={2}>
                  {Object.entries(pnlData.pnl.expenses.byCategory).map(([cat, amount]) => {
                    const pct = pnlData.pnl.expenses.totalOperatingCost > 0
                      ? (amount / pnlData.pnl.expenses.totalOperatingCost) * 100
                      : 0;

                    return (
                      <Grid item xs={12} sm={6} md={4} key={cat}>
                        <Paper sx={{ p: 2.5, borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}>
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                            {cat}
                          </Typography>
                          <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5, color: 'text.primary' }}>
                            {fmt(amount)}
                          </Typography>
                          <Box sx={{ mt: 1.5 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="caption" color="text.secondary">Share of Direct Costs</Typography>
                              <Typography variant="caption" sx={{ fontWeight: 700 }}>{pct.toFixed(1)}%</Typography>
                            </Box>
                            <LinearProgress variant="determinate" value={pct} sx={{ height: 6, borderRadius: 3 }} />
                          </Box>
                        </Paper>
                      </Grid>
                    );
                  })}
                  {Object.keys(pnlData.pnl.expenses.byCategory).length === 0 && (
                    <Grid item xs={12}>
                      <Typography color="text.secondary" sx={{ p: 3, textAlign: 'center' }}>
                        No categorized expense lines found for this project.
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenPnlModal(false)} variant="contained" sx={{ borderRadius: 2 }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create / Edit Project Modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>
          {editingProject ? 'Edit Project / Cost Center' : 'Create New Project / Cost Center'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          {formError && <Alert severity="error">{formError}</Alert>}

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Project Code"
                value={formCode}
                onChange={(e) => setFormCode(e.target.value)}
                placeholder="e.g. PRJ-2026-001"
                fullWidth
                size="small"
                helperText="Unique internal reference"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={formStatus}
                  label="Status"
                  onChange={(e) => setFormStatus(e.target.value as any)}
                >
                  <MenuItem value="ACTIVE">Active</MenuItem>
                  <MenuItem value="ON_HOLD">On Hold</MenuItem>
                  <MenuItem value="COMPLETED">Completed</MenuItem>
                  <MenuItem value="ARCHIVED">Archived</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <TextField
            label="Project / Program Name"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="e.g. Govt Smart Metering Infrastructure"
            fullWidth
            required
            size="small"
          />

          <FormControl fullWidth size="small">
            <InputLabel>Linked Customer / Client</InputLabel>
            <Select
              value={formCustomerId}
              label="Linked Customer / Client"
              onChange={(e) => setFormCustomerId(e.target.value)}
            >
              <MenuItem value="">
                <em>None (Internal Project)</em>
              </MenuItem>
              {customers.map((c) => (
                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Total Allocated Budget (₹)"
            type="number"
            value={formBudget}
            onChange={(e) => setFormBudget(e.target.value)}
            placeholder="5000000"
            fullWidth
            size="small"
            InputProps={{
              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
            }}
          />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Start Date"
                type="date"
                value={formStartDate}
                onChange={(e) => setFormStartDate(e.target.value)}
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Target End Date"
                type="date"
                value={formEndDate}
                onChange={(e) => setFormEndDate(e.target.value)}
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>

          <TextField
            label="Description / Scope of Work"
            value={formDesc}
            onChange={(e) => setFormDesc(e.target.value)}
            placeholder="Key deliverables, timeline milestones, and billing structure..."
            fullWidth
            multiline
            rows={3}
            size="small"
          />
        </DialogContent>

        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenModal(false)} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveProject}
            variant="contained"
            disabled={saving}
            sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700 }}
          >
            {saving ? 'Saving...' : editingProject ? 'Save Changes' : 'Create Project'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
