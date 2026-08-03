'use client';

import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Chip, 
  Stack, 
  Grid, 
  Button, 
  Divider 
} from '@mui/material';
import { 
  CheckCircle as CheckIcon, 
  AccessTime as PendingIcon, 
  Upcoming as UpcomingIcon, 
  ArrowBack as ArrowBackIcon,
  Psychology as AIIcon,
  Smartphone as MobileIcon,
  AccountBalance as BankIcon,
  ReceiptLong as GSTIcon,
  WhatsApp as WhatsAppIcon,
  Payment as PaymentIcon
} from '@mui/icons-material';
import Link from 'next/link';

export default function ProductRoadmapPage() {
  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#f8fafc', py: 6 }}>
      <Container maxWidth="lg">
        {/* Navigation Bar */}
        <Box sx={{ mb: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button 
            component={Link} 
            href="/" 
            startIcon={<ArrowBackIcon />} 
            sx={{ color: '#94a3b8', textTransform: 'none', fontWeight: 600 }}
          >
            Back to Home
          </Button>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box component="img" src="/logo-icon-badge.png" alt="SmartBooks Logo" sx={{ width: 36, height: 36, borderRadius: 2 }} />
            <Typography variant="h6" fontWeight="800" color="#ffffff">
              SmartBooks Public Roadmap
            </Typography>
          </Box>

          <Button 
            component={Link} 
            href="/dashboard" 
            variant="contained" 
            sx={{ bgcolor: '#0284c7', '&:hover': { bgcolor: '#0369a1' }, textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
          >
            Explore Live Demo
          </Button>
        </Box>

        {/* Page Header */}
        <Box sx={{ textAlign: 'center', maxWidth: 750, mx: 'auto', mb: 8 }}>
          <Chip label="TRANSPARENT PRODUCT EXECUTION" color="primary" size="small" sx={{ fontWeight: 800, mb: 2 }} />
          <Typography variant="h3" fontWeight="800" color="#ffffff" sx={{ mb: 2, letterSpacing: '-0.5px' }}>
            Building the Future of Autonomous Accounting
          </Typography>
          <Typography variant="body1" color="#94a3b8">
            Explore our shipped capabilities, active Q3 beta features, and upcoming Q4 engineering milestones.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* Column 1: Live Now (Shipped) */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 4, borderRadius: 4, bgcolor: '#1e293b', border: '1px solid #10b981', height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <CheckIcon sx={{ color: '#10b981', fontSize: 28 }} />
                <Box>
                  <Typography variant="h6" fontWeight="800" color="#ffffff">Live Now</Typography>
                  <Typography variant="caption" color="#10b981" fontWeight="700">SHIPPED & PRODUCTION READY</Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 3, borderColor: '#334155' }} />

              <Stack spacing={2.5}>
                {[
                  { title: '100% Autonomous AI Journaling', desc: 'Auto-maps Chart of Accounts & creates balanced debit/credit journals in 4.2 sec.' },
                  { title: 'AI Receipt OCR Vision Scanner', desc: 'Ingests bulk PDF & photo supplier bills with automatic line-item parsing.' },
                  { title: 'GST Mismatch & ITC Audit Engine', desc: 'Audits GSTR-2B vs vendor bills to recover unclaimed Input Tax Credit.' },
                  { title: 'AI Duplicate Payment Shield', desc: 'Blocks duplicate vendor invoice numbers & double-billed line items.' },
                  { title: '10-Metric Financial Dashboard', desc: 'Today’s Collections, GST Due, Cash Position, Aging & Top 10 Customers.' },
                  { title: '1-Click Bank Reconciliation', desc: 'CSV bank feed importer with automated transaction matching.' }
                ].map((item, i) => (
                  <Box key={i} sx={{ p: 2, borderRadius: 2, bgcolor: '#0f172a', border: '1px solid #334155' }}>
                    <Typography variant="subtitle2" fontWeight="700" color="#f8fafc" sx={{ mb: 0.5 }}>{item.title}</Typography>
                    <Typography variant="body2" color="#94a3b8" fontSize={13}>{item.desc}</Typography>
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Grid>

          {/* Column 2: In Active Beta (Q3 2026) */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 4, borderRadius: 4, bgcolor: '#1e293b', border: '1px solid #38bdf8', height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <PendingIcon sx={{ color: '#38bdf8', fontSize: 28 }} />
                <Box>
                  <Typography variant="h6" fontWeight="800" color="#ffffff">In Active Beta</Typography>
                  <Typography variant="caption" color="#38bdf8" fontWeight="700">Q3 2026 RELEASE CANDIDATES</Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 3, borderColor: '#334155' }} />

              <Stack spacing={2.5}>
                {[
                  { title: 'WhatsApp Invoice & Reminders', desc: 'Send automated invoice PDFs and payment collection links via WhatsApp Business API.', icon: <WhatsAppIcon sx={{ color: '#25D366', fontSize: 20 }} /> },
                  { title: 'Razorpay & UPI Direct Payment Links', desc: 'Embed 1-click UPI & Instant Card payment links directly inside PDF customer invoices.', icon: <PaymentIcon sx={{ color: '#38bdf8', fontSize: 20 }} /> },
                  { title: 'Mobile Progressive Web App (PWA)', desc: 'Full mobile-optimized experience with camera receipt uploads on iOS & Android.', icon: <MobileIcon sx={{ color: '#8b5cf6', fontSize: 20 }} /> },
                  { title: 'Multi-Tenant Company Switcher', desc: 'Seamlessly switch between multiple business entities from a single unified header.', icon: <AIIcon sx={{ color: '#f59e0b', fontSize: 20 }} /> }
                ].map((item, i) => (
                  <Box key={i} sx={{ p: 2, borderRadius: 2, bgcolor: '#0f172a', border: '1px solid #334155' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      {item.icon}
                      <Typography variant="subtitle2" fontWeight="700" color="#f8fafc">{item.title}</Typography>
                    </Box>
                    <Typography variant="body2" color="#94a3b8" fontSize={13}>{item.desc}</Typography>
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Grid>

          {/* Column 3: Coming Soon (Q4 2026) */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 4, borderRadius: 4, bgcolor: '#1e293b', border: '1px solid #8b5cf6', height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <UpcomingIcon sx={{ color: '#8b5cf6', fontSize: 28 }} />
                <Box>
                  <Typography variant="h6" fontWeight="800" color="#ffffff">Coming Soon</Typography>
                  <Typography variant="caption" color="#8b5cf6" fontWeight="700">Q4 2026 MILESTONES</Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 3, borderColor: '#334155' }} />

              <Stack spacing={2.5}>
                {[
                  { title: 'Automated GST Portal E-Filing', desc: 'Direct API filing to GST Network (GSTN) for GSTR-1 and GSTR-3B with 1-click tax clearance.', icon: <GSTIcon sx={{ color: '#ec4899', fontSize: 20 }} /> },
                  { title: 'Open Banking Direct Bank Feeds', desc: 'Real-time automated transaction sync with ICICI, HDFC, Axis, and RazorpayX APIs.', icon: <BankIcon sx={{ color: '#06b6d4', fontSize: 20 }} /> },
                  { title: 'Multi-Currency Global Ledger', desc: 'Automatic FX currency conversion & GAAP foreign exchange gain/loss accounting.', icon: <CheckIcon sx={{ color: '#10b981', fontSize: 20 }} /> },
                  { title: 'Voice AI Financial Commands', desc: 'Ask natural language voice queries like "What is our net margin this month?"', icon: <AIIcon sx={{ color: '#38bdf8', fontSize: 20 }} /> }
                ].map((item, i) => (
                  <Box key={i} sx={{ p: 2, borderRadius: 2, bgcolor: '#0f172a', border: '1px solid #334155' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      {item.icon}
                      <Typography variant="subtitle2" fontWeight="700" color="#f8fafc">{item.title}</Typography>
                    </Box>
                    <Typography variant="body2" color="#94a3b8" fontSize={13}>{item.desc}</Typography>
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
