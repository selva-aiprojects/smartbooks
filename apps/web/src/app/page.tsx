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
  Switch
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
  Lock as LockIcon
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
                <Chip label="Enterprise" size="small" sx={{ bgcolor: 'rgba(2, 132, 199, 0.2)', border: '1px solid #0284c7', color: '#38bdf8', fontWeight: 700, fontSize: 10.5, height: 22 }} />
              </Box>
            </Box>

            <Stack direction="row" spacing={3} sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
              <Link href="#features" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>Features</Link>
              <Link href="#architecture" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>Architecture</Link>
              <Link href="#plans" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>Subscription Plans</Link>
              <Link href="#roi-calculator" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>ROI Calculator</Link>
              <Link href="#security" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>Security & Trust</Link>
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
                Launch Workspace
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* 2. Hero Section */}
      <Container maxWidth="lg" sx={{ pt: { xs: 8, md: 12 }, pb: { xs: 8, md: 10 } }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 2, py: 0.75, borderRadius: 5, bgcolor: '#1e293b', border: '1px solid #334155', mb: 3 }}>
              <StarIcon sx={{ color: '#f59e0b', fontSize: 18 }} />
              <Typography variant="caption" sx={{ color: '#38bdf8', fontWeight: 600 }}>
                Rated #1 Autonomous Accounting Platform for 2026
              </Typography>
            </Box>

            <Typography variant="h2" component="h1" fontWeight="800" sx={{ fontSize: { xs: '2.5rem', md: '3.5rem' }, lineHeight: 1.15, letterSpacing: '-1px', mb: 2.5 }}>
              The Intelligent Financial Engine for <Box component="span" sx={{ background: 'linear-gradient(90deg, #38bdf8 0%, #8b5cf6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Indian Enterprises</Box>
            </Typography>

            <Typography variant="h6" sx={{ color: '#94a3b8', fontWeight: 400, lineHeight: 1.6, mb: 4, fontSize: { xs: '1rem', md: '1.15rem' } }}>
              Streamline general ledgers, automate GST/VAT invoicing, track vendor payables, and run real-time bank reconciliation with AI OCR vision and continuous compliance.
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
                Start Free 14-Day Trial
              </Button>

              <Button 
                component={Link} 
                href="#plans" 
                variant="outlined" 
                size="large"
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
                Explore Plans (in ₹)
              </Button>
            </Stack>

            <Stack direction="row" spacing={3} alignItems="center">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckIcon sx={{ color: '#10b981', fontSize: 18 }} />
                <Typography variant="caption" color="#cbd5e1">No Credit Card Required</Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckIcon sx={{ color: '#10b981', fontSize: 18 }} />
                <Typography variant="caption" color="#cbd5e1">GST & GAAP Compliant</Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckIcon sx={{ color: '#10b981', fontSize: 18 }} />
                <Typography variant="caption" color="#cbd5e1">SOC2 Type II Certified</Typography>
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
                <Chip label="Live Production Suite" color="success" size="small" />
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
                <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#0f172a', border: '1px solid #1e293b' }}>
                  <Typography variant="caption" color="#94a3b8">Total Monthly Revenue</Typography>
                  <Typography variant="h5" fontWeight="bold" color="#38bdf8" sx={{ mt: 0.5 }}>₹12,45,000</Typography>
                  <Typography variant="caption" color="#10b981">+18.4% vs last month</Typography>
                </Box>

                <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#0f172a', border: '1px solid #1e293b' }}>
                  <Typography variant="caption" color="#94a3b8">Bank Reconciliation</Typography>
                  <Typography variant="h5" fontWeight="bold" color="#10b981" sx={{ mt: 0.5 }}>100% Matched</Typography>
                  <Typography variant="caption" color="#38bdf8">142 Entries Cleared</Typography>
                </Box>
              </Box>

              <Paper sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(2, 132, 199, 0.1)', border: '1px solid #0284c7' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <AIIcon sx={{ color: '#38bdf8' }} />
                  <Typography variant="subtitle2" fontWeight="bold" color="#f8fafc">SmartBooks AI Assistant Log</Typography>
                </Box>
                <Typography variant="body2" color="#cbd5e1">
                  "Scanned vendor bill from AWS India (₹14,500). Auto-mapped to GL Account 5020 (Software & Cloud) with 98% confidence."
                </Typography>
              </Paper>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* 3. Enterprise Social Proof */}
      <Box sx={{ py: 5, bgcolor: '#0b1120', borderTop: '1px solid #1e293b', borderBottom: '1px solid #1e293b' }}>
        <Container maxWidth="lg">
          <Typography variant="caption" display="block" align="center" sx={{ color: '#38bdf8', textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 700, mb: 3 }}>
            Trusted by CFOs and Finance Teams at Fast-Growing Companies
          </Typography>

          <Stack direction="row" spacing={{ xs: 3, md: 8 }} justifyContent="center" alignItems="center" flexWrap="wrap">
            {['Nexus Global', 'Vanguard India', 'Apex Digital', 'TechCraft Labs', 'OmniPay Solutions'].map((brand, i) => (
              <Typography key={i} variant="h6" fontWeight="bold" sx={{ color: '#cbd5e1', letterSpacing: '-0.5px', opacity: 0.9 }}>
                {brand}
              </Typography>
            ))}
          </Stack>
        </Container>
      </Box>

      {/* 4. Core Feature Showcase Section */}
      <Container id="features" maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <Box sx={{ textAlign: 'center', maxWidth: 700, mx: 'auto', mb: 8 }}>
          <Typography variant="caption" sx={{ color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5 }}>
            Enterprise Capabilities
          </Typography>
          <Typography variant="h3" fontWeight="800" color="#ffffff" sx={{ mt: 1, mb: 2, letterSpacing: '-0.5px' }}>
            Everything Needed to Run Modern Financial Operations
          </Typography>
          <Typography variant="body1" color="#94a3b8">
            From double-entry journal balance enforcement to generative AI receipt OCR scanning and automated bank feed reconciliation.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {[
            {
              icon: <AccountsIcon sx={{ fontSize: 32, color: '#38bdf8' }} />,
              title: 'Double-Entry General Ledger',
              description: 'Strict GAAP double-entry ledger enforcement ensures total Debits equal total Credits for 100% mathematical precision.'
            },
            {
              icon: <InvoicesIcon sx={{ fontSize: 32, color: '#10b981' }} />,
              title: 'Invoices & GST Bills Management',
              description: 'Create customer invoices with GST calculations, track payment status, record vendor bills, and auto-post revenue journal entries.'
            },
            {
              icon: <AutoFixIcon sx={{ fontSize: 32, color: '#8b5cf6' }} />,
              title: '1-Click Bank Reconciliation',
              description: 'Import bank CSV feeds and automatically match bank transactions against posted journal entries with zero manual effort.'
            },
            {
              icon: <AIIcon sx={{ fontSize: 32, color: '#f59e0b' }} />,
              title: 'AI OCR Vision & Bookkeeper',
              description: 'Scan PDF or photo receipts. SmartBooks AI extracts line items, totals, vendor details, and maps them to your Chart of Accounts.'
            },
            {
              icon: <TrendingUpIcon sx={{ fontSize: 32, color: '#ec4899' }} />,
              title: 'Financial Forecasting & Runway',
              description: 'Predict 12-month revenue growth, monitor burn rate, and simulate cash runway scenarios based on historical general ledger data.'
            },
            {
              icon: <IntegrationsIcon sx={{ fontSize: 32, color: '#06b6d4' }} />,
              title: 'Open Banking & Integrations',
              description: 'Sync seamlessly with UPI, Razorpay, Stripe, PayPal, Shopify, and Zapier to centralize all company financial flows in one place.'
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
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    borderColor: '#0284c7'
                  }
                }}
              >
                <Box sx={{ mb: 2, p: 1.5, borderRadius: 2, bgcolor: '#0f172a', display: 'inline-block' }}>
                  {feature.icon}
                </Box>
                <Typography variant="h6" fontWeight="700" sx={{ mb: 1, color: '#f8fafc' }}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" sx={{ color: '#94a3b8', lineHeight: 1.6 }}>
                  {feature.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* 5. Subscription Matrix Section (in INR ₹) */}
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
                  Get Started
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

      {/* 6. Interactive Financial ROI Calculator (in ₹ INR) */}
      <Container id="roi-calculator" maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <Paper sx={{ p: { xs: 4, md: 6 }, borderRadius: 4, background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', border: '1px solid #334155' }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="caption" sx={{ color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5 }}>
                Financial ROI Calculator
              </Typography>
              <Typography variant="h3" fontWeight="800" color="#ffffff" sx={{ mt: 1, mb: 2 }}>
                See How Much Time & Money SmartBooks Saves
              </Typography>
              <Typography variant="body1" color="#94a3b8" sx={{ mb: 4 }}>
                Adjust team size and invoice volume to calculate your organization's monthly hours saved.
              </Typography>

              <Box sx={{ mb: 4 }}>
                <Typography variant="body2" color="#e2e8f0" fontWeight="600" gutterBottom>
                  Finance & Accounting Team Size: <strong>{teamSize} Members</strong>
                </Typography>
                <Slider 
                  value={teamSize} 
                  onChange={(e, v) => setTeamSize(v as number)} 
                  min={1} 
                  max={25} 
                  sx={{ color: '#38bdf8' }}
                />
              </Box>

              <Box>
                <Typography variant="body2" color="#e2e8f0" fontWeight="600" gutterBottom>
                  Monthly Invoices & Bills Processed: <strong>{monthlyInvoices} Items</strong>
                </Typography>
                <Slider 
                  value={monthlyInvoices} 
                  onChange={(e, v) => setMonthlyInvoices(v as number)} 
                  min={20} 
                  max={1000} 
                  step={10} 
                  sx={{ color: '#8b5cf6' }}
                />
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 4, borderRadius: 3, bgcolor: '#0f172a', border: '1px solid #0284c7', textAlign: 'center' }}>
                <CalculateIcon sx={{ fontSize: 48, color: '#38bdf8', mb: 1 }} />
                <Typography variant="body2" color="#94a3b8" fontWeight="500">Estimated Monthly Productivity Gain</Typography>
                <Typography variant="h2" fontWeight="800" color="#38bdf8" sx={{ my: 1 }}>
                  {hoursSavedPerMonth} Hours
                </Typography>
                <Typography variant="body2" color="#10b981" fontWeight="600" sx={{ mb: 3 }}>
                  ≈ ₹{estimatedRupeeSavings.toLocaleString('en-IN')} Saved / Month in Finance Labor
                </Typography>

                <Button component={Link} href="/login" variant="contained" fullWidth size="large" sx={{ bgcolor: '#0284c7', py: 1.5, fontWeight: 600, textTransform: 'none' }}>
                  Start Saving Time with SmartBooks
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </Paper>
      </Container>

      {/* 6.5 Enterprise Technical Architecture & Infrastructure (For Technical Buyers) */}
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

      {/* 7. Security & Compliance Guarantee */}
      <Box id="security" sx={{ py: 8, bgcolor: '#0b1120', borderTop: '1px solid #1e293b' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <ShieldIcon sx={{ fontSize: 40, color: '#10b981' }} />
                <Box>
                  <Typography variant="h6" fontWeight="bold" color="#ffffff">256-Bit SSL Encryption</Typography>
                  <Typography variant="body2" color="#94a3b8">Bank-grade data encryption in transit and at rest.</Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <VerifiedIcon sx={{ fontSize: 40, color: '#38bdf8' }} />
                <Box>
                  <Typography variant="h6" fontWeight="bold" color="#ffffff">SOC2 Type II Compliant</Typography>
                  <Typography variant="body2" color="#94a3b8">Audited data security and operational standards.</Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <LockIcon sx={{ fontSize: 40, color: '#8b5cf6' }} />
                <Box>
                  <Typography variant="h6" fontWeight="bold" color="#ffffff">Multi-Tenant Isolation</Typography>
                  <Typography variant="body2" color="#94a3b8">Complete database organization data separation.</Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* 8. Footer */}
      <Box sx={{ py: 6, bgcolor: '#070a12', borderTop: '1px solid #1e293b', color: '#94a3b8' }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box component="img" src="/logo-icon-badge.png" alt="SmartBooks Logo" sx={{ width: 34, height: 34, borderRadius: 2, objectFit: 'contain' }} />
              <Typography variant="subtitle1" fontWeight="800" color="#ffffff" sx={{ letterSpacing: '-0.3px' }}>SmartBooks Inc</Typography>
            </Box>

            <Typography variant="body2" color="#94a3b8">
              © 2026 SmartBooks Enterprise Accounting Platform. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>

    </Box>
  );
}
