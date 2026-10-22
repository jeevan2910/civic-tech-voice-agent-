import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = sessionStorage.getItem('civic_auth_user');
    const savedToken = sessionStorage.getItem('civic_auth_token');
    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        sessionStorage.removeItem('civic_auth_user');
        sessionStorage.removeItem('civic_auth_token');
      }
    } else {
      // Default to Chief Grievance Officer for instantaneous demo experience if no session
      const defaultDemoOfficer = {
        id: 'USR-001',
        email: 'officer@grievance.gov',
        name: 'Dr. Ramesh Verma',
        title: 'Chief Grievance Officer',
        role: 'officer',
        department_id: null,
        department_name: 'Central Grievance Cell',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      };
      setUser(defaultDemoOfficer);
      sessionStorage.setItem('civic_auth_user', JSON.stringify(defaultDemoOfficer));
      sessionStorage.setItem('civic_auth_token', btoa(unescape(encodeURIComponent(JSON.stringify(defaultDemoOfficer)))));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await api.login(email, password);
    sessionStorage.setItem('civic_auth_token', res.token);
    sessionStorage.setItem('civic_auth_user', JSON.stringify(res.user));
    setUser(res.user);
    return res.user;
  };

  const loginAsDemo = (demoUser) => {
    const token = btoa(unescape(encodeURIComponent(JSON.stringify(demoUser))));
    sessionStorage.setItem('civic_auth_token', token);
    sessionStorage.setItem('civic_auth_user', JSON.stringify(demoUser));
    setUser(demoUser);
  };

  const logout = () => {
    sessionStorage.removeItem('civic_auth_token');
    sessionStorage.removeItem('civic_auth_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, role: user?.role || 'guest', login, loginAsDemo, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
