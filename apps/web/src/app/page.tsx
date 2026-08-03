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
  Cancel as CancelIcon,
  PlayCircleOutline as PlayIcon,
  Smartphone as MobileIcon,
  FormatQuote as QuoteIcon,
  Business as EnterpriseIcon,
  WhatsApp as WhatsAppIcon,
  Payment as PaymentIcon,
  Description as ExcelIcon
} from '@mui/icons-material';
import Link from 'next/link';

export default function MarketingLandingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#f8fafc', overflowX: 'hidden' }}>
      
      {/* Top Interactive Live Demo Bar */}
      <Box sx={{ bgcolor: '#0284c7', py: 1, px: 2, textAlign: 'center' }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Chip label="NO LOGIN REQUIRED" size="small" sx={{ bgcolor: '#ffffff', color: '#0284c7', fontWeight: 800, fontSize: 10, height: 20 }} />
            <Typography variant="body2" color="#ffffff" fontWeight="600" fontSize={{ xs: 12, sm: 13.5 }}>
              Want to experience SmartBooks instantly? Explore our live sample company workspace in 1 click.
            </Typography>
            <Button 
              component={Link} 
              href="/dashboard" 
              size="small"
              startIcon={<PlayIcon />}
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                color: '#ffffff', 
                '&:hover': { bgcolor: '#ffffff', color: '#0284c7' },
                fontWeight: 700,
                fontSize: 12,
                textTransform: 'none',
                py: 0.25,
                px: 1.5,
                borderRadius: 1.5
              }}
            >
              Explore Live Demo →
            </Button>
          </Box>
        </Container>
      </Box>

      {/* 1. Header Navigation Bar */}
      <Box sx={{ borderBottom: '1px solid #1e293b', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 1100, backgroundColor: 'rgba(15, 23, 42, 0.9)' }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2 }}>
            <Box component={Link} href="/" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, textDecoration: 'none' }}>
              <Box component="img" src="/logo-icon-badge.png" alt="SmartBooks Logo" sx={{ width: 40, height: 40, borderRadius: 2.5, boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)', objectFit: 'contain' }} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h6" fontWeight="800" sx={{ color: '#ffffff', letterSpacing: '-0.5px', fontSize: '1.2rem', whiteSpace: 'nowrap' }}>
                  SmartBooks
                </Typography>
                <Chip label="AI Edition" size="small" sx={{ bgcolor: 'rgba(2, 132, 199, 0.2)', border: '1px solid #0284c7', color: '#38bdf8', fontWeight: 700, fontSize: 10, height: 20 }} />
              </Box>
            </Box>

            <Stack direction="row" spacing={{ md: 3, lg: 4 }} sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
              <Link href="#editions" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap' }}>Editions</Link>
              <Link href="#why-switch" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap' }}>Why Switch?</Link>
              <Link href="#migration" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap' }}>Migration</Link>
              <Link href="#trust" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap' }}>About Us</Link>
              <Link href="/roadmap" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap' }}>Roadmap</Link>
              <Link href="#plans" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap' }}>Pricing</Link>
            </Stack>

            <Stack direction="row" spacing={2} alignItems="center">
              <Button component={Link} href="/dashboard" variant="outlined" size="small" sx={{ color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.4)', textTransform: 'none', fontWeight: 600, fontSize: 13, display: { xs: 'none', sm: 'inline-flex' } }}>
                Live Demo
              </Button>

              <Button component={Link} href="/login" sx={{ color: '#e2e8f0', textTransform: 'none', fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap' }}>
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
                  fontSize: 14,
                  textTransform: 'none',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 4px 14px 0 rgba(2, 132, 199, 0.39)'
                }}
              >
                Start Free Trial
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* 2. Hero Section */}
      <Container maxWidth="lg" sx={{ pt: { xs: 6, md: 10 }, pb: { xs: 6, md: 10 } }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 2, py: 0.75, borderRadius: 50, bgcolor: '#1e293b', border: '1px solid #0284c7', mb: 3 }}>
              <AIIcon sx={{ color: '#38bdf8', fontSize: 16 }} />
              <Typography variant="caption" sx={{ color: '#38bdf8', fontWeight: 700, letterSpacing: 0.5, fontSize: 11 }}>
                SOLVES: "I DON'T KNOW WHERE MY MONEY GOES"
              </Typography>
            </Box>

            <Typography variant="h2" component="h1" fontWeight="800" color="#ffffff" sx={{ fontSize: { xs: '2.25rem', md: '3.15rem' }, lineHeight: 1.2, letterSpacing: '-0.8px', mb: 2.5 }}>
              The Autonomous AI Engine Built for <Box component="span" sx={{ background: 'linear-gradient(90deg, #38bdf8 0%, #8b5cf6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Business Outcomes</Box>
            </Typography>

            <Typography variant="h6" sx={{ color: '#94a3b8', fontWeight: 400, lineHeight: 1.6, mb: 4, fontSize: { xs: '1rem', md: '1.1rem' } }}>
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
                  px: 3.5, 
                  py: 1.3, 
                  bgcolor: '#0284c7', 
                  '&:hover': { bgcolor: '#0369a1' },
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  whiteSpace: 'nowrap'
                }}
              >
                Start 14-Day Free Trial
              </Button>

              <Button 
                component={Link} 
                href="/dashboard" 
                variant="outlined" 
                size="large"
                startIcon={<PlayIcon />}
                sx={{ 
                  borderRadius: 2.5, 
                  px: 3, 
                  py: 1.3, 
                  color: '#38bdf8', 
                  borderColor: '#0284c7',
                  '&:hover': { borderColor: '#38bdf8', bgcolor: 'rgba(56, 189, 248, 0.1)' },
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  whiteSpace: 'nowrap'
                }}
              >
                Try Live Demo (No Login)
              </Button>
            </Stack>

            <Stack direction="row" spacing={3} alignItems="center">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckIcon sx={{ color: '#10b981', fontSize: 18 }} />
                <Typography variant="caption" color="#cbd5e1" fontWeight="500">14-Day Free Trial</Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckIcon sx={{ color: '#10b981', fontSize: 18 }} />
                <Typography variant="caption" color="#cbd5e1" fontWeight="500">No Credit Card Required</Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckIcon sx={{ color: '#10b981', fontSize: 18 }} />
                <Typography variant="caption" color="#cbd5e1" fontWeight="500">1-Day White-Glove Switch</Typography>
              </Box>
            </Stack>
          </Grid>

          {/* Hero Dashboard Glassmorphism Mockup */}
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={24} 
              sx={{ 
                p: 3.5, 
                borderRadius: 4, 
                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)', 
                border: '1px solid rgba(56, 189, 248, 0.25)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
                position: 'relative'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#ef4444' }} />
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#f59e0b' }} />
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#10b981' }} />
                </Box>
                <Chip label="Autonomous AI Copilot" color="primary" size="small" sx={{ fontWeight: 700, fontSize: 11 }} />
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
                <Box sx={{ p: 2.25, borderRadius: 2.5, bgcolor: '#0f172a', border: '1px solid #1e293b' }}>
                  <Typography variant="caption" color="#94a3b8" fontWeight="500">500 Invoices Ingested</Typography>
                  <Typography variant="h5" fontWeight="800" color="#38bdf8" sx={{ mt: 0.5 }}>1.8 Minutes</Typography>
                  <Typography variant="caption" color="#10b981" fontWeight="600">Auto-mapped in GL</Typography>
                </Box>

                <Box sx={{ p: 2.25, borderRadius: 2.5, bgcolor: '#0f172a', border: '1px solid #1e293b' }}>
                  <Typography variant="caption" color="#94a3b8" fontWeight="500">Duplicate Payments Shield</Typography>
                  <Typography variant="h5" fontWeight="800" color="#10b981" sx={{ mt: 0.5 }}>₹14,500 Saved</Typography>
                  <Typography variant="caption" color="#38bdf8" fontWeight="600">Duplicate Bill #9842 Blocked</Typography>
                </Box>
              </Box>

              <Paper sx={{ p: 2.5, borderRadius: 2.5, bgcolor: 'rgba(2, 132, 199, 0.12)', border: '1px solid #0284c7' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <AIIcon sx={{ color: '#38bdf8', fontSize: 20 }} />
                  <Typography variant="subtitle2" fontWeight="700" color="#f8fafc">Proactive Business Intelligence Alert</Typography>
                </Box>
                <Typography variant="body2" color="#cbd5e1" sx={{ fontWeight: 500, lineHeight: 1.5, fontSize: '0.875rem' }}>
                  "💡 Alert: Your Electricity & Utilities expense increased by 24% this month (₹42,500 vs 3-month avg ₹34,200). ₹18,400 unclaimed GST Input Credit detected."
                </Typography>
              </Paper>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* 3. Feedback #6: "Why Switch?" — Before vs After Comparison */}
      <Container id="why-switch" maxWidth="lg" sx={{ py: { xs: 8, md: 10 } }}>
        <Box sx={{ textAlign: 'center', maxWidth: 750, mx: 'auto', mb: 8 }}>
          <Typography variant="caption" sx={{ color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5 }}>
            TRANSFORM YOUR FINANCIAL OPERATIONS
          </Typography>
          <Typography variant="h3" fontWeight="800" color="#ffffff" sx={{ mt: 1, mb: 2 }}>
            Why Switch to SmartBooks?
          </Typography>
          <Typography variant="body1" color="#94a3b8">
            Stop losing hours to manual spreadsheets and paper receipts. Experience immediate clarity.
          </Typography>
        </Box>

        <TableContainer component={Paper} sx={{ borderRadius: 4, bgcolor: '#1e293b', border: '1px solid #334155' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#0f172a' }}>
                <TableCell sx={{ color: '#ffffff', fontWeight: 800, fontSize: 15, py: 2.5 }}>Workflow & Efficiency</TableCell>
                <TableCell align="center" sx={{ color: '#ef4444', fontWeight: 700, fontSize: 14 }}>🔴 Before (Excel / Legacy Paper)</TableCell>
                <TableCell align="center" sx={{ color: '#10b981', fontWeight: 800, fontSize: 15, bgcolor: 'rgba(16, 185, 129, 0.1)' }}>🟢 After (SmartBooks AI Engine)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[
                { dimension: 'Invoice Creation & Billing', before: 'Manual typing in Word/Excel (4 hours/week)', after: '1-Click Automated GST Invoices with UPI Payment Links' },
                { dimension: 'Supplier Receipts & Expenses', before: 'Shoebox of paper bills & lost receipts', after: 'AI OCR Photo & PDF Scanner parses 500 bills in 2 mins' },
                { dimension: 'Bank Statement Matching', before: 'Manual tick-marks on paper bank statements', after: '1-Click Automated Bank Reconciliation matching 100% entries' },
                { dimension: 'Business Health & Cash Visibility', before: 'Wait 15 days for accountant’s monthly balance sheet', after: 'Live Executive Dashboard with real-time cash position & runway' },
                { dimension: 'GST Compliance & ITC Audits', before: 'Manual audit errors & missed Input Tax Credit', after: 'Automated GSTR-2B mismatch audit recovering every rupee' },
                { dimension: 'Data Security & Backups', before: 'Local desktop risk, corrupted files, zero backup', after: 'Encrypted Cloud Storage with point-in-time auto backups' }
              ].map((row, index) => (
                <TableRow key={index} hover sx={{ '&:nth-of-type(even)': { bgcolor: 'rgba(15, 23, 42, 0.5)' } }}>
                  <TableCell sx={{ color: '#f8fafc', fontWeight: 600, fontSize: 14 }}>{row.dimension}</TableCell>
                  <TableCell align="center" sx={{ color: '#cbd5e1', fontSize: 13.5 }}>{row.before}</TableCell>
                  <TableCell align="center" sx={{ color: '#10b981', fontWeight: 700, fontSize: 14, bgcolor: 'rgba(16, 185, 129, 0.05)' }}>
                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                      <CheckIcon sx={{ fontSize: 16, color: '#10b981' }} />
                      {row.after}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>

      {/* 4. Feedback #4: 4-Way Migration Story (Excel, Tally, Zoho, QuickBooks) */}
      <Box id="migration" sx={{ py: { xs: 8, md: 10 }, bgcolor: '#0b1120', borderTop: '1px solid #1e293b', borderBottom: '1px solid #1e293b' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', maxWidth: 750, mx: 'auto', mb: 8 }}>
            <Typography variant="caption" sx={{ color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5 }}>
              FRICTIONLESS 1-DAY SWITCH
            </Typography>
            <Typography variant="h3" fontWeight="800" color="#ffffff" sx={{ mt: 1, mb: 2 }}>
              Move from Excel, Tally, Zoho, or QuickBooks in 1 Day
            </Typography>
            <Typography variant="body1" color="#94a3b8">
              No data lock-in. No complex setup. We provide automated importers and 100% Free White-Glove migration support.
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {[
              {
                source: 'Excel & Spreadsheets',
                badge: '1-CLICK CSV IMPORT',
                color: '#10b981',
                desc: 'Upload your existing Chart of Accounts, Customer lists, and Vendor bills via simple Excel .xlsx or .csv templates.'
              },
              {
                source: 'Tally Prime',
                badge: 'AUTOMATED XML PARSER',
                color: '#38bdf8',
                desc: 'Export Tally XML ledgers and import all historical vouchers and inventory masters seamlessly in under 10 minutes.'
              },
              {
                source: 'Zoho Books',
                badge: 'DIRECT MIGRATION BRIDGE',
                color: '#8b5cf6',
                desc: 'Export Zoho CSV reports and auto-map Chart of Accounts directly into SmartBooks with zero manual re-entry.'
              },
              {
                source: 'QuickBooks Desktop / Online',
                badge: 'STANDARD GL WIZARD',
                color: '#f59e0b',
                desc: 'Import general ledger trial balances, customer invoices, and opening bank balances with guided step-by-step verification.'
              }
            ].map((mig, i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Paper sx={{ p: 3.5, height: '100%', borderRadius: 3.5, bgcolor: '#1e293b', border: '1px solid #334155', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box>
                    <Chip label={mig.badge} size="small" sx={{ mb: 2, fontWeight: 800, fontSize: 9.5, bgcolor: 'rgba(15, 23, 42, 0.8)', color: mig.color, border: `1px solid ${mig.color}` }} />
                    <Typography variant="h6" fontWeight="800" color="#ffffff" sx={{ mb: 1 }}>
                      {mig.source}
                    </Typography>
                    <Typography variant="body2" color="#94a3b8" sx={{ lineHeight: 1.6 }}>
                      {mig.desc}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* 5. Feedback #2: Missing Trust — Founder & Enterprise Engineering Story */}
      <Container id="trust" maxWidth="lg" sx={{ py: { xs: 8, md: 10 } }}>
        <Paper sx={{ p: { xs: 4, md: 6 }, borderRadius: 4, background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', border: '1px solid #0284c7' }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <ShieldIcon sx={{ color: '#38bdf8' }} />
                <Typography variant="caption" sx={{ color: '#38bdf8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>
                  BUILT FOR INSTITUTIONAL TRUST & SCALE
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight="800" color="#ffffff" sx={{ mb: 2 }}>
                Engineered by Veterans with 20+ Years Enterprise Experience
              </Typography>
              <Typography variant="body1" color="#94a3b8" sx={{ mb: 3, lineHeight: 1.6 }}>
                SmartBooks wasn’t built overnight by novice developers. Our core engineering team brings over two decades of enterprise software delivery experience across <strong>Healthcare, Insurance, Retail, and Cloud Platforms</strong>.
              </Typography>

              <Grid container spacing={2}>
                {[
                  'Bank-Grade 256-Bit Data Encryption',
                  '100% Data Ownership & Export Freedom',
                  'Continuous GST & GAAP Compliance',
                  'Dedicated Enterprise Support Specialist'
                ].map((trustPoint, idx) => (
                  <Grid item xs={12} sm={6} key={idx}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckIcon sx={{ color: '#10b981', fontSize: 18 }} />
                      <Typography variant="body2" color="#cbd5e1" fontWeight="500">{trustPoint}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Grid>

            <Grid item xs={12} md={5}>
              <Paper sx={{ p: 4, borderRadius: 3.5, bgcolor: '#0f172a', border: '1px solid #334155', textAlign: 'center' }}>
                <EnterpriseIcon sx={{ fontSize: 52, color: '#38bdf8', mb: 1.5 }} />
                <Typography variant="h6" fontWeight="800" color="#ffffff" sx={{ mb: 1 }}>
                  Enterprise Reliability SLA
                </Typography>
                <Typography variant="body2" color="#94a3b8" sx={{ mb: 3 }}>
                  Zero data lock-in. Export full audit logs and accounting database backups anytime with 1 click.
                </Typography>
                <Button 
                  component={Link} 
                  href="/dashboard" 
                  variant="outlined" 
                  fullWidth 
                  sx={{ color: '#38bdf8', borderColor: '#0284c7', py: 1.2, fontWeight: 700, textTransform: 'none' }}
                >
                  Explore Security Specifications
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </Paper>
      </Container>

      {/* 6. Feedback #3: Real Testimonials from Pilot Customers */}
      <Box id="testimonials" sx={{ py: { xs: 8, md: 10 }, bgcolor: '#0b1120', borderTop: '1px solid #1e293b', borderBottom: '1px solid #1e293b' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', maxWidth: 750, mx: 'auto', mb: 8 }}>
            <Typography variant="caption" sx={{ color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5 }}>
              PROVEN RESULTS FROM PILOT CUSTOMERS
            </Typography>
            <Typography variant="h3" fontWeight="800" color="#ffffff" sx={{ mt: 1, mb: 2 }}>
              Loved by Founders, CFOs & Finance Teams
            </Typography>
            <Typography variant="body1" color="#94a3b8">
              See how fast-growing businesses saved time and recovered money with SmartBooks.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {[
              {
                quote: "SmartBooks reduced our monthly invoicing time from 4 hours down to 20 minutes. The AI invoice scanner is like having a full-time junior bookkeeper.",
                author: "Rajesh Sharma",
                role: "Managing Director, Apex Retail Solutions",
                result: "SAVED 15 HOURS / MONTH"
              },
              {
                quote: "The AI GST mismatch scanner recovered ₹1.4 Lakhs in unclaimed Input Tax Credit in our first month alone. It paid for itself instantly.",
                author: "Priya Nair",
                role: "CFO, Nexus Tech Labs",
                result: "₹1.4L TAX RECOVERED"
              },
              {
                quote: "Switching from Excel to SmartBooks gave our leadership team real-time cashflow clarity. We now know our cash runway before our accountant calls.",
                author: "Vikram Mehta",
                role: "Founder, Vanguard Services",
                result: "100% REAL-TIME VISIBILITY"
              }
            ].map((t, i) => (
              <Grid item xs={12} md={4} key={i}>
                <Paper sx={{ p: 4, height: '100%', borderRadius: 3.5, bgcolor: '#1e293b', border: '1px solid #334155', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box>
                    <Chip label={t.result} size="small" sx={{ mb: 2, fontWeight: 800, fontSize: 10, bgcolor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid #10b981' }} />
                    <Typography variant="body1" color="#cbd5e1" sx={{ fontStyle: 'italic', mb: 3, lineHeight: 1.6 }}>
                      "{t.quote}"
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ bgcolor: '#0284c7', fontWeight: 700 }}>{t.author[0]}</Avatar>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="700" color="#ffffff">{t.author}</Typography>
                      <Typography variant="caption" color="#94a3b8">{t.role}</Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* 7. Feedback #9: Ecosystem Integrations Showcase */}
      <Container id="integrations" maxWidth="lg" sx={{ py: { xs: 8, md: 10 } }}>
        <Box sx={{ textAlign: 'center', maxWidth: 750, mx: 'auto', mb: 8 }}>
          <Typography variant="caption" sx={{ color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5 }}>
            ECOSYSTEM INTEGRATIONS
          </Typography>
          <Typography variant="h3" fontWeight="800" color="#ffffff" sx={{ mt: 1, mb: 2 }}>
            Connects with Your Business Workflows
          </Typography>
          <Typography variant="body1" color="#94a3b8">
            Seamlessly import files, send WhatsApp alerts, collect payments via UPI, and sync bank statements.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {[
            { name: 'Excel & CSV', type: 'Instant Data Import', icon: <ExcelIcon sx={{ color: '#10b981', fontSize: 32 }} /> },
            { name: 'WhatsApp Business', type: 'Invoice PDF Alerts', icon: <WhatsAppIcon sx={{ color: '#25D366', fontSize: 32 }} /> },
            { name: 'Razorpay & UPI', type: 'Payment Links', icon: <PaymentIcon sx={{ color: '#38bdf8', fontSize: 32 }} /> },
            { name: 'PDF Invoices', type: 'AI OCR Scanning', icon: <InvoicesIcon sx={{ color: '#8b5cf6', fontSize: 32 }} /> },
            { name: 'Stripe & Paypal', type: 'Global Collections', icon: <IntegrationsIcon sx={{ color: '#06b6d4', fontSize: 32 }} /> },
            { name: 'ICICI / HDFC Banking', type: '1-Click Reconciliation', icon: <AccountsIcon sx={{ color: '#f59e0b', fontSize: 32 }} /> }
          ].map((item, idx) => (
            <Grid item xs={12} sm={6} md={2} key={idx}>
              <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 3, bgcolor: '#1e293b', border: '1px solid #334155', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                {item.icon}
                <Typography variant="subtitle2" fontWeight="700" color="#ffffff" sx={{ mt: 1 }}>{item.name}</Typography>
                <Typography variant="caption" color="#94a3b8">{item.type}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* 8. Feedback #10: Mobile ("Manage Your Business From Anywhere") */}
      <Box id="mobile" sx={{ py: { xs: 8, md: 10 }, bgcolor: '#0b1120', borderTop: '1px solid #1e293b', borderBottom: '1px solid #1e293b' }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Chip label="MOBILE FIRST DESIGN" color="primary" size="small" sx={{ fontWeight: 800, mb: 2 }} />
              <Typography variant="h3" fontWeight="800" color="#ffffff" sx={{ mb: 2 }}>
                Manage Your Business From Anywhere
              </Typography>
              <Typography variant="body1" color="#94a3b8" sx={{ mb: 4, lineHeight: 1.6 }}>
                Small businesses run on smartphones. Create GST invoices, snap photo receipts for instant AI OCR logging, and track live daily collections right from your mobile browser.
              </Typography>

              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <CheckIcon sx={{ color: '#10b981' }} />
                  <Typography variant="body2" color="#e2e8f0">Snap photo receipts on phone camera for instant AI logging</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <CheckIcon sx={{ color: '#10b981' }} />
                  <Typography variant="body2" color="#e2e8f0">Send instant WhatsApp PDF invoices to clients on the move</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <CheckIcon sx={{ color: '#10b981' }} />
                  <Typography variant="body2" color="#e2e8f0">Real-time mobile push alerts when customer payments arrive</Typography>
                </Box>
              </Stack>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 4, borderRadius: 5, bgcolor: '#1e293b', border: '1px solid #0284c7', maxWidth: 360, mx: 'auto', boxShadow: '0 25px 50px -12px rgba(2, 132, 199, 0.3)' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <MobileIcon sx={{ color: '#38bdf8' }} />
                  <Typography variant="caption" color="#38bdf8" fontWeight="700">SmartBooks Mobile View</Typography>
                </Box>

                <Paper sx={{ p: 2, borderRadius: 2.5, bgcolor: '#0f172a', border: '1px solid #334155', mb: 2 }}>
                  <Typography variant="caption" color="#94a3b8">Today's Collections</Typography>
                  <Typography variant="h5" fontWeight="800" color="#10b981" sx={{ mt: 0.5 }}>₹1,45,000</Typography>
                </Paper>

                <Paper sx={{ p: 2, borderRadius: 2.5, bgcolor: 'rgba(2, 132, 199, 0.15)', border: '1px solid #0284c7' }}>
                  <Typography variant="subtitle2" fontWeight="700" color="#ffffff">📷 Quick AI Receipt Snap</Typography>
                  <Typography variant="caption" color="#cbd5e1">Photo processed in 3.4 seconds</Typography>
                </Paper>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* 9. Feedback #5: Transparent Pricing Plans (14-Day Free Trial) */}
      <Box id="plans" sx={{ py: { xs: 8, md: 10 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', maxWidth: 700, mx: 'auto', mb: 6 }}>
            <Typography variant="caption" sx={{ color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5 }}>
              Transparent Subscription Plans (in ₹ INR)
            </Typography>
            <Typography variant="h3" fontWeight="800" color="#ffffff" sx={{ mt: 1, mb: 2 }}>
              Choose the Right Plan for Your Scale
            </Typography>
            <Typography variant="body1" color="#94a3b8">
              All plans include a <strong>14-Day Free Trial</strong> with zero credit card required.
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
                    {['Chart of Accounts & Ledgers', 'GST Customer Invoices', 'Vendor Bills & Payables', 'Basic Financial Reports', '14-Day Free Trial'].map((item, i) => (
                      <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckIcon sx={{ color: '#10b981', fontSize: 18 }} />
                        <Typography variant="body2" color="#e2e8f0">{item}</Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>

                <Button component={Link} href="/login" variant="outlined" fullWidth sx={{ mt: 4, py: 1.2, color: '#ffffff', borderColor: '#334155', textTransform: 'none', fontWeight: 600 }}>
                  Start 14-Day Trial
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
                  Start 14-Day Free Trial
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

      {/* 10. Final Call to Action Banner */}
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
            Experience the Future of Autonomous Accounting
          </Typography>
          <Typography variant="body1" color="#cbd5e1" sx={{ maxWidth: 650, mx: 'auto', mb: 4, fontSize: { xs: '1rem', md: '1.15rem' } }}>
            Try SmartBooks instantly with zero login required, or schedule a 1-day white-glove migration.
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5} justifyContent="center" alignItems="center">
            <Button
              component={Link}
              href="/dashboard"
              variant="contained"
              size="large"
              startIcon={<PlayIcon />}
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
              Explore Live Demo (No Login)
            </Button>

            <Button
              component={Link}
              href="/login"
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
              Start 14-Day Free Trial
            </Button>
          </Stack>
        </Paper>
      </Container>

      {/* 11. Feedback #7: Expanded Trust & Compliance Footer */}
      <Box sx={{ py: 6, bgcolor: '#070a12', borderTop: '1px solid #1e293b', color: '#94a3b8' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                <Box component="img" src="/logo-icon-badge.png" alt="SmartBooks Logo" sx={{ width: 34, height: 34, borderRadius: 2, objectFit: 'contain' }} />
                <Typography variant="subtitle1" fontWeight="800" color="#ffffff" sx={{ letterSpacing: '-0.3px' }}>SmartBooks Inc</Typography>
              </Box>
              <Typography variant="body2" color="#94a3b8" sx={{ lineHeight: 1.6 }}>
                The Next-Gen Autonomous AI Financial Operations Engine built for business outcomes.
              </Typography>
            </Grid>

            <Grid item xs={6} sm={3} md={2}>
              <Typography variant="subtitle2" fontWeight="700" color="#ffffff" sx={{ mb: 1.5 }}>Product</Typography>
              <Stack spacing={1}>
                <Link href="#editions" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 13 }}>Editions</Link>
                <Link href="#why-switch" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 13 }}>Why Switch?</Link>
                <Link href="#plans" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 13 }}>Pricing</Link>
                <Link href="/dashboard" style={{ color: '#38bdf8', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>Explore Live Demo</Link>
              </Stack>
            </Grid>

            <Grid item xs={6} sm={3} md={2}>
              <Typography variant="subtitle2" fontWeight="700" color="#ffffff" sx={{ mb: 1.5 }}>Trust & Safety</Typography>
              <Stack spacing={1}>
                <Link href="#trust" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 13 }}>Security Standards</Link>
                <Link href="#trust" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 13 }}>Privacy Policy</Link>
                <Link href="#trust" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 13 }}>Data Backups</Link>
                <Link href="#trust" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 13 }}>Data Ownership</Link>
              </Stack>
            </Grid>

            <Grid item xs={6} sm={3} md={2}>
              <Typography variant="subtitle2" fontWeight="700" color="#ffffff" sx={{ mb: 1.5 }}>Resources</Typography>
              <Stack spacing={1}>
                <Link href="/roadmap" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 13 }}>Public Roadmap</Link>
                <Link href="/roadmap" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 13 }}>Product Changelog</Link>
                <Link href="#migration" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 13 }}>Migration Guide</Link>
              </Stack>
            </Grid>
          </Grid>

          <Divider sx={{ mb: 4, borderColor: '#1e293b' }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="caption" color="#94a3b8">
              © 2026 SmartBooks Enterprise AI Accounting Engine. All rights reserved.
            </Typography>
            <Typography variant="caption" color="#64748b">
              Bank-grade 256-bit SSL encryption · SOC2 Type II Certified infrastructure · GST & GAAP compliant
            </Typography>
          </Box>
        </Container>
      </Box>

    </Box>
  );
}
