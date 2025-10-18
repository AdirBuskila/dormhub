'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TestUserPage() {
  const router = useRouter();

  useEffect(() => {
    // Set test mode flag in localStorage
    localStorage.setItem('testMode', 'true');
    localStorage.setItem('testUser', JSON.stringify({
      id: 'test-user-demo',
      name: 'Demo User',
      email: 'demo@test.com',
      phone: '052-000-0000',
      city: 'Tel Aviv',
      shopName: 'Demo Shop'
    }));

    // Set test mode cookie for server-side detection
    document.cookie = 'testMode=true; path=/; max-age=86400'; // 24 hours

    // Small delay to ensure cookie is set
    setTimeout(() => {
      // Redirect to customer portal
      router.push('/customer/new-order');
    }, 100);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Entering Demo Mode</h2>
        <p className="text-gray-600">Setting up your test environment...</p>
      </div>
    </div>
  );
}

