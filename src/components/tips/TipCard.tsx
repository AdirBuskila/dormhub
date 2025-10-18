'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { TipWithAuthor } from '@/types/database';

interface TipCardProps {
  tip: TipWithAuthor;
  onVote?: (tipId: string) => Promise<void>;
  hasVoted?: boolean;
}

export function TipCard({ tip, onVote, hasVoted = false }: TipCardProps) {
  const t = useTranslations('tips');
  const [voting, setVoting] = useState(false);
  const [voted, setVoted] = useState(hasVoted);

  const handleVote = async () => {
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 flex-1">
          {tip.title}
        </h3>
        {tip.helpful_count > 0 && (
          <div className="flex items-center gap-1 text-sm text-gray-600 ml-4">
            <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
            </svg>
            <span>{tip.helpful_count}</span>
          </div>
        )}
      </div>

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
  );
}

