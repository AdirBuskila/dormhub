import React from 'react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'tips' });

  return {
    title: 'Moving In Guide',
  };
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // In a real app, this would fetch from info_pages table
  // For now, static content as placeholder

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Link
        href={`/${locale}/tips`}
        className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
      >
        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Tips
      </Link>

      {/* Content */}
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Moving In Guide
        </h1>

        <div className="prose prose-blue max-w-none">
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Before You Arrive</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Check your dorm assignment and floor plan</li>
            <li>Connect with your roommate(s) in advance</li>
            <li>Make a packing list - don&apos;t forget essentials!</li>
            <li>Arrange transportation for move-in day</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Essential Items</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Bedding (check bed size first!)</li>
            <li>Towels and toiletries</li>
            <li>Desk lamp and organizers</li>
            <li>Power strips and extension cords</li>
            <li>Hangers and storage bins</li>
            <li>Mini fridge and microwave (if allowed)</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">First Week Tips</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Attend orientation events - great way to meet people</li>
            <li>Learn where the laundry room, mailroom, and common areas are</li>
            <li>Set up a cleaning schedule with roommates</li>
            <li>Explore the campus and find your classrooms</li>
            <li>Get to know your RA (Resident Advisor)</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Living With Roommates</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Have an honest conversation about expectations early on</li>
            <li>Respect quiet hours and study time</li>
            <li>Label your food and belongings</li>
            <li>Communicate issues directly and promptly</li>
            <li>Be flexible and patient - everyone adjusts differently</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Safety & Security</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Always lock your door, even when just going down the hall</li>
            <li>Don&apos;t prop open exterior doors</li>
            <li>Know emergency exits and procedures</li>
            <li>Report any suspicious activity to security</li>
            <li>Save important contact numbers in your phone</li>
          </ul>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Need More Help?</h3>
            <p className="text-blue-700 mb-4">
              Check out our community tips for real experiences from fellow students!
            </p>
            <Link
              href={`/${locale}/tips`}
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Browse Tips
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

