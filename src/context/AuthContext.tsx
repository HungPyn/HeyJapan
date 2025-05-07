// src/context/AuthContext.tsx
import React, {createContext, useState, useContext, ReactNode} from 'react';

type AuthContextType = {
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: ReactNode}> = ({children}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = (email: string, password: string) => {
    // Logic xác thực đơn giản cho mục đích test
    if (email === 'test@example.com' && password === 'password123') {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{isAuthenticated, login, logout}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
