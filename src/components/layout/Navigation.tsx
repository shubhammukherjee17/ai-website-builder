'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Zap, User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface User {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
}

interface NavigationProps {
  showAuthButtons?: boolean;
}

export default function Navigation({ showAuthButtons = true }: NavigationProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [supabaseConfigured, setSupabaseConfigured] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if Supabase is configured
    try {
      const supabase = createClient();
      setSupabaseConfigured(true);

      // Get initial session
      const getSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
        setIsLoading(false);
      };

      getSession();

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          setUser(session?.user || null);
          setIsLoading(false);
        }
      );

      return () => subscription.unsubscribe();
    } catch (error) {
      console.warn('Supabase not configured, navigation will show login buttons');
      setSupabaseConfigured(false);
      setIsLoading(false);
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    if (!supabaseConfigured) return;
    
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      setIsProfileOpen(false);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getUserDisplayName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <nav className="flex items-center justify-between p-6 bg-white/80 backdrop-blur-sm border-b border-gray-200">
      <div className="flex items-center space-x-2">
        <Link href="/" className="flex items-center space-x-2">
          <Zap className="w-8 h-8 text-indigo-600" />
          <span className="text-xl font-bold text-gray-900">AI Website Builder</span>
        </Link>
      </div>

      <div className="flex items-center space-x-4">
        {isLoading ? (
          <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
        ) : user && supabaseConfigured ? (
          // Authenticated user - show profile dropdown
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {user.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt="Profile"
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-medium">
                  {getUserInitials()}
                </div>
              )}
              <span className="hidden sm:block text-gray-700 font-medium">
                {getUserDisplayName()}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">{getUserDisplayName()}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                
                <Link
                  href="/dashboard"
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  onClick={() => setIsProfileOpen(false)}
                >
                  <User className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                
                <Link
                  href="/settings"
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  onClick={() => setIsProfileOpen(false)}
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </Link>
                
                <div className="border-t border-gray-200 mt-2 pt-2">
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Not authenticated - show login/signup buttons
          showAuthButtons && (
            <>
              <Link 
                href="/auth/login" 
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Log In
              </Link>
              <Link 
                href="/auth/signup" 
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Get Started
              </Link>
            </>
          )
        )}
      </div>
    </nav>
  );
}
