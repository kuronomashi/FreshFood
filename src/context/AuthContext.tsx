import React, { createContext, useContext, useState, useCallback } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: { email: string; role: 'admin' | 'customer' } | null;
  login: (email: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  type user = { email: string; role: 'admin' | 'customer' } | null;
  const [user, setUser] = useState<{ email: string; role: 'admin' | 'customer' } | null>(null);


  const login = useCallback(async (email: string) => {
    // Simulate API call
    if (email === 'hola@gmail.com' || email === 'kponnyo@gmail.com') {
      setIsAuthenticated(true);
      setIsAdmin(true);
      setUser({email, role: 'admin' });
    } else if (email) {
      setIsAuthenticated(true);
      setIsAdmin(false);
      setUser({ email, role: 'customer'});
    }
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setIsAdmin(false);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isAdmin, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}