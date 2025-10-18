'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import type { TipWithAuthor } from '@/types/database';
import { TipCard } from './TipCard';

interface TipListProps {
  tips: TipWithAuthor[];
  onVote?: (tipId: string) => Promise<void>;
  votedTipIds?: string[];
}

export function TipList({ tips, onVote, votedTipIds = [] }: TipListProps) {
  const t = useTranslations('tips');

  if (tips.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">{t('noTips')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tips.map((tip) => (
        <TipCard
          key={tip.id}
          tip={tip}
          onVote={onVote}
          hasVoted={votedTipIds.includes(tip.id)}
        />
      ))}
    </div>
  );
}

