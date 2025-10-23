'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface ReportButtonProps {
  itemType: 'listing' | 'tip' | 'event';
  itemId: string;
  variant?: 'icon' | 'text' | 'full';
  className?: string;
}

export default function ReportButton({ 
  itemType, 
  itemId, 
  variant = 'icon',
  className = '' 
}: ReportButtonProps) {
  const t = useTranslations('report');
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reasons = [
    'inappropriate_content',
    'spam',
    'harassment',
    'misinformation',
    'scam',
    'other'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reported_item_type: itemType,
          reported_item_id: itemId,
          reason,
          description,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit report');
      }

      setSubmitted(true);
      setTimeout(() => {
        setShowModal(false);
        setSubmitted(false);
        setReason('');
        setDescription('');
      }, 2000);
    } catch (err: any) {
      console.error('Error submitting report:', err);
      setError(err.message || 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  const buttonContent = () => {
    if (variant === 'icon') {
      return (
        <button
          onClick={() => setShowModal(true)}
          className={`p-2 text-gray-400 hover:text-red-600 transition-colors ${className}`}
          title={t('button')}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
          </svg>
        </button>
      );
    }

    if (variant === 'text') {
      return (
        <button
          onClick={() => setShowModal(true)}
          className={`text-sm text-gray-500 hover:text-red-600 transition-colors ${className}`}
        >
          {t('button')}
        </button>
      );
    }

    return (
      <button
        onClick={() => setShowModal(true)}
        className={`flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ${className}`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
        </svg>
        <span>{t('button')}</span>
      </button>
    );
  };

  return (
    <>
      {buttonContent()}

      {/* Report Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => !submitting && setShowModal(false)}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {submitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{t('success.title')}</h3>
                <p className="text-gray-600">{t('success.message')}</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">{t('modal.title')}</h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <p className="text-gray-600 mb-4">{t('modal.description')}</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Reason Select */}
                  <div>
                    <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('modal.reason')} *
                    </label>
                    <select
                      id="reason"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="">{t('modal.selectReason')}</option>
                      {reasons.map((r) => (
                        <option key={r} value={r}>
                          {t(`reasons.${r}`)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('modal.details')}
                    </label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      placeholder={t('modal.detailsPlaceholder')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                    />
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
                      {error}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      disabled={submitting}
                      className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      {t('modal.cancel')}
                    </button>
                    <button
                      type="submit"
                      disabled={submitting || !reason}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? t('modal.submitting') : t('modal.submit')}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

