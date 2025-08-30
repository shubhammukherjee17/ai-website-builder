'use client';

import { useState, useEffect } from 'react';
import { User, Mail, Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Navigation from '@/components/layout/Navigation';
import { createClient } from '@/lib/supabase/client';

interface UserProfile {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
}

export default function Settings() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [supabaseConfigured, setSupabaseConfigured] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser(session.user);
          setEmail(session.user.email || '');
          setFullName(session.user.user_metadata?.full_name || '');
        }
        setIsLoading(false);
      } catch (error) {
        console.warn('Supabase not configured');
        setSupabaseConfigured(false);
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const handleSave = async () => {
    if (!supabaseConfigured || !user) {
      setMessage({ type: 'error', text: 'Supabase not configured or user not logged in' });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const supabase = createClient();
      
      // Update user metadata
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
        }
      });

      if (error) {
        throw error;
      }

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      
      // Update local user state
      setUser(prev => ({
        ...prev!,
        user_metadata: {
          ...prev?.user_metadata,
          full_name: fullName,
        }
      }));
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation showAuthButtons={false} />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="bg-white rounded-lg p-6">
              <div className="space-y-6">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!supabaseConfigured) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation showAuthButtons={false} />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Settings Unavailable</h1>
            <p className="text-gray-600 mb-8">
              Supabase is not configured. User settings are not available in demo mode.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center space-x-2 text-indigo-600 hover:text-indigo-700"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation showAuthButtons={false} />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Not Authenticated</h1>
            <p className="text-gray-600 mb-8">
              Please log in to access your settings.
            </p>
            <Link
              href="/auth/login"
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Log In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation showAuthButtons={false} />
      
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
          </div>
          
          <div className="p-6 space-y-6">
            {message && (
              <div className={`p-4 rounded-lg ${
                message.type === 'success' 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {message.text}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Email address cannot be changed</p>
            </div>

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center space-x-2 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Account Information</h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">User ID:</span>
                <p className="text-gray-600 font-mono text-xs mt-1">{user.id}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Account Type:</span>
                <p className="text-gray-600 mt-1">Standard User</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
