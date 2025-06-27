import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  is_verified?: boolean;
  business_id?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SUPABASE_URL = 'https://zgdfjcodbzpkjlgnjxrk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnZGZqY29kYnpwa2psZ25qeHJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyMjMzMTcsImV4cCI6MjA2NDc5OTMxN30.ncNyyT8_Os5PvlSU8Cfo0QreWnQmL73ei_K_bGALY-c';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const sessionData = localStorage.getItem('ecommerce_session');
    if (sessionData) {
      try {
        const session = JSON.parse(sessionData);
        if (session.user && new Date(session.expires) > new Date()) {
          setUser(session.user);
        } else {
          localStorage.removeItem('ecommerce_session');
        }
      } catch (error) {
        console.error('Error parsing session:', error);
        localStorage.removeItem('ecommerce_session');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Simple password hashing (in production, use proper hashing)
      const passwordHash = password + '_hash';

      // Query the database
      const response = await fetch(`${SUPABASE_URL}/rest/v1/website_users?email=eq.${email}&password_hash=eq.${passwordHash}&select=*`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const users = await response.json();
      
      if (users && users.length > 0) {
        const userData = users[0];
        const userObj: User = {
          id: userData.id,
          email: userData.email,
          first_name: userData.first_name,
          last_name: userData.last_name,
          phone: userData.phone,
          address: userData.address,
          city: userData.city,
          postal_code: userData.postal_code,
          country: userData.country,
          is_verified: userData.is_verified,
          business_id: userData.business_id
        };

        setUser(userObj);

        // Store session
        const session = {
          user: userObj,
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
        };
        localStorage.setItem('ecommerce_session', JSON.stringify(session));

        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Simple password hashing (in production, use proper hashing)
      const passwordHash = userData.password + '_hash';

      const newUser = {
        email: userData.email,
        password_hash: passwordHash,
        first_name: userData.first_name,
        last_name: userData.last_name,
        phone: userData.phone,
        address: userData.address,
        city: userData.city,
        postal_code: userData.postal_code,
        country: userData.country || 'Sri Lanka'
      };

      // Insert user into database
      const response = await fetch(`${SUPABASE_URL}/rest/v1/website_users`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(newUser)
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Registration error:', errorData);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const createdUsers = await response.json();
      
      if (createdUsers && createdUsers.length > 0) {
        const createdUser = createdUsers[0];
        const userObj: User = {
          id: createdUser.id,
          email: createdUser.email,
          first_name: createdUser.first_name,
          last_name: createdUser.last_name,
          phone: createdUser.phone,
          address: createdUser.address,
          city: createdUser.city,
          postal_code: createdUser.postal_code,
          country: createdUser.country,
          is_verified: createdUser.is_verified,
          business_id: createdUser.business_id
        };

        setUser(userObj);

        // Store session
        const session = {
          user: userObj,
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
        };
        localStorage.setItem('ecommerce_session', JSON.stringify(session));

        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ecommerce_session');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
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