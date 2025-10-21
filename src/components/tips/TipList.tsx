'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@clerk/nextjs';
import type { TipWithAuthor } from '@/types/database';
import { TipCard } from './TipCard';
import { TipModal } from './TipModal';

interface TipListProps {
  tips: TipWithAuthor[];
  onVote?: (tipId: string) => Promise<void>;
  votedTipIds?: string[];
}

export function TipList({ tips, onVote, votedTipIds = [] }: TipListProps) {
  const t = useTranslations('tips');
  const { isSignedIn } = useAuth();
  const [selectedTip, setSelectedTip] = useState<TipWithAuthor | null>(null);
  const [localTips, setLocalTips] = useState(tips);

  // Update local tips when props change
  React.useEffect(() => {
    setLocalTips(tips);
  }, [tips]);

  const handleVoteHelpful = async (tipId: string) => {
    const response = await fetch(`/api/tips/like/${tipId}`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error('Failed to vote tip as helpful');
    }

    // Update local state to reflect the vote
    setLocalTips(prev => prev.map(tip => 
      tip.id === tipId 
        ? { ...tip, is_voted: true, helpful_count: tip.helpful_count + 1 }
        : tip
    ));
    
    // Update selected tip if it's the one being voted
    if (selectedTip && selectedTip.id === tipId) {
      setSelectedTip(prev => prev ? { ...prev, is_voted: true, helpful_count: prev.helpful_count + 1 } : null);
    }
  };

  const handleUnvote = async (tipId: string) => {
    const response = await fetch(`/api/tips/like/${tipId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to remove vote');
    }

    // Update local state to reflect the unvote
    setLocalTips(prev => prev.map(tip => 
      tip.id === tipId 
        ? { ...tip, is_voted: false, helpful_count: Math.max(0, tip.helpful_count - 1) }
        : tip
    ));
    
    // Update selected tip if it's the one being unvoted
    if (selectedTip && selectedTip.id === tipId) {
      setSelectedTip(prev => prev ? { ...prev, is_voted: false, helpful_count: Math.max(0, prev.helpful_count - 1) } : null);
    }
  };

  const handleFlag = async (tipId: string, reason: string, details?: string) => {
    const response = await fetch('/api/tips/flag', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tip_id: tipId,
        reason,
        details,
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to flag tip');
    }
  };

  if (tips.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">{t('noTips')}</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {localTips.map((tip, index) => (
          <div
            key={tip.id}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <TipCard
              tip={tip}
              onVote={onVote}
              hasVoted={votedTipIds.includes(tip.id)}
              onClick={() => setSelectedTip(tip)}
            />
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedTip && (
        <TipModal
          tip={selectedTip}
          isOpen={true}
          onClose={() => setSelectedTip(null)}
          onVote={isSignedIn ? handleVoteHelpful : undefined}
          onUnvote={isSignedIn ? handleUnvote : undefined}
          onFlag={isSignedIn ? handleFlag : undefined}
          isVoted={selectedTip.is_voted}
        />
      )}
    </>
  );
}

