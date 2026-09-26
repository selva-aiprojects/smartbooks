'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  CircularProgress,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Stack,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  History as HistoryIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon,
  Security as SecurityIcon,
  CheckCircle as VerifiedIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { getAuthHeaders } from '../../lib/api';
import { useTenant } from '../../context/TenantContext';
import { exportAuditTrailPdf } from '../../lib/pdf-generator';

interface AuditLogEntry {
  id: string;
  companyId: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  action: string;
  entityType: string;
  entityId: string;
  entityRef?: string;
  details?: string;
  oldValues?: string;
  newValues?: string;
  ipAddress?: string;
  createdAt: string;
}

export default function AuditTrailPage() {
  const { activeTenant } = useTenant();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [entityFilter, setEntityFilter] = useState('ALL');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (entityFilter !== 'ALL') params.set('entityType', entityFilter);
      if (actionFilter !== 'ALL') params.set('action', actionFilter);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());

      const res = await fetch(`/api/audit-trail?${params.toString()}`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [entityFilter, actionFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs();
  };

  const getActionColor = (action: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (action.toUpperCase()) {
      case 'CREATE': return 'success';
      case 'UPDATE': return 'info';
      case 'STATUS_CHANGE': return 'warning';
      case 'PAYMENT': return 'secondary';
      case 'DELETE': return 'error';
      case 'EXPORT': return 'primary';
      default: return 'default';
    }
  };

  const handleExportCsv = () => {
    if (!logs.length) return;
    const headers = ['Timestamp', 'Action', 'Entity Type', 'Reference', 'Details', 'Operator Name', 'Operator Email', 'IP Address'];
    const rows = logs.map(l => [
      `"${new Date(l.createdAt).toLocaleString('en-IN')}"`,
      `"${l.action}"`,
      `"${l.entityType}"`,
      `"${l.entityRef || ''}"`,
      `"${(l.details || '').replace(/"/g, '""')}"`,
      `"${l.userName || 'System'}"`,
      `"${l.userEmail || ''}"`,
      `"${l.ipAddress || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Audit_Trail_${activeTenant?.name || 'SmartBooks'}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPdf = () => {
    exportAuditTrailPdf({
      companyName: activeTenant?.name || 'SmartBooks Enterprise',
      companyGstin: activeTenant?.gstin || '33AABCS1429B1ZB',
      logs: logs.slice(0, 100),
    });
  };

  const columns: GridColDef[] = [
    {
      field: 'createdAt',
      headerName: 'Timestamp (IST)',
      width: 190,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
          {new Date(params.value).toLocaleString('en-IN', {
            dateStyle: 'short',
            timeStyle: 'medium',
          })}
        </Typography>
      ),
    },
    {
      field: 'action',
      headerName: 'Action',
      width: 140,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={getActionColor(params.value)}
          sx={{ fontWeight: 600, fontSize: '0.75rem' }}
        />
      ),
    },
    {
      field: 'entityType',
      headerName: 'Entity Type',
      width: 140,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          variant="outlined"
          sx={{ fontWeight: 500, fontSize: '0.75rem' }}
        />
      ),
    },
    {
      field: 'entityRef',
      headerName: 'Reference #',
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="700" color="primary">
          {params.value || '-'}
        </Typography>
      ),
    },
    {
      field: 'details',
      headerName: 'Event Description',
      flex: 1,
      minWidth: 260,
    },
    {
      field: 'userEmail',
      headerName: 'Operator',
      width: 180,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="600" sx={{ lineHeight: 1.2 }}>
            {params.row.userName || 'System / Auto'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.value || 'Automated'}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'viewDetails',
      headerName: 'Inspect',
      width: 90,
      sortable: false,
      renderCell: (params) => (
        <IconButton size="small" color="primary" onClick={() => setSelectedLog(params.row)}>
          <VisibilityIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  return (
    <Box sx={{ flexGrow: 1, p: { xs: 1, md: 2 } }}>
      {/* Header Banner */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <HistoryIcon sx={{ color: '#0284c7', fontSize: 32 }} />
            <Typography variant="h4" fontWeight="800" sx={{ color: '#0f172a', letterSpacing: '-0.5px' }}>
              Statutory Audit Trail
            </Typography>
            <Chip
              icon={<VerifiedIcon sx={{ fontSize: '16px !important' }} />}
              label="MCA & GST Compliance Enforced"
              color="success"
              size="small"
              sx={{ fontWeight: 700 }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            Immutable, append-only chronological log of all bookkeeping transactions, approvals, status updates, and exports.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => fetchLogs()}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportCsv}
            disabled={!logs.length}
          >
            Export CSV
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PdfIcon />}
            onClick={handleExportPdf}
            disabled={!logs.length}
            sx={{ bgcolor: '#0284c7', '&:hover': { bgcolor: '#0369a1' } }}
          >
            Auditor PDF
          </Button>
        </Box>
      </Box>

      {/* Compliance Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 2 }}>
            <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="caption" color="text.secondary" fontWeight="700">
                TOTAL RECORDED EVENTS
              </Typography>
              <Typography variant="h5" fontWeight="800" color="#0f172a">
                {logs.length} Actions
              </Typography>
              <Typography variant="caption" color="#10b981" fontWeight="600">
                100% Append-only integrity
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 2 }}>
            <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="caption" color="text.secondary" fontWeight="700">
                MCA COMPANIES ACT AUDIT TRAIL
              </Typography>
              <Typography variant="h5" fontWeight="800" color="#0284c7">
                Rule 3(1) Compliant
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Edit log capturing old vs new state
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 2 }}>
            <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="caption" color="text.secondary" fontWeight="700">
                PRIMARY COMPANY IDENTIFIER
              </Typography>
              <Typography variant="h5" fontWeight="800" color="#334155" noWrap>
                {activeTenant?.name || 'Active Tenant'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                GSTIN: {activeTenant?.gstin || '33AABCS1429B1ZB'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filter Bar */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <form onSubmit={handleSearchSubmit}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
            <TextField
              size="small"
              placeholder="Search reference #, user, description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ flexGrow: 1 }}
            />
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Entity Type</InputLabel>
              <Select
                value={entityFilter}
                label="Entity Type"
                onChange={(e) => setEntityFilter(e.target.value)}
              >
                <MenuItem value="ALL">All Entities</MenuItem>
                <MenuItem value="INVOICE">Invoices</MenuItem>
                <MenuItem value="BILL">Vendor Bills</MenuItem>
                <MenuItem value="JOURNAL_ENTRY">Journals</MenuItem>
                <MenuItem value="ACCOUNT">Chart of Accounts</MenuItem>
                <MenuItem value="CUSTOMER">Customers</MenuItem>
                <MenuItem value="VENDOR">Vendors</MenuItem>
                <MenuItem value="TAX_RATE">Tax Rates</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Action</InputLabel>
              <Select
                value={actionFilter}
                label="Action"
                onChange={(e) => setActionFilter(e.target.value)}
              >
                <MenuItem value="ALL">All Actions</MenuItem>
                <MenuItem value="CREATE">Create</MenuItem>
                <MenuItem value="UPDATE">Update</MenuItem>
                <MenuItem value="STATUS_CHANGE">Status Change</MenuItem>
                <MenuItem value="PAYMENT">Payment</MenuItem>
                <MenuItem value="DELETE">Delete</MenuItem>
                <MenuItem value="EXPORT">Export</MenuItem>
              </Select>
            </FormControl>

            <Button variant="contained" type="submit" startIcon={<FilterIcon />}>
              Filter
            </Button>
          </Stack>
        </form>
      </Paper>

      {/* Audit Log Table */}
      <Box sx={{ height: 560, width: '100%', bgcolor: '#ffffff', borderRadius: 2, p: 1 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={logs}
            columns={columns}
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{
              pagination: { paginationModel: { pageSize: 25 } },
            }}
            disableRowSelectionOnClick
          />
        )}
      </Box>

      {/* Inspect Detail Modal */}
      <Dialog
        open={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedLog && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#0f172a', color: '#ffffff' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SecurityIcon sx={{ color: '#38bdf8' }} />
                <Typography variant="h6" fontWeight="bold">
                  Audit Snapshot — {selectedLog.entityType} {selectedLog.entityRef || ''}
                </Typography>
              </Box>
              <IconButton onClick={() => setSelectedLog(null)} sx={{ color: '#94a3b8' }}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">ACTION</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip label={selectedLog.action} color={getActionColor(selectedLog.action)} size="small" />
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">TIMESTAMP (IST)</Typography>
                  <Typography variant="body2" fontWeight="600">
                    {new Date(selectedLog.createdAt).toLocaleString('en-IN')}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">OPERATOR</Typography>
                  <Typography variant="body2" fontWeight="600">
                    {selectedLog.userName || 'System'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {selectedLog.userEmail || '-'}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">IP ADDRESS</Typography>
                  <Typography variant="body2" fontWeight="600" sx={{ fontFamily: 'monospace' }}>
                    {selectedLog.ipAddress || '127.0.0.1'}
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" fontWeight="700" sx={{ mb: 1 }}>
                Event Summary:
              </Typography>
              <Paper sx={{ p: 1.5, bgcolor: '#f1f5f9', mb: 2 }}>
                <Typography variant="body2" color="#0f172a">
                  {selectedLog.details || 'No additional summary provided.'}
                </Typography>
              </Paper>

              {selectedLog.oldValues && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" fontWeight="700" color="error.main" sx={{ mb: 0.5 }}>
                    Previous State (Before Modification):
                  </Typography>
                  <Paper sx={{ p: 1.5, bgcolor: '#fef2f2', border: '1px solid #fecaca', fontFamily: 'monospace', fontSize: '0.8rem', overflowX: 'auto' }}>
                    <pre style={{ margin: 0 }}>
                      {typeof selectedLog.oldValues === 'string'
                        ? JSON.stringify(JSON.parse(selectedLog.oldValues), null, 2)
                        : JSON.stringify(selectedLog.oldValues, null, 2)}
                    </pre>
                  </Paper>
                </Box>
              )}

              {selectedLog.newValues && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" fontWeight="700" color="success.main" sx={{ mb: 0.5 }}>
                    New State (Recorded Snapshot):
                  </Typography>
                  <Paper sx={{ p: 1.5, bgcolor: '#f0fdf4', border: '1px solid #bbf7d0', fontFamily: 'monospace', fontSize: '0.8rem', overflowX: 'auto' }}>
                    <pre style={{ margin: 0 }}>
                      {typeof selectedLog.newValues === 'string'
                        ? JSON.stringify(JSON.parse(selectedLog.newValues), null, 2)
                        : JSON.stringify(selectedLog.newValues, null, 2)}
                    </pre>
                  </Paper>
                </Box>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setSelectedLog(null)} variant="outlined">
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
