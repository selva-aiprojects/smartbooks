import { Box, Typography, Card, CardContent, Grid } from '@mui/material';
import Link from 'next/link';
import { ArrowBack } from '@mui/icons-material';

export default function JournalEntryPage({ params }: { params: { id: string } }) {
  // TODO: Fetch entry data from API
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

          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1">Date:</Typography>
              <Typography>{entry.date}</Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1">Status:</Typography>
              <Typography>{entry.status}</Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1">Description:</Typography>
              <Typography>{entry.description}</Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mt: 2 }}>Lines:</Typography>
              <Box sx={{ mt: 1 }}>
                {entry.lines.map((line, index) => (
                  <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #eee' }}>
                    <Typography>Account: {line.account}</Typography>
                    <Typography>Debit: {line.debit}</Typography>
                    <Typography>Credit: {line.credit}</Typography>
                  </Box>
                ))}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
