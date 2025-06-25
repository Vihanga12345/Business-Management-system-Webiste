import { supabase } from '@/integrations/supabase/client';
import { 
  WebsiteUser, 
  AuthResponse, 
  LoginCredentials, 
  RegisterData 
} from '@/types';

const BUSINESS_ID = '550e8400-e29b-41d4-a716-446655440000';

// Simple password hashing (for demo - use bcrypt in production)
const hashPassword = (password: string): string => {
  // This is a simple hash for demo purposes
  // In production, use proper bcrypt or similar
  return btoa(password + 'salt123');
};

const verifyPassword = (password: string, hash: string): boolean => {
  return hashPassword(password) === hash;
};

// Generate session token
const generateSessionToken = (): string => {
  return btoa(Date.now() + Math.random().toString()).replace(/[^a-zA-Z0-9]/g, '');
};

// Login user
export const loginUser = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    console.log('Attempting login for:', credentials.email);
    
    // Get user by email
    const { data: userData, error: userError } = await supabase
      .from('website_users')
      .select('*')
      .eq('email', credentials.email)
      .eq('business_id', BUSINESS_ID)
      .single();

    if (userError || !userData) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    if (!verifyPassword(credentials.password, userData.password_hash)) {
      throw new Error('Invalid email or password');
    }

    // Create session
    const sessionToken = generateSessionToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour session

    const { error: sessionError } = await supabase
      .from('website_sessions')
      .insert({
        user_id: userData.id,
        session_token: sessionToken,
        expires_at: expiresAt.toISOString()
      });

    if (sessionError) {
      console.error('Session creation error:', sessionError);
      throw new Error('Failed to create session');
    }

    // Update last login
    await supabase
      .from('website_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', userData.id);

    const user: WebsiteUser = {
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
      created_at: userData.created_at,
      updated_at: userData.updated_at,
      last_login: userData.last_login
    };

    return {
      user,
      session_token: sessionToken,
      expires_at: expiresAt.toISOString()
    };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Register user
export const registerUser = async (userData: RegisterData): Promise<AuthResponse> => {
  try {
    console.log('Attempting registration for:', userData.email);
    
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('website_users')
      .select('id')
      .eq('email', userData.email)
      .eq('business_id', BUSINESS_ID)
      .single();

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Create user
    const hashedPassword = hashPassword(userData.password);
    
    const { data: newUser, error: createError } = await supabase
      .from('website_users')
      .insert({
        email: userData.email,
        password_hash: hashedPassword,
        first_name: userData.first_name,
        last_name: userData.last_name,
        phone: userData.phone,
        address: userData.address,
        city: userData.city,
        postal_code: userData.postal_code,
        country: userData.country || 'Sri Lanka',
        is_verified: true, // Auto-verify for demo
        business_id: BUSINESS_ID
      })
      .select()
      .single();

    if (createError || !newUser) {
      console.error('User creation error:', createError);
      throw new Error('Failed to create user account');
    }

    // Create session
    const sessionToken = generateSessionToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const { error: sessionError } = await supabase
      .from('website_sessions')
      .insert({
        user_id: newUser.id,
        session_token: sessionToken,
        expires_at: expiresAt.toISOString()
      });

    if (sessionError) {
      console.error('Session creation error:', sessionError);
      throw new Error('Failed to create session');
    }

    const user: WebsiteUser = {
      id: newUser.id,
      email: newUser.email,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      phone: newUser.phone,
      address: newUser.address,
      city: newUser.city,
      postal_code: newUser.postal_code,
      country: newUser.country,
      is_verified: newUser.is_verified,
      created_at: newUser.created_at,
      updated_at: newUser.updated_at,
      last_login: newUser.last_login
    };

    return {
      user,
      session_token: sessionToken,
      expires_at: expiresAt.toISOString()
    };
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

// Verify session
export const verifySession = async (sessionToken: string): Promise<WebsiteUser | null> => {
  try {
    if (!sessionToken) return null;

    // Get session and user data
    const { data: sessionData, error: sessionError } = await supabase
      .from('website_sessions')
      .select(`
        *,
        website_users (*)
      `)
      .eq('session_token', sessionToken)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (sessionError || !sessionData) {
      return null;
    }

    const userData = (sessionData as any).website_users;
    
    const user: WebsiteUser = {
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
      created_at: userData.created_at,
      updated_at: userData.updated_at,
      last_login: userData.last_login
    };

    return user;
  } catch (error) {
    console.error('Session verification error:', error);
    return null;
  }
};

// Logout user
export const logoutUser = async (sessionToken: string): Promise<void> => {
  try {
    if (!sessionToken) return;

    await supabase
      .from('website_sessions')
      .delete()
      .eq('session_token', sessionToken);
  } catch (error) {
    console.error('Logout error:', error);
  }
};

// Update user profile
export const updateUserProfile = async (
  userId: string, 
  updates: Partial<Omit<WebsiteUser, 'id' | 'email' | 'created_at' | 'updated_at'>>
): Promise<WebsiteUser> => {
  try {
    const { data: updatedUser, error } = await supabase
      .from('website_users')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error || !updatedUser) {
      throw new Error('Failed to update profile');
    }

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      first_name: updatedUser.first_name,
      last_name: updatedUser.last_name,
      phone: updatedUser.phone,
      address: updatedUser.address,
      city: updatedUser.city,
      postal_code: updatedUser.postal_code,
      country: updatedUser.country,
      is_verified: updatedUser.is_verified,
      created_at: updatedUser.created_at,
      updated_at: updatedUser.updated_at,
      last_login: updatedUser.last_login
    };
  } catch (error) {
    console.error('Profile update error:', error);
    throw error;
  }
}; 