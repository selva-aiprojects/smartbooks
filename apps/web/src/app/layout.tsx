import { AuthProvider } from '../context/AuthContext';
import { TenantProvider } from '../context/TenantContext';
import AppShell from '../components/AppShell';

export const metadata = {
  title: 'SmartBooks - Enterprise Autonomous AI Accounting Platform',
  description: 'Intelligent Enterprise Autonomous AI Accounting Engine',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon.png', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
      </head>
      <body style={{ margin: 0, fontFamily: 'Roboto, sans-serif', backgroundColor: '#f8fafc' }} suppressHydrationWarning>
        <AuthProvider>
          <TenantProvider>
            <AppShell>
              {children}
            </AppShell>
          </TenantProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
