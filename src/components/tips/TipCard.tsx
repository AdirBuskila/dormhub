'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { TipWithAuthor } from '@/types/database';

interface TipCardProps {
  tip: TipWithAuthor;
  onVote?: (tipId: string) => Promise<void>;
  hasVoted?: boolean;
  onClick?: () => void;
}

export function TipCard({ tip, onVote, hasVoted = false, onClick }: TipCardProps) {
  const t = useTranslations('tips');
  const [voting, setVoting] = useState(false);
  const [voted, setVoted] = useState(hasVoted);

  const handleVote = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening modal when voting
    if (!onVote || voted || voting) return;

    setVoting(true);
    try {
      await onVote(tip.id);
      setVoted(true);
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setVoting(false);
    }
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all cursor-pointer hover:-translate-y-1"
      onClick={onClick}
    >
      {/* Images */}
      {tip.images && tip.images.length > 0 && (
        <div className="relative h-48 bg-gray-100">
          <img
            src={tip.images[0]}
            alt={tip.title}
            className="w-full h-full object-cover"
          />
          {tip.images.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-xs">
              +{tip.images.length - 1} more
            </div>
          )}
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {tip.title}
              </h3>
              {tip.is_product_tip && (
                <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                  </svg>
                  Product
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 ml-4">
            {/* Helpful votes */}
            <div className={`flex items-center gap-1 text-sm ${tip.is_voted ? 'text-green-600' : 'text-gray-600'}`}>
              <svg 
                className="w-4 h-4" 
                fill={tip.is_voted ? 'currentColor' : 'none'} 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" 
                />
              </svg>
              <span className="font-medium">{tip.helpful_count}</span>
            </div>
          </div>
        </div>

        {/* Product Info */}
        {tip.is_product_tip && (tip.estimated_cost_ils || tip.product_link || (tip.suitable_for && tip.suitable_for.length > 0)) && (
          <div className="mb-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
            <div className="space-y-2 text-sm">
              {tip.estimated_cost_ils && (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-semibold text-purple-900">~₪{tip.estimated_cost_ils}</span>
                </div>
              )}
              {tip.suitable_for && tip.suitable_for.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <div className="flex gap-1">
                    {tip.suitable_for.map((type: string) => (
                      <span key={type} className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {tip.product_link && (
                <a
                  href={tip.product_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-purple-700 hover:text-purple-900 font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  View Product
                </a>
              )}
            </div>
          </div>
        )}

        {/* Body */}
        <p className="text-gray-700 mb-4 whitespace-pre-wrap">
          {tip.body}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between border-t pt-3">
          {/* Author */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            {tip.author && (
              <>
                <span className="font-medium">
                  {tip.author.username || tip.author.full_name || t('anonymous')}
                </span>
                <span className="text-gray-400">•</span>
              </>
            )}
            <time className="text-gray-500">
              {new Date(tip.created_at).toLocaleDateString()}
            </time>
          </div>

        <div className="flex items-center gap-2">
          {/* Vote Button */}
          {onVote && (
            <button
              onClick={handleVote}
              disabled={voted || voting}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                voted
                  ? 'bg-green-100 text-green-700 cursor-default'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
              </svg>
              {voted ? t('voted') : t('helpful')}
            </button>
          )}
          
          {/* View More indicator */}
          {onClick && (
            <span className="text-xs text-gray-500">Click to view more →</span>
          )}
        </div>
        </div>

        {/* Tags */}
        {tip.tags && tip.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {tip.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

