'use client';

import { Box, Typography, Card, CardContent, Button } from '@mui/material';
import Link from 'next/link';
import { ArrowBack } from '@mui/icons-material';

export default function JournalEntryPage({ params }: { params: { id: string } }) {
  const entry = {
    id: params.id,
    date: '2026-08-02',
    description: 'Sample Journal Entry',
    status: 'Posted',
    lines: [
      { account: 'Cash', debit: 1000, credit: 0 },
      { account: 'Revenue', debit: 0, credit: 1000 }
    ]
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Button 
          component={Link}
          href="/journal"
          startIcon={<ArrowBack />}
        >
          Back to Journal
        </Button>
      </Box>

      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Journal Entry #{entry.id}
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mt: 2 }}>
            <Box>
              <Typography variant="subtitle1">Date:</Typography>
              <Typography>{entry.date}</Typography>
            </Box>
            
            <Box>
              <Typography variant="subtitle1">Status:</Typography>
              <Typography>{entry.status}</Typography>
            </Box>

            <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 2' } }}>
              <Typography variant="subtitle1">Description:</Typography>
              <Typography>{entry.description}</Typography>
            </Box>

            <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 2' } }}>
              <Typography variant="h6" sx={{ mt: 2 }}>Lines:</Typography>
              <Box sx={{ mt: 1 }}>
                {entry.lines.map((line, index) => (
                  <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #eee' }}>
                    <Typography>Account: {line.account}</Typography>
                    <Typography>Debit: ${line.debit}</Typography>
                    <Typography>Credit: ${line.credit}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
