import { Container, Box, Typography } from '@mui/material';
import JournalEntryForm from '../components/JournalEntryForm';

export default function NewJournalEntryPage() {
  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Create Journal Entry
        </Typography>
        <JournalEntryForm />
      </Box>
    </Container>
  );
}
