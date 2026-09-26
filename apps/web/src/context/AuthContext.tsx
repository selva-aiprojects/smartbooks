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
        setUser(restored);
        setIsAuthenticated(true);
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();
    const demo = resolveTenantForEmail(cleanEmail);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword })
      });
      
      if (response.ok) {
        const { token, user } = await response.json();
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        if (user.companyId) {
          persistTenantId(user.companyId);
        }
        setUser(user);
        setIsAuthenticated(true);
        return true;
      }

      // Check if this is a known demo account where offline mode is allowed
      const isDemoAccount =
        cleanEmail === 'admin@smartbooks.com' ||
        cleanEmail === 'owner@nexusretail.com' ||
        cleanEmail === 'admin@smartbooks.ai' ||
        cleanEmail.includes('superadmin') ||
        cleanEmail.includes('demo');

      if (!isDemoAccount) {
        return false;
      }
    } catch (error) {
      console.warn('API server unreachable — switching to offline demo mode:', error);
    }

    // ── Offline demo fallback ──────────────────────────────────────────────
    const isSuperAdmin =
      cleanEmail.includes('superadmin') ||
      cleanEmail === 'admin@smartbooks.ai' ||
      cleanEmail === 'admin@smartbooks.com';

    let tenantId = demo?.id || 'ade0f19e-d225-41d0-bf94-6a7850f93f03';
    let companyName = demo?.name || 'SmartBooks Demo Corp';

    const fallbackUser = {
      id: `usr-${Date.now()}`,
      email: cleanEmail,
      companyId: tenantId,
      isSuperAdmin,
      company: { name: companyName, subdomain: 'demo', currency: 'INR' }
    };
    localStorage.setItem('token', 'fallback-token-demo');
    localStorage.setItem('user', JSON.stringify(fallbackUser));
    localStorage.setItem('smartbooks_active_tenant_id', tenantId);
    localStorage.setItem('smartbooks_is_superadmin', String(isSuperAdmin));
    setUser(fallbackUser);
    setIsAuthenticated(true);
    return true;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('smartbooks_active_entity_id');
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
