import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { getOptionalUser } from '@/lib/auth';
import FloatingBubbles from '@/components/FloatingBubbles';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const user = await getOptionalUser();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-24 md:py-32 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-subtle"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-subtle" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse-subtle" style={{ animationDelay: '2s' }}></div>
          
          {/* Floating bubbles */}
          <FloatingBubbles count={20} />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Logo */}
            <div className="mb-8 animate-fade-in">
              <div className="inline-block bg-white/10 backdrop-blur-sm rounded-3xl p-6 shadow-2xl">
                <Image
                  src="/logo.png"
                  alt="DormHub Logo"
                  width={120}
                  height={120}
                  className="h-24 w-24 md:h-32 md:w-32 animate-bounce-subtle"
                  priority
                />
              </div>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-4 animate-fade-in" style={{ animationDelay: '200ms' }}>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-white">
                DormHub
              </span>
            </h1>
            
            {/* Tagline */}
            <p className="text-2xl md:text-3xl font-bold mb-3 text-blue-100 animate-fade-in" style={{ animationDelay: '400ms' }}>
              All your problems, solved
            </p>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-blue-200 mb-10 animate-fade-in" style={{ animationDelay: '600ms' }}>
              Marketplace, Tips, Deals & More
            </p>

            {/* Call to Action Buttons */}
            {!user && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '800ms' }}>
                <Link
                  href={`/${locale}/sign-up`}
                  className="group bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
                >
                  <span className="flex items-center justify-center gap-2">
                    Get Started
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </Link>
                <Link
                  href={`/${locale}/sign-in`}
                  className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/20 transition-all duration-300 border-2 border-white/30 hover:border-white/50 hover:scale-105"
                >
                  Sign In
                </Link>
              </div>
            )}

            {user && (
              <div className="flex flex-wrap gap-4 justify-center animate-fade-in" style={{ animationDelay: '800ms' }}>
                <Link
                  href={`/${locale}/marketplace`}
                  className="bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/20 transition-all duration-300 border-2 border-blue-400 hover:border-blue-300"
                >
                  Browse Marketplace
                </Link>
                <Link
                  href={`/${locale}/tips`}
                  className="bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/20 transition-all duration-300 border-2 border-green-400 hover:border-green-300"
                >
                  Read Tips
                </Link>
                <Link
                  href={`/${locale}/businesses`}
                  className="bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/20 transition-all duration-300 border-2 border-purple-400 hover:border-purple-300"
                >
                  Student Deals
                </Link>
              </div>
            )}

            {/* Features highlight */}
            <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 animate-fade-in" style={{ animationDelay: '1000ms' }}>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <div className="text-3xl font-bold text-white mb-1">🛍️</div>
                <div className="text-sm font-semibold text-white">Buy & Sell</div>
                <div className="text-xs text-blue-200">Campus marketplace</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <div className="text-3xl font-bold text-white mb-1">💡</div>
                <div className="text-sm font-semibold text-white">Student Tips</div>
                <div className="text-xs text-blue-200">Community wisdom</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <div className="text-3xl font-bold text-white mb-1">🎁</div>
                <div className="text-sm font-semibold text-white">Exclusive Deals</div>
                <div className="text-xs text-blue-200">Save more money</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-12 md:h-20" viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M0,64 C360,100 720,100 1080,64 C1260,46 1380,28 1440,16 L1440,120 L0,120 Z" fill="rgb(249, 250, 251)" />
          </svg>
        </div>
      </section>

      {/* Main Modules */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Explore DormHub
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Marketplace Card */}
            <Link
              href={`/${locale}/marketplace`}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden group animate-fade-in"
            >
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 h-48 flex items-center justify-center">
                <svg className="w-24 h-24 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                  Marketplace
                </h3>
                <p className="text-gray-600 mb-4">
                  Buy, sell, swap, or give away items with other dorm residents. Find great deals on textbooks, furniture, electronics, and more.
                </p>
                <div className="flex items-center text-blue-600 font-medium">
                  Browse Listings
                  <svg className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>

            {/* Tips & Info Card */}
            <Link
              href={`/${locale}/tips`}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden group animate-fade-in"
              style={{ animationDelay: '100ms' }}
            >
              <div className="bg-gradient-to-br from-green-500 to-green-600 h-48 flex items-center justify-center">
                <svg className="w-24 h-24 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors">
                  Tips & Info
                </h3>
                <p className="text-gray-600 mb-4">
                  Get helpful advice from experienced residents. Learn about move-in, laundry, study spots, and everything dorm life.
                </p>
                <div className="flex items-center text-green-600 font-medium">
                  Read Tips
                  <svg className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>

            {/* Local Businesses Card */}
            <Link
              href={`/${locale}/businesses`}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden group animate-fade-in"
              style={{ animationDelay: '200ms' }}
            >
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 h-48 flex items-center justify-center">
                <svg className="w-24 h-24 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">
                  Local Businesses
                </h3>
                <p className="text-gray-600 mb-4">
                  Discover shops and restaurants right below your dorm. Save money with exclusive student discounts!
                </p>
                <div className="flex items-center text-purple-600 font-medium">
                  View Businesses
                  <svg className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section - Why DormHub */}
      <section className="relative py-20 overflow-hidden">
        {/* Background with gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50"></div>
        
        {/* Decorative circles */}
        <div className="absolute top-10 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-subtle"></div>
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-subtle" style={{ animationDelay: '2s' }}></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why DormHub?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need for dorm life, all in one place
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Community First Card */}
            <div className="group text-center bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-blue-100 animate-fade-in">
              <div className="relative mb-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div className="absolute inset-0 bg-blue-400 rounded-2xl w-20 h-20 mx-auto blur-xl opacity-40 group-hover:opacity-60 transition-opacity"></div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                Community First
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Built exclusively for dorm residents by residents who understand your needs
              </p>
            </div>

            {/* Save Money Card */}
            <div className="group text-center bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-green-100 animate-fade-in" style={{ animationDelay: '150ms' }}>
              <div className="relative mb-6">
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="absolute inset-0 bg-green-400 rounded-2xl w-20 h-20 mx-auto blur-xl opacity-40 group-hover:opacity-60 transition-opacity"></div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors">
                Save Money
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Find affordable deals on everything you need without leaving campus
              </p>
            </div>

            {/* Quick & Easy Card */}
            <div className="group text-center bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-purple-100 animate-fade-in" style={{ animationDelay: '300ms' }}>
              <div className="relative mb-6">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="absolute inset-0 bg-purple-400 rounded-2xl w-20 h-20 mx-auto blur-xl opacity-40 group-hover:opacity-60 transition-opacity"></div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">
                Quick & Easy
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Post listings in seconds and get practical tips instantly
              </p>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/50 animate-fade-in" style={{ animationDelay: '450ms' }}>
              <div className="text-3xl font-bold text-blue-600 mb-1">100+</div>
              <div className="text-sm text-gray-600">Active Listings</div>
            </div>
            <div className="text-center bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/50 animate-fade-in" style={{ animationDelay: '550ms' }}>
              <div className="text-3xl font-bold text-green-600 mb-1">50+</div>
              <div className="text-sm text-gray-600">Helpful Tips</div>
            </div>
            <div className="text-center bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/50 animate-fade-in" style={{ animationDelay: '650ms' }}>
              <div className="text-3xl font-bold text-purple-600 mb-1">24/7</div>
              <div className="text-sm text-gray-600">Always Available</div>
            </div>
            <div className="text-center bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/50 animate-fade-in" style={{ animationDelay: '750ms' }}>
              <div className="text-3xl font-bold text-orange-600 mb-1">Free</div>
              <div className="text-sm text-gray-600">Forever</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="bg-blue-600 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Join?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Sign up now and start connecting with your dorm community
            </p>
            <Link
              href={`/${locale}/sign-up`}
              className="inline-block bg-white text-blue-600 px-8 py-3 rounded-md font-medium hover:bg-blue-50 transition-colors"
            >
              Create Your Account
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
