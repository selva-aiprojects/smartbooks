'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Box, LinearProgress, CircularProgress } from '@mui/material';

export default function NavigationProgress() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // When pathname changes, start progress animation and complete it
    setLoading(true);
    setProgress(30);

    const timer1 = setTimeout(() => setProgress(70), 100);
    const timer2 = setTimeout(() => setProgress(100), 250);
    const timer3 = setTimeout(() => {
      setLoading(false);
      setProgress(0);
    }, 450);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [pathname]);

  // Intercept click on links to show immediate feedback progress
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (target && target.href && target.href.startsWith(window.location.origin)) {
        const url = new URL(target.href);
        if (url.pathname !== window.location.pathname) {
          setLoading(true);
          setProgress(40);
        }
      }
    };

    document.addEventListener('click', handleLinkClick);
    return () => document.removeEventListener('click', handleLinkClick);
  }, []);

  if (!loading && progress === 0) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 99999,
        pointerEvents: 'none',
      }}
    >
      <LinearProgress
        variant={progress > 0 ? 'determinate' : 'indeterminate'}
        value={progress}
        sx={{
          height: 3,
          bgcolor: 'rgba(2, 132, 199, 0.15)',
          '& .MuiLinearProgress-bar': {
            background: 'linear-gradient(90deg, #0284c7 0%, #7c3aed 50%, #38bdf8 100%)',
            transition: 'transform 0.2s linear',
          },
        }}
      />
    </Box>
  );
}
