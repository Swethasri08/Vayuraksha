import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  uid: string;
  email: string;
  displayName?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  resetPassword: async () => {},
});

// Mock user store (replace with Firebase Auth in production)
const MOCK_USERS: Record<string, { password: string; name: string }> = {
  'demo@vayuraksha.in': { password: 'demo1234', name: 'Demo Engineer' },
  'admin@vayuraksha.in': { password: 'admin1234', name: 'System Admin' },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200)); // Simulate network
    const record = MOCK_USERS[email.toLowerCase()];
    if (!record || record.password !== password) {
      setLoading(false);
      throw new Error('Invalid email or password.');
    }
    setUser({ uid: btoa(email), email, displayName: record.name });
    setLoading(false);
  };

  const register = async (email: string, password: string, name: string) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    if (MOCK_USERS[email.toLowerCase()]) {
      setLoading(false);
      throw new Error('An account with this email already exists.');
    }
    MOCK_USERS[email.toLowerCase()] = { password, name };
    setUser({ uid: btoa(email), email, displayName: name });
    setLoading(false);
  };

  const logout = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 500));
    setUser(null);
    setLoading(false);
  };

  const resetPassword = async (email: string) => {
    await new Promise(r => setTimeout(r, 1000));
    if (!MOCK_USERS[email.toLowerCase()]) {
      throw new Error('No account found with this email.');
    }
    // In production: Firebase sendPasswordResetEmail(auth, email)
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
