'use client';

import { useRouter } from 'next/navigation';
import { Box, Typography, Paper, Grid, Button } from '@mui/material';
import PaymentsIcon from '@mui/icons-material/Payments';
import SavingsIcon from '@mui/icons-material/Savings';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

const types = [
  { value: 'payment', label: 'Payment Voucher (F8)', desc: 'Money paid out (vendors, expenses)', icon: <PaymentsIcon />, accent: '#dc2626' },
  { value: 'receipt', label: 'Receipt Voucher (F6)', desc: 'Money received (customers, income)', icon: <SavingsIcon />, accent: '#16a34a' },
  { value: 'sales', label: 'Sales Voucher (F5)', desc: 'Record a credit sale to a customer', icon: <PointOfSaleIcon />, accent: '#0284c7' },
  { value: 'purchase', label: 'Purchase Voucher (F4)', desc: 'Record a credit purchase from a vendor', icon: <ShoppingCartIcon />, accent: '#ea580c' },
  { value: 'journal', label: 'Journal Voucher (F7)', desc: 'Direct double-entry adjustment', icon: <MenuBookIcon />, accent: '#7c3aed' },
  { value: 'contra', label: 'Contra Voucher (F9)', desc: 'Transfer between cash & bank', icon: <SwapHorizIcon />, accent: '#0d9488' },
];

export default function VouchersIndexPage() {
  const router = useRouter();
  return (
    <Box sx={{ flexGrow: 1, p: 0.5 }}>
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="h4" fontWeight="bold">Accounting Vouchers</Typography>
        <Typography variant="body2" color="text.secondary">
          Choose a voucher type to enter a transaction. Each entry is posted automatically to the Day Book, Ledgers and reports.
        </Typography>
      </Box>
      <Grid container spacing={2}>
        {types.map((t) => (
          <Grid item xs={12} sm={6} md={4} key={t.value}>
            <Paper
              sx={{
                p: 2.5, borderRadius: 3, cursor: 'pointer', borderTop: `4px solid ${t.accent}`,
                transition: 'transform .15s, box-shadow .15s',
                '&:hover': { transform: 'translateY(-3px)', boxShadow: 5 },
              }}
              onClick={() => router.push(`/vouchers/new?type=${t.value}`)}
            >
              <Box sx={{ color: t.accent, mb: 1 }}>{t.icon}</Box>
              <Typography variant="h6" fontWeight="bold" sx={{ fontSize: 15 }}>{t.label}</Typography>
              <Typography variant="caption" color="text.secondary">{t.desc}</Typography>
              <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', color: t.accent }}>
                <Button size="small" sx={{ color: t.accent }} endIcon={<ArrowForwardIosIcon sx={{ fontSize: 12 }} />}>Enter</Button>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
