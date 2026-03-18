import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import { registerDevice, markIntentionalLogout, refreshDeviceExpiry, checkDeviceRegistered } from '@/utils/deviceAuth';

type AppRole = 'user' | 'buyer' | 'business' | 'admin';
type AccountTypeIntent = 'buyer' | 'business';

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  phone_number: string | null;
  buyer_type: string | null;
  interests: string[] | null;
  budget_range: string | null;
  avatar_url: string | null;
  created_at: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: AppRole | null;
  isLoading: boolean;
  /** True when no active session but device was previously registered (known device) */
  isReturningDevice: boolean;
  /** Email hint from device token for returning-user UX */
  returningDeviceEmail: string | null;
  signUp: (email: string, password: string, fullName?: string, accountType?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: (accountType?: AccountTypeIntent) => Promise<{ error: Error | null }>;
  signInWithApple: (accountType?: AccountTypeIntent) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Returning device state — computed after auth hydration completes
  const [isReturningDevice, setIsReturningDevice] = useState(false);
  const [returningDeviceEmail, setReturningDeviceEmail] = useState<string | null>(null);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase.rpc('get_user_role', { _user_id: userId });
      if (error) throw error;
      return data as AppRole | null;
    } catch (error) {
      console.error('Error fetching user role:', error);
      return null;
    }
  };

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (!user) return;
    const [profileData, roleData] = await Promise.all([
      fetchProfile(user.id),
      fetchUserRole(user.id),
    ]);
    setProfile(profileData);
    setRole(roleData);
  };

  // Compute returning-device state whenever auth finishes loading
  const updateReturningDeviceState = (hasSession: boolean) => {
    if (hasSession) {
      setIsReturningDevice(false);
      setReturningDeviceEmail(null);
      return;
    }
    const device = checkDeviceRegistered();
    if (device.registered && !device.blockedByLogout) {
      setIsReturningDevice(true);
      setReturningDeviceEmail(device.email || null);
    } else {
      setIsReturningDevice(false);
      setReturningDeviceEmail(null);
    }
  };

  useEffect(() => {
    let isMounted = true;

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;

        // Only force sign-out on explicit token refresh failure
        if (event === 'TOKEN_REFRESHED' && !session) {
          console.warn('Token refresh failed, clearing stale session');
          setSession(null);
          setUser(null);
          setProfile(null);
          setRole(null);
          updateReturningDeviceState(false);
          return;
        }
        
        setSession(session);
        setUser(session?.user ?? null);

        // Register/refresh device token on any valid session
        if (session?.user) {
          registerDevice(session.user.id, session.user.email || '');
          refreshDeviceExpiry();
        }

        // Defer profile/role fetch to avoid deadlock
        if (session?.user) {
          setTimeout(async () => {
            if (!isMounted) return;
            const [profileData, roleData] = await Promise.all([
              fetchProfile(session.user.id),
              fetchUserRole(session.user.id),
            ]);
            if (isMounted) {
              setProfile(profileData);
              setRole(roleData);
            }
          }, 0);
        } else {
          setProfile(null);
          setRole(null);
        }

        // Update returning-device state after auth change
        if (isMounted) {
          updateReturningDeviceState(!!session?.user);
        }
      }
    );

    // THEN check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (!isMounted) return;

        // Only clear on actual errors, not on empty sessions
        if (error) {
          console.warn('Session retrieval error:', error.message);
          // Don't aggressively sign out — just treat as no session
          setSession(null);
          setUser(null);
          setProfile(null);
          setRole(null);
          updateReturningDeviceState(false);
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          registerDevice(session.user.id, session.user.email || '');
          refreshDeviceExpiry();
          const [profileData, roleData] = await Promise.all([
            fetchProfile(session.user.id),
            fetchUserRole(session.user.id),
          ]);
          if (isMounted) {
            setProfile(profileData);
            setRole(roleData);
          }
        }

        if (isMounted) {
          updateReturningDeviceState(!!session?.user);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName?: string, accountType?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          account_type: accountType || 'buyer',
        },
      },
    });
    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error as Error | null };
  };

  const signInWithGoogle = async (accountType: AccountTypeIntent = 'buyer') => {
    localStorage.setItem('oauth_account_type', accountType);

    const result = await lovable.auth.signInWithOAuth('google', {
      redirect_uri: window.location.origin,
      extraParams: {
        prompt: 'select_account',
      },
    });
    
    if (result.error) {
      return { error: result.error };
    }
    
    return { error: null };
  };

  const signInWithApple = async (accountType: AccountTypeIntent = 'buyer') => {
    localStorage.setItem('oauth_account_type', accountType);

    const result = await lovable.auth.signInWithOAuth('apple', {
      redirect_uri: window.location.origin,
    });
    
    if (result.error) {
      return { error: result.error };
    }
    
    return { error: null };
  };

  const signOut = async () => {
    markIntentionalLogout();
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setRole(null);
    // After explicit logout, device is known but blocked
    setIsReturningDevice(false);
    setReturningDeviceEmail(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        role,
        isLoading,
        isReturningDevice,
        returningDeviceEmail,
        signUp,
        signIn,
        signInWithGoogle,
        signInWithApple,
        signOut,
        refreshProfile,
      }}
    >
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
