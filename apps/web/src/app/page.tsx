'use client';

import { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  Chip, 
  Stack, 
  Slider, 
  Paper, 
  Divider, 
  Avatar,
  IconButton,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { 
  Security as SecurityIcon, 
  Speed as SpeedIcon, 
  AutoFixHigh as AutoFixIcon, 
  Psychology as AIIcon, 
  CheckCircle as CheckIcon, 
  TrendingUp as TrendingUpIcon, 
  ArrowForward as ArrowForwardIcon, 
  Star as StarIcon, 
  AccountBalance as AccountsIcon, 
  Receipt as InvoicesIcon, 
  Inventory as InventoryIcon, 
  Extension as IntegrationsIcon,
  Calculate as CalculateIcon,
  Shield as ShieldIcon,
  VerifiedUser as VerifiedIcon,
  Lock as LockIcon,
  Store as RetailIcon,
  PrecisionManufacturing as ManufacturingIcon,
  WorkOutline as ServicesIcon,
  LocalHospital as HospitalIcon,
  Restaurant as RestaurantIcon,
  SwapHoriz as MigrateIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import Link from 'next/link';

export default function MarketingLandingPage() {
  const [teamSize, setTeamSize] = useState<number>(5);
  const [monthlyInvoices, setMonthlyInvoices] = useState<number>(150);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  // ROI Calculator Math (in INR ₹)
  const hoursSavedPerMonth = Math.round(teamSize * 18 + (monthlyInvoices * 0.25));
  const estimatedRupeeSavings = Math.round(hoursSavedPerMonth * 2500);

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#f8fafc', overflowX: 'hidden' }}>
      
      {/* 1. Header Navigation Bar */}
      <Box sx={{ borderBottom: '1px solid #1e293b', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 1100, backgroundColor: 'rgba(15, 23, 42, 0.85)' }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5 }}>
            <Box component={Link} href="/" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, textDecoration: 'none' }}>
              <Box component="img" src="/logo-icon-badge.png" alt="SmartBooks Logo" sx={{ width: 42, height: 42, borderRadius: 2.5, boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)', objectFit: 'contain' }} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h6" fontWeight="800" sx={{ color: '#ffffff', letterSpacing: '-0.5px', fontSize: '1.25rem' }}>
                  SmartBooks
                </Typography>
                <Chip label="AI Edition" size="small" sx={{ bgcolor: 'rgba(2, 132, 199, 0.2)', border: '1px solid #0284c7', color: '#38bdf8', fontWeight: 700, fontSize: 10.5, height: 22 }} />
              </Box>
            </Box>

            <Stack direction="row" spacing={3} sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
              <Link href="#editions" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>Product Editions</Link>
              <Link href="#why-smartbooks" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>Why SmartBooks</Link>
              <Link href="#outcomes" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>Business Outcomes</Link>
              <Link href="#migration" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>1-Day Migration</Link>
              <Link href="#plans" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>Subscription Plans</Link>
            </Stack>

            <Stack direction="row" spacing={2} alignItems="center">
              <Button component={Link} href="/login" sx={{ color: '#e2e8f0', textTransform: 'none', fontWeight: 600 }}>
                Sign In
              </Button>

              <Button 
                component={Link} 
                href="/login" 
                variant="contained" 
                sx={{ 
                  borderRadius: 2.5, 
                  px: 3, 
                  py: 1, 
                  bgcolor: '#0284c7', 
                  '&:hover': { bgcolor: '#0369a1' },
                  fontWeight: 600,
                  textTransform: 'none',
                  boxShadow: '0 4px 14px 0 rgba(2, 132, 199, 0.39)'
                }}
              >
                Start Free Trial
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* 2. Hero Section: Solves "I Don't Know Where My Money Goes" */}
      <Container maxWidth="lg" sx={{ pt: { xs: 8, md: 12 }, pb: { xs: 8, md: 10 } }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 2, py: 0.75, borderRadius: 5, bgcolor: '#1e293b', border: '1px solid #0284c7', mb: 3 }}>
              <AIIcon sx={{ color: '#38bdf8', fontSize: 18 }} />
              <Typography variant="caption" sx={{ color: '#38bdf8', fontWeight: 700, letterSpacing: 0.5 }}>
                SOLVES: "I DON'T KNOW WHERE MY MONEY GOES"
              </Typography>
            </Box>

            <Typography variant="h2" component="h1" fontWeight="800" color="#ffffff" sx={{ fontSize: { xs: '2.5rem', md: '3.5rem' }, lineHeight: 1.15, letterSpacing: '-1px', mb: 2.5 }}>
              The Autonomous AI Engine Built for <Box component="span" sx={{ background: 'linear-gradient(90deg, #38bdf8 0%, #8b5cf6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Business Outcomes</Box>
            </Typography>

            <Typography variant="h6" sx={{ color: '#94a3b8', fontWeight: 400, lineHeight: 1.6, mb: 4, fontSize: { xs: '1rem', md: '1.15rem' } }}>
              Don't just buy software. Capture 500 invoices in under 2 minutes, auto-reconcile an entire month's bank statements, and know your business health before your accountant does.
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }}>
              <Button 
                component={Link} 
                href="/login" 
                variant="contained" 
                size="large"
                endIcon={<ArrowForwardIcon />}
                sx={{ 
                  borderRadius: 2.5, 
                  px: 4, 
                  py: 1.5, 
                  bgcolor: '#0284c7', 
                  '&:hover': { bgcolor: '#0369a1' },
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'none'
                }}
              >
                Start 14-Day Free Trial
              </Button>

              <Button 
                component={Link} 
                href="#migration" 
                variant="outlined" 
                size="large"
                startIcon={<MigrateIcon />}
                sx={{ 
                  borderRadius: 2.5, 
                  px: 3.5, 
                  py: 1.5, 
                  color: '#cbd5e1', 
                  borderColor: '#334155',
                  '&:hover': { borderColor: '#38bdf8', bgcolor: 'rgba(56, 189, 248, 0.05)' },
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'none'
                }}
              >
                Switch from Tally in 1 Day
              </Button>
            </Stack>

            <Stack direction="row" spacing={3} alignItems="center">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckIcon sx={{ color: '#10b981', fontSize: 18 }} />
                <Typography variant="caption" color="#cbd5e1">1-Day Zero Downtime Migration</Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckIcon sx={{ color: '#10b981', fontSize: 18 }} />
                <Typography variant="caption" color="#cbd5e1">100% Free White-Glove Setup</Typography>
              </Box>
            </Stack>
          </Grid>

          {/* Hero Dashboard Glassmorphism Mockup */}
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={24} 
              sx={{ 
                p: 3, 
                borderRadius: 4, 
                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)', 
                border: '1px solid rgba(56, 189, 248, 0.2)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                position: 'relative'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ef4444' }} />
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#f59e0b' }} />
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#10b981' }} />
                </Box>
                <Chip label="Autonomous AI Copilot" color="primary" size="small" sx={{ fontWeight: 700 }} />
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
                <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#0f172a', border: '1px solid #1e293b' }}>
                  <Typography variant="caption" color="#94a3b8">500 Invoices Ingested</Typography>
                  <Typography variant="h5" fontWeight="bold" color="#38bdf8" sx={{ mt: 0.5 }}>1.8 Minutes</Typography>
                  <Typography variant="caption" color="#10b981">Auto-mapped in GL</Typography>
                </Box>

                <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#0f172a', border: '1px solid #1e293b' }}>
                  <Typography variant="caption" color="#94a3b8">Duplicate Payments Shield</Typography>
                  <Typography variant="h5" fontWeight="bold" color="#10b981" sx={{ mt: 0.5 }}>₹14,500 Saved</Typography>
                  <Typography variant="caption" color="#38bdf8">Duplicate Bill #9842 Blocked</Typography>
                </Box>
              </Box>

              <Paper sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(2, 132, 199, 0.1)', border: '1px solid #0284c7' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <AIIcon sx={{ color: '#38bdf8' }} />
                  <Typography variant="subtitle2" fontWeight="bold" color="#f8fafc">Proactive Business Intelligence Alert</Typography>
                </Box>
                <Typography variant="body2" color="#cbd5e1" sx={{ fontWeight: 500 }}>
                  "💡 Proactive Alert: Your Electricity & Utilities expense increased by 24% this month (₹42,500 vs 3-month avg ₹34,200). ₹18,400 unclaimed GST Input Credit detected."
                </Typography>
              </Paper>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* 3. Pillar 1: "Who Is This For?" — Industry-Tailored Product Editions */}
      <Box id="editions" sx={{ py: { xs: 8, md: 12 }, bgcolor: '#0b1120', borderTop: '1px solid #1e293b', borderBottom: '1px solid #1e293b' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', maxWidth: 750, mx: 'auto', mb: 8 }}>
            <Typography variant="caption" sx={{ color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5 }}>
              WHO IS THIS FOR?
            </Typography>
            <Typography variant="h3" fontWeight="800" color="#ffffff" sx={{ mt: 1, mb: 2 }}>
              Don't Buy One-Size-Fits-All Accounting. Choose Your Industry Edition.
            </Typography>
            <Typography variant="body1" color="#94a3b8">
              Purpose-built accounting modules tailored for the specific workflows of Retail, Manufacturing, Services, Healthcare, and Restaurants.
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {[
              {
                icon: <RetailIcon sx={{ fontSize: 36, color: '#38bdf8' }} />,
                title: 'Retail Edition',
                subtitle: 'For Stores, Supermarkets & E-Commerce',
                features: ['Barcode Scanner Integration', 'Point-of-Sale (POS) Billing', 'Multi-Branch Stock Valuation', 'Real-Time Inventory & GST']
              },
              {
                icon: <ManufacturingIcon sx={{ fontSize: 36, color: '#10b981' }} />,
                title: 'Manufacturing Edition',
                subtitle: 'For Factories, Assemblies & Process Plants',
                features: ['Bill of Materials (BOM) Costing', 'Raw Material Purchase MRP', 'Production Work-in-Progress (WIP)', 'Finished Goods Inventory']
              },
              {
                icon: <ServicesIcon sx={{ fontSize: 36, color: '#8b5cf6' }} />,
                title: 'Services & Consulting Edition',
                subtitle: 'For Agencies, Tech Consultancies & IT Services',
                features: ['Project Profitability Tracking', 'Milestone Invoicing', 'Employee Timesheets & Billables', 'Client Expense Reimbursables']
              },
              {
                icon: <HospitalIcon sx={{ fontSize: 36, color: '#ec4899' }} />,
                title: 'Healthcare & Hospital Edition',
                subtitle: 'For Clinics, Hospitals & Pharmacies',
                features: ['Patient Billing & Diagnostics', 'Pharmacy Stock Expiry Tracking', 'Departmental Revenue Reports', 'TPA Insurance Claim Match']
              },
              {
                icon: <RestaurantIcon sx={{ fontSize: 36, color: '#f59e0b' }} />,
                title: 'Restaurant & Hospitality Edition',
                subtitle: 'For Restaurants, Cafes & Food Chains',
                features: ['Recipe Unit Costing & F&B Stock', 'Kitchen Order Ticket (KDT) Sync', 'Daily Cash Register Audit', 'Swiggy/Zomato Payout Match']
              }
            ].map((edition, idx) => (
              <Grid item xs={12} sm={6} md={idx === 4 ? 12 : 6} key={idx}>
                <Paper
                  sx={{
                    p: 4,
                    height: '100%',
                    borderRadius: 3.5,
                    bgcolor: '#1e293b',
                    border: '1px solid #334155',
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      borderColor: '#0284c7',
                      transform: 'translateY(-4px)'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: '#0f172a' }}>
                      {edition.icon}
                    </Box>
                    <Box>
                      <Typography variant="h5" fontWeight="800" color="#ffffff">
                        {edition.title}
                      </Typography>
                      <Typography variant="caption" color="#38bdf8" fontWeight="600">
                        {edition.subtitle}
                      </Typography>
                    </Box>
                  </Box>

                  <Grid container spacing={1.5} sx={{ mt: 1 }}>
                    {edition.features.map((feat, i) => (
                      <Grid item xs={12} sm={6} key={i}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CheckIcon sx={{ color: '#10b981', fontSize: 16 }} />
                          <Typography variant="body2" color="#cbd5e1" fontSize={13}>
                            {feat}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* 4. Pillar 3: "Why SmartBooks?" — 1-Minute Competitor Comparison */}
      <Container id="why-smartbooks" maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <Box sx={{ textAlign: 'center', maxWidth: 750, mx: 'auto', mb: 8 }}>
          <Typography variant="caption" sx={{ color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5 }}>
            WHY SMARTBOOKS INSTEAD OF LEGACY SOFTWARE?
          </Typography>
          <Typography variant="h3" fontWeight="800" color="#ffffff" sx={{ mt: 1, mb: 2 }}>
            See How SmartBooks Outperforms Tally & Zoho in 1 Minute
          </Typography>
          <Typography variant="body1" color="#94a3b8">
            Legacy desktop software requires manual line-by-line entry. SmartBooks automates 100% of journal postings with AI vision and proactive anomaly detection.
          </Typography>
        </Box>

        <TableContainer component={Paper} sx={{ borderRadius: 4, bgcolor: '#1e293b', border: '1px solid #334155' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#0f172a' }}>
                <TableCell sx={{ color: '#ffffff', fontWeight: 800, fontSize: 15, py: 2.5 }}>Capability / Workflow</TableCell>
                <TableCell align="center" sx={{ color: '#94a3b8', fontWeight: 700, fontSize: 14 }}>❌ Tally Prime</TableCell>
                <TableCell align="center" sx={{ color: '#94a3b8', fontWeight: 700, fontSize: 14 }}>❌ Zoho Books</TableCell>
                <TableCell align="center" sx={{ color: '#38bdf8', fontWeight: 800, fontSize: 15, bgcolor: 'rgba(2, 132, 199, 0.15)' }}>⚡ SmartBooks AI Engine</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[
                { feature: '500 Supplier Invoice Processing', tally: 'Manual Line-by-Line', zoho: 'Basic OCR (Slow)', smartbooks: '2 Minutes (Bulk AI Ingestion)' },
                { feature: 'Bank Reconciliation', tally: 'Manual Entry', zoho: 'Manual Rule Setup', smartbooks: '100% Automated Matching' },
                { feature: 'GST Mismatch & ITC Recovery', tally: 'Manual Audit', zoho: 'Basic Filing Only', smartbooks: 'AI GSTR-2B Audit & Catch' },
                { feature: 'Duplicate Payment & Fraud Catch', tally: 'None (Leaks Profit)', zoho: 'None', smartbooks: 'AI Duplicate Shield Alert' },
                { feature: 'Proactive Anomaly Alerts', tally: 'None', zoho: 'None', smartbooks: 'AI Alerts ("Electricity up 24%")' },
                { feature: 'Migration Effort from Existing Software', tally: 'Complex Manual Setup', zoho: 'Data Lock-In', smartbooks: '1-Day Import + Free White-Glove' },
              ].map((row, index) => (
                <TableRow key={index} hover sx={{ '&:nth-of-type(even)': { bgcolor: 'rgba(15, 23, 42, 0.5)' } }}>
                  <TableCell sx={{ color: '#f8fafc', fontWeight: 600, fontSize: 14 }}>{row.feature}</TableCell>
                  <TableCell align="center" sx={{ color: '#ef4444', fontSize: 13.5 }}>{row.tally}</TableCell>
                  <TableCell align="center" sx={{ color: '#f59e0b', fontSize: 13.5 }}>{row.zoho}</TableCell>
                  <TableCell align="center" sx={{ color: '#10b981', fontWeight: 700, fontSize: 14, bgcolor: 'rgba(2, 132, 199, 0.08)' }}>
                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                      <CheckIcon sx={{ fontSize: 16, color: '#10b981' }} />
                      {row.smartbooks}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>

      {/* 5. Pillar 4: "Why Now?" — Frictionless 1-Day Switch */}
      <Box id="migration" sx={{ py: { xs: 8, md: 12 }, bgcolor: '#070a12', borderTop: '1px solid #1e293b', borderBottom: '1px solid #1e293b' }}>
        <Container maxWidth="lg">
          <Paper sx={{ p: { xs: 4, md: 6 }, borderRadius: 4, background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', border: '1px solid #0284c7' }}>
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={7}>
                <Chip label="WHY NOW?" color="primary" size="small" sx={{ fontWeight: 800, mb: 2 }} />
                <Typography variant="h3" fontWeight="800" color="#ffffff" sx={{ mb: 2 }}>
                  Switch from Tally or Zoho in 1 Day with Zero Downtime
                </Typography>
                <Typography variant="body1" color="#94a3b8" sx={{ mb: 3, lineHeight: 1.6 }}>
                  Scared of migration headaches? SmartBooks provides 1-Click Tally XML & CSV data importers along with 100% Free White-Glove migration support. Your team suffers zero operational downtime.
                </Typography>

                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <CheckIcon sx={{ color: '#10b981' }} />
                    <Typography variant="body2" color="#e2e8f0">Import Chart of Accounts, Customers, Vendors & Past Transactions in 1 Click</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <CheckIcon sx={{ color: '#10b981' }} />
                    <Typography variant="body2" color="#e2e8f0">Parallel Run Guarantee — Keep Tally active until your team is 100% confident</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <CheckIcon sx={{ color: '#10b981' }} />
                    <Typography variant="body2" color="#e2e8f0">Dedicated Migration Specialist assigned to your business for free</Typography>
                  </Box>
                </Stack>
              </Grid>

              <Grid item xs={12} md={5}>
                <Paper sx={{ p: 4, borderRadius: 3, bgcolor: '#0f172a', border: '1px solid #334155', textAlign: 'center' }}>
                  <MigrateIcon sx={{ fontSize: 56, color: '#38bdf8', mb: 1.5 }} />
                  <Typography variant="h5" fontWeight="800" color="#ffffff" sx={{ mb: 1 }}>
                    Schedule Free 1-Day Migration
                  </Typography>
                  <Typography variant="body2" color="#94a3b8" sx={{ mb: 3 }}>
                    Our solution team will import your ledger data and set up your Industry Edition today.
                  </Typography>
                  <Button 
                    component={Link} 
                    href="/login" 
                    variant="contained" 
                    fullWidth 
                    size="large" 
                    sx={{ bgcolor: '#0284c7', '&:hover': { bgcolor: '#0369a1' }, py: 1.5, fontWeight: 700, textTransform: 'none' }}
                  >
                    Schedule Free Migration
                  </Button>
                </Paper>
              </Grid>
            </Grid>
          </Paper>
        </Container>
      </Box>

      {/* 6. Core Business Outcomes Showcase Section */}
      <Container id="outcomes" maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <Box sx={{ textAlign: 'center', maxWidth: 750, mx: 'auto', mb: 8 }}>
          <Typography variant="caption" sx={{ color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5 }}>
            DRIVE MEASURABLE BUSINESS OUTCOMES
          </Typography>
          <Typography variant="h3" fontWeight="800" color="#ffffff" sx={{ mt: 1, mb: 2, letterSpacing: '-0.5px' }}>
            Stop Buying Software. Start Buying Results.
          </Typography>
          <Typography variant="body1" color="#94a3b8">
            Save time, eliminate manual bookkeeping errors, capture every rupee of unclaimed tax credit, and know your business health before your accountant does.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {[
            {
              icon: <AIIcon sx={{ fontSize: 32, color: '#38bdf8' }} />,
              title: 'Capture 500 Supplier Invoices in Under 2 Minutes',
              outcomeTag: 'SAVINGS: 18 HOURS / MO',
              tagColor: '#0284c7',
              description: 'Upload bulk PDF or photo invoices in one drop. Autonomous AI parses line items, maps GL accounts, and auto-posts balanced journals in 4.2 seconds.'
            },
            {
              icon: <AutoFixIcon sx={{ fontSize: 32, color: '#10b981' }} />,
              title: "Reconcile an Entire Month's Bank Statement Automatically",
              outcomeTag: '100% MATCHING',
              tagColor: '#10b981',
              description: 'Connect bank feeds and automatically match hundreds of bank transactions against general ledger entries with zero manual effort and 100% precision.'
            },
            {
              icon: <TrendingUpIcon sx={{ fontSize: 32, color: '#8b5cf6' }} />,
              title: 'Know Your Business Health Before Your Accountant Does',
              outcomeTag: 'REAL-TIME CLARITY',
              tagColor: '#8b5cf6',
              description: 'Real-time Executive Dashboard gives CFOs and Founders instant clarity on net cash position, monthly burn rate, and 18-month liquid runway.'
            },
            {
              icon: <AccountsIcon sx={{ fontSize: 32, color: '#f59e0b' }} />,
              title: 'Eliminate 99% of Bookkeeping Errors & GST Mismatches',
              outcomeTag: 'ZERO ERROR AUDIT',
              tagColor: '#d97706',
              description: 'Automated double-entry balance enforcement ensures total Debits equal Credits while auditing GSTR-2B vs vendor bills to claim every rupee of ITC.'
            },
            {
              icon: <InvoicesIcon sx={{ fontSize: 32, color: '#ec4899' }} />,
              title: 'Get Paid 3x Faster with Instant Collection Links',
              outcomeTag: '3X FASTER CASH',
              tagColor: '#db2777',
              description: 'Send customer invoices with built-in UPI, Razorpay, & credit card collection links. Auto-record customer payments and trigger ledger postings.'
            },
            {
              icon: <IntegrationsIcon sx={{ fontSize: 32, color: '#06b6d4' }} />,
              title: 'Predict Cashflow Shortfalls 45 Days in Advance',
              outcomeTag: 'PREDICTIVE SAFETY',
              tagColor: '#0891b2',
              description: 'AI predictive analytics models your 12-month forward cashflow, identifying upcoming liquidity bottlenecks before they impact payroll or suppliers.'
            }
          ].map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Paper 
                sx={{ 
                  p: 3.5, 
                  height: '100%', 
                  borderRadius: 3, 
                  bgcolor: '#1e293b', 
                  border: '1px solid #334155',
                  transition: 'transform 0.2s ease, border-color 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    borderColor: '#0284c7'
                  }
                }}
              >
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#0f172a', display: 'inline-block' }}>
                      {feature.icon}
                    </Box>
                    <Chip 
                      label={feature.outcomeTag} 
                      size="small" 
                      sx={{ 
                        fontSize: 9.5, 
                        fontWeight: 800, 
                        bgcolor: 'rgba(15, 23, 42, 0.8)', 
                        color: feature.tagColor,
                        border: `1px solid ${feature.tagColor}`
                      }} 
                    />
                  </Box>
                  <Typography variant="h6" fontWeight="700" sx={{ mb: 1.5, color: '#f8fafc', lineHeight: 1.3 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#94a3b8', lineHeight: 1.6 }}>
                    {feature.description}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* 7. Enterprise Technical Architecture & Infrastructure */}
      <Box id="architecture" sx={{ py: { xs: 8, md: 12 }, bgcolor: '#070a12', borderTop: '1px solid #1e293b' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', maxWidth: 750, mx: 'auto', mb: 8 }}>
            <Typography variant="caption" sx={{ color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5 }}>
              Architected for CTOs & Technical Buyers
            </Typography>
            <Typography variant="h3" fontWeight="800" color="#ffffff" sx={{ mt: 1, mb: 2 }}>
              Enterprise Platform Infrastructure
            </Typography>
            <Typography variant="body1" color="#94a3b8">
              Engineered from the ground up for high throughput, sub-millisecond query execution, continuous compliance, and seamless API integrations.
            </Typography>
          </Box>

          <Grid container spacing={3.5}>
            {[
              {
                title: 'Cloud Native',
                badge: 'Next.js 14 & Serverless Edge',
                color: '#38bdf8',
                bgColor: 'rgba(56, 189, 248, 0.12)',
                borderColor: 'rgba(56, 189, 248, 0.25)',
                desc: 'Deploy on global edge networks with dynamic serverless functions, automatic horizontal scaling, and sub-50ms query latency.'
              },
              {
                title: 'Multi Tenant',
                badge: 'Isolated Database Schemas',
                color: '#10b981',
                bgColor: 'rgba(16, 185, 129, 0.12)',
                borderColor: 'rgba(16, 185, 129, 0.25)',
                desc: 'Strict database tenant isolation with custom organization subdomains, role-based access control (RBAC), and zero cross-tenant data leakage.'
              },
              {
                title: 'Secure',
                badge: '256-Bit TLS & SOC2 Type II',
                color: '#f59e0b',
                bgColor: 'rgba(245, 158, 11, 0.12)',
                borderColor: 'rgba(245, 158, 11, 0.25)',
                desc: 'End-to-end encryption in transit and at rest, JWT bearer authentication, automated security audits, and continuous GDPR/GST compliance.'
              },
              {
                title: 'API First',
                badge: 'RESTful & Webhook Sync',
                color: '#8b5cf6',
                bgColor: 'rgba(139, 92, 246, 0.12)',
                borderColor: 'rgba(139, 92, 246, 0.25)',
                desc: 'Comprehensive REST APIs, webhook dispatchers, open banking sync, and seamless integration with Razorpay, Stripe, UPI, & ERP systems.'
              },
              {
                title: 'AI Powered',
                badge: 'OCR Vision & Audit Engine',
                color: '#ec4899',
                bgColor: 'rgba(236, 72, 153, 0.12)',
                borderColor: 'rgba(236, 72, 153, 0.25)',
                desc: 'Generative AI vision for receipt line-item scanning, automated Chart of Accounts mapping, and real-time anomaly detection.'
              },
              {
                title: 'High Availability',
                badge: '99.99% Uptime SLA',
                color: '#06b6d4',
                bgColor: 'rgba(6, 182, 212, 0.12)',
                borderColor: 'rgba(6, 182, 212, 0.25)',
                desc: 'Neon PostgreSQL auto-scaling database clusters, point-in-time recovery, zero-downtime rolling updates, and continuous failover protection.'
              }
            ].map((pillar, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Paper
                  sx={{
                    p: 3.5,
                    height: '100%',
                    borderRadius: 3,
                    bgcolor: '#0f172a',
                    border: `1px solid ${pillar.borderColor}`,
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      borderColor: pillar.color,
                      boxShadow: `0 12px 24px -10px ${pillar.bgColor}`
                    }
                  }}
                >
                  <Chip
                    label={pillar.badge}
                    size="small"
                    sx={{
                      mb: 2,
                      bgcolor: pillar.bgColor,
                      color: pillar.color,
                      fontWeight: 700,
                      fontSize: 10.5,
                      border: `1px solid ${pillar.borderColor}`
                    }}
                  />
                  <Typography variant="h5" fontWeight="800" color="#ffffff" sx={{ mb: 1 }}>
                    {pillar.title}
                  </Typography>
                  <Typography variant="body2" color="#94a3b8" sx={{ lineHeight: 1.6 }}>
                    {pillar.desc}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* 8. Subscription Matrix Section (in INR ₹) */}
      <Box id="plans" sx={{ py: { xs: 8, md: 12 }, bgcolor: '#0b1120', borderTop: '1px solid #1e293b', borderBottom: '1px solid #1e293b' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', maxWidth: 700, mx: 'auto', mb: 6 }}>
            <Typography variant="caption" sx={{ color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5 }}>
              Transparent Subscription Plans (in ₹ INR)
            </Typography>
            <Typography variant="h3" fontWeight="800" color="#ffffff" sx={{ mt: 1, mb: 2 }}>
              Choose the Right Plan for Your Scale
            </Typography>
            <Typography variant="body1" color="#94a3b8">
              Predictable pricing in Indian Rupees designed to support small businesses, growing companies, and enterprises.
            </Typography>

            <Stack direction="row" spacing={2} justifyContent="center" alignItems="center" sx={{ mt: 4 }}>
              <Typography variant="body2" sx={{ color: billingCycle === 'monthly' ? '#ffffff' : '#94a3b8', fontWeight: 600 }}>Monthly Billing</Typography>
              <Switch 
                checked={billingCycle === 'annual'} 
                onChange={(e) => setBillingCycle(e.target.checked ? 'annual' : 'monthly')} 
                color="info"
              />
              <Typography component="div" variant="body2" sx={{ color: billingCycle === 'annual' ? '#ffffff' : '#94a3b8', fontWeight: 600, display: 'inline-flex', alignItems: 'center' }}>
                Annual Billing <Chip label="Save 20%" color="success" size="small" sx={{ ml: 0.5, height: 20, fontSize: 10 }} />
              </Typography>
            </Stack>
          </Box>

          <Grid container spacing={4} alignItems="stretch">
            {/* Starter / Essentials */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 4, height: '100%', borderRadius: 4, bgcolor: '#1e293b', border: '1px solid #334155', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Box>
                  <Chip label="Starter / Essentials" color="success" size="small" sx={{ mb: 2, fontWeight: 700 }} />
                  <Typography variant="h4" fontWeight="bold" color="#ffffff">
                    {billingCycle === 'annual' ? '₹1,999' : '₹2,499'} 
                    <Typography component="span" variant="body2" color="#94a3b8"> / month</Typography>
                  </Typography>
                  <Typography variant="body2" color="#94a3b8" sx={{ mt: 1, mb: 3 }}>
                    Essential ledger, invoicing, and reporting tools for early-stage teams.
                  </Typography>
                  <Divider sx={{ mb: 3, borderColor: '#334155' }} />

                  <Stack spacing={1.5}>
                    {['Chart of Accounts', 'Journal Entries', 'Customer Invoices', 'Vendor Bills', 'Financial Reports', 'AI Assistant'].map((item, i) => (
                      <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckIcon sx={{ color: '#10b981', fontSize: 18 }} />
                        <Typography variant="body2" color="#e2e8f0">{item}</Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>

                <Button component={Link} href="/login" variant="outlined" fullWidth sx={{ mt: 4, py: 1.2, color: '#ffffff', borderColor: '#334155', textTransform: 'none', fontWeight: 600 }}>
                  Start Trial
                </Button>
              </Paper>
            </Grid>

            {/* Growth / Professional */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 4, height: '100%', borderRadius: 4, bgcolor: '#1e293b', border: '2px solid #0284c7', boxShadow: '0 0 25px rgba(2, 132, 199, 0.25)', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Box sx={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', bgcolor: '#0284c7', color: '#fff', px: 2, py: 0.25, borderRadius: 5, fontSize: 11, fontWeight: 700 }}>
                  MOST POPULAR
                </Box>
                <Box>
                  <Chip label="Growth / Professional" color="info" size="small" sx={{ mb: 2, fontWeight: 700 }} />
                  <Typography variant="h4" fontWeight="bold" color="#ffffff">
                    {billingCycle === 'annual' ? '₹4,999' : '₹5,999'} 
                    <Typography component="span" variant="body2" color="#94a3b8"> / month</Typography>
                  </Typography>
                  <Typography variant="body2" color="#94a3b8" sx={{ mt: 1, mb: 3 }}>
                    Advanced stock management, tax engines, and automated bank reconciliation.
                  </Typography>
                  <Divider sx={{ mb: 3, borderColor: '#334155' }} />

                  <Stack spacing={1.5}>
                    {['All Starter Features', 'Inventory & Stock Valuation', 'GST / VAT Tax Engine', '1-Click Bank Reconciliation', 'Online Payments & Collection Links'].map((item, i) => (
                      <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckIcon sx={{ color: '#0284c7', fontSize: 18 }} />
                        <Typography variant="body2" color="#e2e8f0">{item}</Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>

                <Button component={Link} href="/login" variant="contained" fullWidth sx={{ mt: 4, py: 1.2, bgcolor: '#0284c7', '&:hover': { bgcolor: '#0369a1' }, textTransform: 'none', fontWeight: 600 }}>
                  Start 14-Day Trial
                </Button>
              </Paper>
            </Grid>

            {/* Enterprise / Premium */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 4, height: '100%', borderRadius: 4, bgcolor: '#1e293b', border: '1px solid #334155', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Box>
                  <Chip label="Enterprise / Premium" color="secondary" size="small" sx={{ mb: 2, fontWeight: 700 }} />
                  <Typography variant="h4" fontWeight="bold" color="#ffffff">
                    {billingCycle === 'annual' ? '₹11,999' : '₹14,999'} 
                    <Typography component="span" variant="body2" color="#94a3b8"> / month</Typography>
                  </Typography>
                  <Typography variant="body2" color="#94a3b8" sx={{ mt: 1, mb: 3 }}>
                    AI OCR Vision scanner, cash runway forecasting, and banking API hub.
                  </Typography>
                  <Divider sx={{ mb: 3, borderColor: '#334155' }} />

                  <Stack spacing={1.5}>
                    {['All Growth Features', 'AI OCR Receipt Scanner', 'Financial Forecasting & Runway', 'Workflow Automation Rules', 'Banking APIs & Hub', 'Dedicated Account Manager'].map((item, i) => (
                      <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckIcon sx={{ color: '#8b5cf6', fontSize: 18 }} />
                        <Typography variant="body2" color="#e2e8f0">{item}</Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>

                <Button component={Link} href="/login" variant="outlined" fullWidth sx={{ mt: 4, py: 1.2, color: '#ffffff', borderColor: '#334155', textTransform: 'none', fontWeight: 600 }}>
                  Contact Enterprise Sales
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* 9. Final Call to Action Banner ("What's Next?") */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 10 } }}>
        <Paper 
          sx={{ 
            p: { xs: 4, md: 8 }, 
            borderRadius: 4, 
            background: 'linear-gradient(135deg, #0284c7 0%, #0f172a 100%)', 
            textAlign: 'center',
            boxShadow: '0 20px 40px -15px rgba(2, 132, 199, 0.4)'
          }}
        >
          <Typography variant="caption" sx={{ color: '#38bdf8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5 }}>
            WHAT'S NEXT?
          </Typography>
          <Typography variant="h3" fontWeight="800" color="#ffffff" sx={{ mt: 1, mb: 2 }}>
            Ready to Automate Your Bookkeeping & Protect Your Cashflow?
          </Typography>
          <Typography variant="body1" color="#cbd5e1" sx={{ maxWidth: 650, mx: 'auto', mb: 4, fontSize: { xs: '1rem', md: '1.15rem' } }}>
            Get started in under 60 seconds with our 14-day free trial or schedule a 1-day white-glove migration from Tally.
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5} justifyContent="center" alignItems="center">
            <Button
              component={Link}
              href="/login"
              variant="contained"
              size="large"
              sx={{
                bgcolor: '#ffffff',
                color: '#0284c7',
                '&:hover': { bgcolor: '#f8fafc' },
                px: 4,
                py: 1.5,
                borderRadius: 2.5,
                fontWeight: 800,
                fontSize: '1.05rem',
                textTransform: 'none'
              }}
            >
              Start 14-Day Free Trial
            </Button>

            <Button
              component={Link}
              href="#migration"
              variant="outlined"
              size="large"
              sx={{
                color: '#ffffff',
                borderColor: 'rgba(255,255,255,0.4)',
                '&:hover': { borderColor: '#ffffff', bgcolor: 'rgba(255,255,255,0.1)' },
                px: 4,
                py: 1.5,
                borderRadius: 2.5,
                fontWeight: 700,
                fontSize: '1.05rem',
                textTransform: 'none'
              }}
            >
              Schedule Free Migration
            </Button>

            <Button
              component={Link}
              href="/login"
              variant="text"
              size="large"
              sx={{ color: '#38bdf8', fontWeight: 700, textTransform: 'none' }}
            >
              Book Live Demo →
            </Button>
          </Stack>
        </Paper>
      </Container>

      {/* 10. Footer */}
      <Box sx={{ py: 6, bgcolor: '#070a12', borderTop: '1px solid #1e293b', color: '#94a3b8' }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box component="img" src="/logo-icon-badge.png" alt="SmartBooks Logo" sx={{ width: 34, height: 34, borderRadius: 2, objectFit: 'contain' }} />
              <Typography variant="subtitle1" fontWeight="800" color="#ffffff" sx={{ letterSpacing: '-0.3px' }}>SmartBooks Inc</Typography>
            </Box>

            <Typography variant="body2" color="#94a3b8">
              © 2026 SmartBooks Enterprise AI Accounting Engine. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>

    </Box>
  );
}
