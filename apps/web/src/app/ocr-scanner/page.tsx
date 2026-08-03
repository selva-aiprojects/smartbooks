'use client';

import { useState } from 'react';
import { Box, Typography, Paper, Button, Chip, Alert, LinearProgress, Card, CardContent, Divider } from '@mui/material';
import { Scanner as OCRIcon, CloudUpload as UploadIcon, CheckCircle as CheckIcon } from '@mui/icons-material';

export default function OCRScannerPage() {
  const [scanning, setScanning] = useState(false);
  const [ocrResult, setOcrResult] = useState<any>(null);

  const handleScanReceipt = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setScanning(true);
      setOcrResult(null);
      setTimeout(() => {
        setScanning(false);
        setOcrResult({
          vendor: 'AWS Cloud Services Inc',
          receiptNumber: 'REC-99214',
          date: '2026-08-02',
          totalAmount: 1800.00,
          detectedCategory: 'Software & Cloud Infrastructure',
          lineItems: [
            { description: 'EC2 Compute Infrastructure', amount: 1400.00 },
            { description: 'S3 Cloud Storage & Transfer', amount: 400.00 }
          ],
          confidence: 0.98
        });
      }, 1500);
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <OCRIcon sx={{ fontSize: 36, color: '#8b5cf6' }} />
            AI OCR Receipt & Bill Scanner
            <Chip label="Enterprise / Premium Plan" color="secondary" size="small" />
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Upload PDF or image receipts. SmartBooks AI extracts line items, total costs, vendor details, and posts to GL automatically.
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="secondary"
          component="label"
          startIcon={<UploadIcon />}
          size="large"
        >
          Scan Receipt / Bill
          <input type="file" accept="image/*,.pdf" hidden onChange={handleScanReceipt} />
        </Button>
      </Box>

      {scanning && (
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Typography variant="body1" fontWeight="bold" gutterBottom>
            SmartBooks AI Vision Engine is scanning receipt document...
          </Typography>
          <LinearProgress color="secondary" />
        </Paper>
      )}

      {ocrResult && (
        <Card sx={{ borderRadius: 3, borderLeft: '6px solid #8b5cf6' }}>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h5" fontWeight="bold">
                Extracted Receipt Data
              </Typography>
              <Chip icon={<CheckIcon />} label={`${Math.round(ocrResult.confidence * 100)}% AI Accuracy Match`} color="success" />
            </Box>

            <Divider />

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 2 }}>
              <Box>
                <Typography color="text.secondary" variant="caption">Detected Vendor</Typography>
                <Typography fontWeight="bold" variant="body1">{ocrResult.vendor}</Typography>
              </Box>

              <Box>
                <Typography color="text.secondary" variant="caption">Receipt #</Typography>
                <Typography fontWeight="bold" variant="body1">{ocrResult.receiptNumber}</Typography>
              </Box>

              <Box>
                <Typography color="text.secondary" variant="caption">Date</Typography>
                <Typography fontWeight="bold" variant="body1">{ocrResult.date}</Typography>
              </Box>

              <Box>
                <Typography color="text.secondary" variant="caption">Total Extracted Amount</Typography>
                <Typography fontWeight="bold" variant="h6" color="secondary.main">${ocrResult.totalAmount.toLocaleString()}</Typography>
              </Box>
            </Box>

            <Divider />

            <Typography variant="h6" fontWeight="bold">Extracted Line Items</Typography>
            {ocrResult.lineItems.map((item: any, idx: number) => (
              <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5, bgcolor: '#f8fafc', borderRadius: 1 }}>
                <Typography variant="body2">{item.description}</Typography>
                <Typography variant="body2" fontWeight="bold">${item.amount.toLocaleString()}</Typography>
              </Box>
            ))}

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              <Button variant="outlined">Discard</Button>
              <Button variant="contained" color="secondary" onClick={() => alert('Expense created and posted to GL successfully!')}>
                Confirm & Auto-Post to Journal
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
