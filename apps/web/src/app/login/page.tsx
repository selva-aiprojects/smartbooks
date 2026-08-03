'use client';

import LoginForm from './components/LoginForm';
import { Box, Container, Typography, Paper, Grid, Stack, Chip, Divider, Avatar } from '@mui/material';
import { 
  AccountBalance as AccountsIcon, 
  Shield as ShieldIcon, 
  VerifiedUser as VerifiedIcon, 
  Lock as LockIcon,
  CheckCircle as CheckIcon,
  Star as StarIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <Grid container sx={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
      
      {/* Left Column: Brand Confidence Showcase (Dark Slate Theme) */}
      <Grid 
        item 
        xs={12} 
        md={6} 
        sx={{ 
          display: { xs: 'none', md: 'flex' }, 
          flexDirection: 'column', 
          justifyContent: 'space-between',
          p: 6, 
          backgroundColor: '#0f172a', 
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 5 }}>
            <Box component="img" src="/logo-icon-badge.png" alt="SmartBooks Logo" sx={{ width: 52, height: 52, borderRadius: 3, boxShadow: '0 8px 24px rgba(2, 132, 199, 0.35)', objectFit: 'contain' }} />
            <Box>
              <Typography variant="h5" fontWeight="800" color="#ffffff" sx={{ letterSpacing: '-0.5px', lineHeight: 1.1 }}>
                SmartBooks
              </Typography>
              <Chip label="Enterprise Edition" size="small" sx={{ mt: 0.5, bgcolor: 'rgba(2, 132, 199, 0.2)', border: '1px solid #0284c7', color: '#38bdf8', fontWeight: 700, fontSize: 10, height: 20 }} />
            </Box>
          </Box>

          <Typography variant="h3" fontWeight="800" sx={{ mb: 2, lineHeight: 1.2, letterSpacing: '-0.5px' }}>
            Confident, Bank-Grade <br />
            <Box component="span" sx={{ background: 'linear-gradient(90deg, #38bdf8 0%, #8b5cf6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Financial Intelligence
            </Box>
          </Typography>

          <Typography variant="body1" sx={{ color: '#94a3b8', maxWidth: 480, mb: 4, lineHeight: 1.6 }}>
            Access your isolated organization ledger, real-time balance sheet reports, automated invoicing engine, and AI transaction auditor.
          </Typography>

          {/* Security Compliance Pills */}
          <Stack spacing={2} sx={{ maxWidth: 440, mb: 4 }}>
            <Paper sx={{ p: 2, bgcolor: '#1e293b', border: '1px solid #334155', borderRadius: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
              <ShieldIcon sx={{ color: '#10b981', fontSize: 28 }} />
              <Box>
                <Typography variant="subtitle2" fontWeight="bold" color="#f8fafc">SOC2 Type II & ISO 27001 Compliant</Typography>
                <Typography variant="caption" color="#94a3b8">Audited operational security and data privacy safeguards.</Typography>
              </Box>
            </Paper>

            <Paper sx={{ p: 2, bgcolor: '#1e293b', border: '1px solid #334155', borderRadius: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
              <VerifiedIcon sx={{ color: '#38bdf8', fontSize: 28 }} />
              <Box>
                <Typography variant="subtitle2" fontWeight="bold" color="#f8fafc">100% GAAP & IFRS Accounting Rigor</Typography>
                <Typography variant="caption" color="#94a3b8">Mathematical double-entry balance enforcement at every transaction.</Typography>
              </Box>
            </Paper>
          </Stack>
        </Box>

        {/* CFO Testimonial */}
        <Paper sx={{ p: 3, bgcolor: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: 3, backdropFilter: 'blur(10px)', position: 'relative', zIndex: 2 }}>
          <Stack direction="row" spacing={0.5} sx={{ mb: 1 }}>
            {[...Array(5)].map((_, i) => (
              <StarIcon key={i} sx={{ color: '#f59e0b', fontSize: 16 }} />
            ))}
          </Stack>
          <Typography variant="body2" color="#e2e8f0" sx={{ fontStyle: 'italic', mb: 1.5 }}>
            "SmartBooks reduced our month-end close cycle from 12 days to under 4 hours while maintaining 100% audit accuracy."
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ bgcolor: '#0284c7', width: 32, height: 32, fontSize: 13 }}>SC</Avatar>
            <Box>
              <Typography variant="caption" fontWeight="bold" display="block" color="#f8fafc">Sarah Jenkins</Typography>
              <Typography variant="caption" color="#94a3b8">Chief Financial Officer, Nexus Global Tech</Typography>
            </Box>
          </Box>
        </Paper>
      </Grid>

      {/* Right Column: Authentication Login Form */}
      <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', p: { xs: 3, sm: 6, md: 8 } }}>
        <Box sx={{ maxWidth: 440, mx: 'auto', width: '100%' }}>
          
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Link href="/" style={{ textDecoration: 'none', color: '#64748b', fontSize: 14, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <ArrowBackIcon sx={{ fontSize: 16 }} /> Back to Home
              </Link>
              
              <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1 }}>
                <Box component="img" src="/logo-icon-badge.png" alt="SmartBooks" sx={{ width: 32, height: 32, borderRadius: 2 }} />
                <Typography variant="subtitle2" fontWeight="800" color="#0f172a">SmartBooks</Typography>
              </Box>
            </Box>

            <Typography variant="h4" fontWeight="800" color="#0f172a" sx={{ mt: 2, mb: 1 }}>
              Welcome Back
            </Typography>
            <Typography variant="body2" color="#64748b">
              Enter your enterprise credentials to access your SmartBooks workspace.
            </Typography>
          </Box>

          <LoginForm />
        </Box>
      </Grid>

    </Grid>
  );
}
