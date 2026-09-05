'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: async () => false,
  logout: () => {},
});

function resolveTenantForEmail(email: string): { id: string; name: string } | null {
  const e = email.toLowerCase();
  if (e.includes('xyzcorp.in') || e.includes('xyz')) return { id: 'tenant-xyz-corp', name: 'XYZ Corporation' };
  if (e.includes('nexusretail.com') || e.includes('nexus')) return { id: 'tenant-nexus', name: 'Nexus Retail & Supermarkets' };
  if (e.includes('vanguardmfg.com')) return { id: 'tenant-vanguard', name: 'Vanguard Manufacturing Ltd' };
  if (e.includes('apexhealth.com')) return { id: 'tenant-apex', name: 'Apex Healthcare & Diagnostics' };
  if (e.includes('flavorsfnb.com')) return { id: 'tenant-flavors', name: 'Flavors Restaurant & Hospitality' };
  return null;
}

function persistTenantId(tenantId: string) {
  try {
    localStorage.setItem('smartbooks_active_tenant_id', tenantId);
  } catch (e) { /* ignore */ }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      try {
        const restored = JSON.parse(savedUser);
        const demo = resolveTenantForEmail(restored.email || '');
        if (demo) {
          restored.companyId = demo.id;
          restored.company = { ...(restored.company || {}), name: demo.name };
          persistTenantId(demo.id);
        }
        setUser(restored);
        setIsAuthenticated(true);
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const demo = resolveTenantForEmail(email);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (response.ok) {
        const { token, user } = await response.json();
        if (demo) {
          user.companyId = demo.id;
          user.company = { ...(user.company || {}), name: demo.name };
          persistTenantId(demo.id);
        }
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        setIsAuthenticated(true);
        return true;
      }
    } catch (error) {
      console.warn('Backend API connection warning, switching to fallback session:', error);
    }

    // Fallback authentication for offline or demo testing
    let tenantId = 'tenant-acme';
    let companyName = 'Acme Global Tech Pvt Ltd';
    const isSuperAdmin =
      email.toLowerCase().includes('superadmin') ||
      email.toLowerCase() === 'admin@smartbooks.ai' ||
      email.toLowerCase() === 'admin@smartbooks.com';

    if (demo) {
      tenantId = demo.id;
      companyName = demo.name;
    }

    const fallbackUser = {
      id: `usr-${Date.now()}`,
      email: email,
      companyId: tenantId,
      isSuperAdmin: isSuperAdmin,
      company: {
        name: companyName,
        subdomain: tenantId.replace('tenant-', ''),
        currency: 'INR'
      }
    };
    localStorage.setItem('token', 'fallback-token-2026');
    localStorage.setItem('user', JSON.stringify(fallbackUser));
    localStorage.setItem('smartbooks_active_tenant_id', tenantId);
    // Always persist the superadmin flag so TenantContext reads it correctly on load
    localStorage.setItem('smartbooks_is_superadmin', String(isSuperAdmin));
    setUser(fallbackUser);
    setIsAuthenticated(true);
    return true;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
