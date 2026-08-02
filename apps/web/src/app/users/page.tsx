import { Box, Button, Typography } from '@mui/material';
import Link from 'next/link';
import UsersTable from './components/UsersTable';

export default function UsersPage() {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">User Management</Typography>
        <Button 
          variant="contained" 
          component={Link}
          href="/users/new"
        >
          Add User
        </Button>
      </Box>
      
      <UsersTable />
    </Box>
  );
}
