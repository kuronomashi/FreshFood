import React, { createContext, useContext, useState, useCallback,useEffect  } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: { email: string; role: 'admin' | 'customer' } | null;
  login: (email: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<{ email: string; role: 'admin' | 'customer' } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Recuperar los datos del usuario del localStorage al cargar la app
    const savedUser = localStorage.getItem('user');
    const savedIsAuthenticated = localStorage.getItem('isAuthenticated');
    const savedIsAdmin = localStorage.getItem('isAdmin');

    if (savedUser && savedIsAuthenticated === 'true') {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
      setIsAdmin(savedIsAdmin === 'true');
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string) => {
    const isAdminUser = email === import.meta.env.VITE_Admin1 || email === import.meta.env.VITE_Admin2;
    const userRole = isAdminUser ? 'admin' : 'customer';

    setIsAuthenticated(true);
    setIsAdmin(isAdminUser);
    setUser({ email, role: userRole });

    // Guardar los datos de la sesión en localStorage
    localStorage.setItem('user', JSON.stringify({ email, role: userRole }));
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('isAdmin', isAdminUser.toString());
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setIsAdmin(false);
    setUser(null);
    localStorage.removeItem("InfoUsuario");
    localStorage.removeItem("cartItems");
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('isAdmin');
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isAdmin, user, login, logout,loading  }}>
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