import { Box, Button, Typography } from '@mui/material';
import Link from 'next/link';

export default function JournalPage() {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Journal Entries</Typography>
        <Button 
          variant="contained" 
          component={Link}
          href="/journal/new"
        >
          New Entry
        </Button>
      </Box>
      
      {/* TODO: Add journal entries table */}
    </Box>
  );
}
