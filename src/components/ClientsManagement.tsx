'use client';

import { useEffect, useState } from 'react';
import Layout from './Layout';
import { useTranslations } from 'next-intl';
import { useUser } from '@clerk/nextjs';
import { Users, Mail, Calendar, Shield, UserCheck, UserX, RefreshCw } from 'lucide-react';

interface ClerkUser {
  id: string;
  emailAddresses: Array<{
    emailAddress: string;
    verification: {
      status: string;
    };
  }>;
  firstName: string | null;
  lastName: string | null;
  createdAt: number;
  lastSignInAt: number | null;
  publicMetadata: Record<string, any>;
  privateMetadata: Record<string, any>;
  unsafeMetadata: Record<string, any>;
  imageUrl: string;
  hasImage: boolean;
  primaryEmailAddressId: string | null;
}

export default function ClientsManagement() {
  const t = useTranslations();
  const { user } = useUser();
  const [clerkUsers, setClerkUsers] = useState<ClerkUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadClerkUsers();
  }, []);

  const loadClerkUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use server-side API to get users
      const response = await fetch('/api/clerk/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      setClerkUsers(data.users || []);
    } catch (err) {
      console.error('Failed to load Clerk users:', err);
      
      // Fallback: Show current user if available
      if (user) {
        const fallbackUser: ClerkUser = {
          id: user.id,
          emailAddresses: (user.emailAddresses || []) as any,
          firstName: user.firstName,
          lastName: user.lastName,
          createdAt: user.createdAt?.getTime() || 0,
          lastSignInAt: user.lastSignInAt?.getTime() || null,
          publicMetadata: user.publicMetadata,
          privateMetadata: {},
          unsafeMetadata: {},
          imageUrl: user.imageUrl || '',
          hasImage: user.hasImage || false,
          primaryEmailAddressId: user.primaryEmailAddressId
        };
        setClerkUsers([fallbackUser]);
        setError(null);
      } else {
        setError(t('clients.loadError'));
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (user: ClerkUser) => {
    const isVerified = user.emailAddresses.some(email => 
      email.verification.status === 'verified'
    );
    
    if (isVerified) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <UserCheck className="h-3 w-3 mr-1" />
          {t('common.verified')}
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <UserX className="h-3 w-3 mr-1" />
          {t('common.unverified')}
        </span>
      );
    }
  };

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return t('common.never');
    return new Date(timestamp).toLocaleDateString();
  };

  if (loading) {
    return (
      <Layout isAdmin={true}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-2">{t('common.loading')}</span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout isAdmin={true}>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {t('navigation.clients')}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {t('clients.manageClients')}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {clerkUsers.length}
                </div>
                <div className="text-sm text-gray-500">
                  {t('clients.totalUsers')}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={loadClerkUsers}
                  disabled={loading}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  title={t('common.refresh')}
                >
                  <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <UserX className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  {t('common.error')}
                </h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Users List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              {t('clients.registeredUsers')}
            </h3>
            
            {clerkUsers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  {t('clients.noUsersFound')}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {t('clients.noUsersDesc')}
                </p>
              </div>
            ) : (
              <div className="overflow-hidden">
                <ul className="divide-y divide-gray-200">
                  {clerkUsers.map((clerkUser) => (
                    <li key={clerkUser.id} className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {/* Avatar */}
                          <div className="flex-shrink-0">
                            {clerkUser.hasImage ? (
                              <img
                                className="h-10 w-10 rounded-full"
                                src={clerkUser.imageUrl}
                                alt={`${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <Users className="h-5 w-5 text-gray-500" />
                              </div>
                            )}
                          </div>

                          {/* User Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {clerkUser.firstName || clerkUser.lastName 
                                  ? `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim()
                                  : t('clients.anonymousUser')
                                }
                              </p>
                              {getStatusBadge(clerkUser)}
                            </div>
                            
                            <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                              <div className="flex items-center">
                                <Mail className="h-4 w-4 mr-1" />
                                <span className="truncate">
                                  {clerkUser.emailAddresses[0]?.emailAddress || t('clients.noEmail')}
                                </span>
                              </div>
                              
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                <span>{t('clients.joined')}: {formatDate(clerkUser.createdAt)}</span>
                              </div>
                              
                              {clerkUser.lastSignInAt && (
                                <div className="flex items-center">
                                  <UserCheck className="h-4 w-4 mr-1" />
                                  <span>{t('clients.lastSignIn')}: {formatDate(clerkUser.lastSignInAt)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Admin Badge */}
                        <div className="flex items-center space-x-2">
                          {clerkUser.id === user?.id && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                              <Shield className="h-3 w-3 mr-1" />
                              {t('clients.currentUser')}
                            </span>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
