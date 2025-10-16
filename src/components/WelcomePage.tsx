'use client';

import Link from 'next/link';
import Layout from '@/components/Layout';

export default function WelcomePage() {
  return (
    <Layout isAdmin={false}>
      <div className="min-h-screen bg-gray-50 flex items-start justify-center pt-8 px-6">
        <div className="text-center space-y-8 w-full max-w-md">
          {/* Logo with professional animation */}
          <Link href="/sign-in" className="block animate-fade-in-down cursor-pointer hover:opacity-90 transition-opacity">
            <img 
              src="/logo.png" 
              alt="Mobile For You Logo" 
              className="mx-auto w-32 h-32 object-contain animate-subtle-float"
            />
          </Link>
          
          {/* Guide image */}
          <Link href="/sign-in" className="block cursor-pointer hover:opacity-90 transition-opacity animate-fade-in-up">
            <img 
              src="/guide.png" 
              alt="Mobile For You Guide - Click to sign in" 
              className="mx-auto w-full h-auto rounded-lg hover:shadow-xl transition-shadow"
            />
          </Link>
        </div>
      </div>
      
      {/* Professional CSS Animations */}
      <style jsx>{`
        @keyframes fade-in-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes subtle-float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        
        .animate-fade-in-down {
          animation: fade-in-down 0.8s ease-out;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out 0.2s both;
        }
        
        .animate-subtle-float {
          animation: subtle-float 3s ease-in-out infinite;
        }
      `}</style>
    </Layout>
  );
}

