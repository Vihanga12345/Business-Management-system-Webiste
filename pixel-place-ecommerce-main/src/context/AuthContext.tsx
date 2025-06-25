import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WebsiteUser, LoginCredentials, RegisterData } from '@/types';
import { 
  loginUser, 
  registerUser, 
  verifySession, 
  logoutUser as logoutUserService 
} from '@/lib/authService';

interface AuthContextType {
  user: WebsiteUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<WebsiteUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Get session token from localStorage
  const getSessionToken = (): string | null => {
    return localStorage.getItem('website_session_token');
  };

  // Set session token in localStorage
  const setSessionToken = (token: string): void => {
    localStorage.setItem('website_session_token', token);
  };

  // Remove session token from localStorage
  const removeSessionToken = (): void => {
    localStorage.removeItem('website_session_token');
  };

  // Verify session on app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const sessionToken = getSessionToken();
        if (sessionToken) {
          const userData = await verifySession(sessionToken);
          if (userData) {
            setUser(userData);
          } else {
            // Invalid session, remove token
            removeSessionToken();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        removeSessionToken();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      setIsLoading(true);
      const authResponse = await loginUser(credentials);
      setUser(authResponse.user);
      setSessionToken(authResponse.session_token);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<void> => {
    try {
      setIsLoading(true);
      const authResponse = await registerUser(userData);
      setUser(authResponse.user);
      setSessionToken(authResponse.session_token);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const sessionToken = getSessionToken();
      if (sessionToken) {
        await logoutUserService(sessionToken);
      }
      setUser(null);
      removeSessionToken();
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if server logout fails
      setUser(null);
      removeSessionToken();
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const sessionToken = getSessionToken();
      if (sessionToken) {
        const userData = await verifySession(sessionToken);
        if (userData) {
          setUser(userData);
        } else {
          // Session expired, logout
          await logout();
        }
      }
    } catch (error) {
      console.error('Refresh user error:', error);
      await logout();
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 