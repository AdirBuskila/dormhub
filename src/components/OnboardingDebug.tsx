'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';

export default function OnboardingDebug() {
  const { isSignedIn, isLoaded, user } = useUser();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [clientData, setClientData] = useState<any>(null);

  useEffect(() => {
    async function fetchDebugInfo() {
      if (isLoaded && isSignedIn && user) {
        try {
          // Check if user is admin
          const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',').map(email => email.trim().toLowerCase()) || [];
          const userEmail = user.emailAddresses[0]?.emailAddress?.toLowerCase();
          const isAdmin = userEmail ? adminEmails.includes(userEmail) : false;

          // Try to fetch client data
          let clientResponse = null;
          try {
            const response = await fetch(`/api/clients/${user.id}`);
            if (response.ok) {
              clientResponse = await response.json();
            }
          } catch (error) {
            console.error('Error fetching client:', error);
          }

          setDebugInfo({
            userId: user.id,
            userEmail,
            adminEmails,
            isAdmin,
            isSignedIn,
            isLoaded
          });

          setClientData(clientResponse);
        } catch (error) {
          console.error('Debug error:', error);
        }
      }
    }

    fetchDebugInfo();
  }, [isLoaded, isSignedIn, user]);

  if (!isLoaded) {
    return <div>Loading debug info...</div>;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg text-xs max-w-md z-50">
      <h3 className="font-bold mb-2">Onboarding Debug Info</h3>
      
      {debugInfo && (
        <div className="space-y-1">
          <div><strong>User ID:</strong> {debugInfo.userId}</div>
          <div><strong>Email:</strong> {debugInfo.userEmail}</div>
          <div><strong>Is Admin:</strong> {debugInfo.isAdmin ? '✅ Yes' : '❌ No'}</div>
          <div><strong>Admin Emails:</strong> {debugInfo.adminEmails.join(', ')}</div>
        </div>
      )}

      {clientData && (
        <div className="mt-2 space-y-1">
          <div><strong>Client Data:</strong></div>
          <div>• Phone: {clientData.phone || '❌ Missing'}</div>
          <div>• City: {clientData.city || '❌ Missing'}</div>
          <div>• Shop Name: {clientData.shop_name || '❌ Missing'}</div>
          <div>• Profile Complete: {
            (clientData.phone && clientData.city && clientData.shop_name) ? '✅ Yes' : '❌ No'
          }</div>
        </div>
      )}

      {!clientData && (
        <div className="mt-2 text-red-300">
          ❌ No client data found
        </div>
      )}
    </div>
  );
}
