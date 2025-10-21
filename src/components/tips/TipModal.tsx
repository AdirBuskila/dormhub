'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { TipWithAuthor } from '@/types/database';

interface TipModalProps {
  tip: TipWithAuthor;
  isOpen: boolean;
  onClose: () => void;
  onVote?: (tipId: string) => Promise<void>;
  onUnvote?: (tipId: string) => Promise<void>;
  onFlag?: (tipId: string, reason: string, details?: string) => Promise<void>;
  isVoted?: boolean;
}

export function TipModal({ 
  tip, 
  isOpen, 
  onClose, 
  onVote, 
  onUnvote,
  onFlag,
  isVoted = false 
}: TipModalProps) {
  const t = useTranslations('tips');
  const [voted, setVoted] = useState(isVoted);
  const [helpfulCount, setHelpfulCount] = useState(tip.helpful_count);
  const [voting, setVoting] = useState(false);
  const [showFlagForm, setShowFlagForm] = useState(false);
  const [flagReason, setFlagReason] = useState('');
  const [flagDetails, setFlagDetails] = useState('');
  const [flagging, setFlagging] = useState(false);
  const [flagSuccess, setFlagSuccess] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!isOpen) return null;

  const handleVoteToggle = async () => {
    if (!onVote || !onUnvote || voting) return;

    // Optimistic update - update UI immediately
    const wasVoted = voted;
    const previousCount = helpfulCount;
    
    setVoted(!voted);
    setHelpfulCount(prev => voted ? Math.max(0, prev - 1) : prev + 1);
    setVoting(true);

    try {
      // Send request to backend
      if (wasVoted) {
        await onUnvote(tip.id);
      } else {
        await onVote(tip.id);
      }
    } catch (error) {
      console.error('Error toggling vote:', error);
      // Revert on error
      setVoted(wasVoted);
      setHelpfulCount(previousCount);
    } finally {
      setVoting(false);
    }
  };

  const handleFlag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onFlag || !flagReason || flagging) return;

    setFlagging(true);
    try {
      await onFlag(tip.id, flagReason, flagDetails);
      setFlagSuccess(true);
      setTimeout(() => {
        setShowFlagForm(false);
        setFlagSuccess(false);
        setFlagReason('');
        setFlagDetails('');
      }, 2000);
    } catch (error) {
      console.error('Error flagging tip:', error);
      alert('Failed to report tip. Please try again.');
    } finally {
      setFlagging(false);
    }
  };

  const nextImage = () => {
    if (tip.images && tip.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % tip.images!.length);
    }
  };

  const prevImage = () => {
    if (tip.images && tip.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + tip.images!.length) % tip.images!.length);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-gray-900">{tip.title}</h2>
            {tip.is_product_tip && (
              <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                </svg>
                Product
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {onFlag && !showFlagForm && (
              <button
                onClick={() => setShowFlagForm(true)}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                title="Report"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                </svg>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Flag Form */}
        {showFlagForm && (
          <div className="px-6 py-4 bg-red-50 border-b border-red-200">
            {flagSuccess ? (
              <div className="text-green-700 flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Thank you for your report. We'll review it shortly.
              </div>
            ) : (
              <form onSubmit={handleFlag} className="space-y-3">
                <h3 className="font-semibold text-red-900">Report this tip</h3>
                <select
                  value={flagReason}
                  onChange={(e) => setFlagReason(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Select a reason...</option>
                  <option value="spam">Spam or misleading</option>
                  <option value="inappropriate">Inappropriate content</option>
                  <option value="harmful">Harmful or dangerous advice</option>
                  <option value="incorrect">Incorrect information</option>
                  <option value="other">Other</option>
                </select>
                <textarea
                  value={flagDetails}
                  onChange={(e) => setFlagDetails(e.target.value)}
                  placeholder="Additional details (optional)"
                  rows={2}
                  className="w-full px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={flagging || !flagReason}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {flagging ? 'Submitting...' : 'Submit Report'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowFlagForm(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Images */}
        {tip.images && tip.images.length > 0 && (
          <div className="relative h-96 bg-gray-100">
            <img
              src={tip.images[currentImageIndex]}
              alt={`${tip.title} - Image ${currentImageIndex + 1}`}
              className="w-full h-full object-contain"
            />
            {tip.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {tip.images.length}
                </div>
              </>
            )}
          </div>
        )}

        <div className="p-6">
          {/* Product Info */}
          {tip.is_product_tip && (tip.estimated_cost_ils || tip.product_link || (tip.suitable_for && tip.suitable_for.length > 0)) && (
            <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
              <div className="space-y-3">
                {tip.estimated_cost_ils && (
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-semibold text-purple-900 text-lg">~₪{tip.estimated_cost_ils}</span>
                  </div>
                )}
                {tip.suitable_for && tip.suitable_for.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <div className="flex gap-2 flex-wrap">
                      {tip.suitable_for.map((type: string) => (
                        <span key={type} className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full">
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
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    View Product
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Body */}
          <div className="prose max-w-none mb-6">
            <p className="text-gray-700 text-lg whitespace-pre-wrap leading-relaxed">
              {tip.body}
            </p>
          </div>

          {/* Tags */}
          {tip.tags && tip.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {tip.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t">
            {/* Author & Date */}
            <div className="flex items-center gap-3 text-sm text-gray-600">
              {tip.author && (
                <>
                  <span className="font-medium text-gray-900">
                    {tip.author.username || tip.author.full_name || t('anonymous')}
                  </span>
                  <span className="text-gray-400">•</span>
                </>
              )}
              <time className="text-gray-500">
                {new Date(tip.created_at).toLocaleDateString()}
              </time>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              {/* Helpful Button */}
              {(onVote && onUnvote) && (
                <button
                  onClick={handleVoteToggle}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    voted
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } ${voting ? 'opacity-70' : ''}`}
                >
                  <svg 
                    className={`w-5 h-5`} 
                    fill={voted ? 'currentColor' : 'none'} 
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
                  <span>{voted ? 'Helpful' : 'Mark Helpful'}</span>
                  <span className="text-sm opacity-75">({helpfulCount})</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

