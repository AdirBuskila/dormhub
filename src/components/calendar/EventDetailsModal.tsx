'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import type { DormEventWithCreator, AttendeeStatus } from '@/types/database';
import { format } from 'date-fns';
import ReportButton from '@/components/ReportButton';

interface EventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: DormEventWithCreator | null;
  currentUserId?: string;
  onEdit?: () => void;
  onDelete?: () => Promise<void>;
  onRSVP?: (status: AttendeeStatus) => Promise<void>;
}

export function EventDetailsModal({
  isOpen,
  onClose,
  event,
  currentUserId,
  onEdit,
  onDelete,
  onRSVP,
}: EventDetailsModalProps) {
  const t = useTranslations('calendar');
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);

  if (!isOpen || !event) return null;

  const startDate = new Date(event.start_time);
  const endDate = new Date(event.end_time);
  const now = new Date();
  const isPast = endDate < now;
  const isCreator = event.created_by === currentUserId;
  const isFull = event.max_attendees && event.attendee_count >= event.max_attendees;

  const handleRSVP = async (status: AttendeeStatus) => {
    if (!onRSVP) return;
    setLoading(true);
    try {
      await onRSVP(status);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    setLoading(true);
    try {
      await onDelete();
      onClose();
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <>
      {/* Full Screen Image Modal */}
      {showFullImage && event.image_url && event.image_url.trim() !== '' && (
        <div 
          className="fixed inset-0 z-[60] bg-black bg-opacity-95 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowFullImage(false)}
        >
          <button
            onClick={() => setShowFullImage(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            src={event.image_url}
            alt={event.title}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Event Details Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-scale-in">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative p-6 border-b border-gray-200">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="flex items-start gap-3 pr-10">
            <span className="text-4xl">{getEventIcon(event.event_type)}</span>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {event.title}
              </h2>
              <p className="text-sm text-gray-600">
                {t(`eventType.${event.event_type}`)}
              </p>
            </div>
          </div>

          {/* Report Button - only show if not creator */}
          {!isCreator && currentUserId && (
            <div className="mt-4 flex justify-end">
              <ReportButton 
                itemType="event" 
                itemId={event.id}
                variant="text"
              />
            </div>
          )}

          {event.is_cancelled && (
            <div className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-md">
              <p className="font-semibold">{t('time.cancelled')}</p>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Event Image */}
          {event.image_url && event.image_url.trim() !== '' && (
            <div 
              className="rounded-lg overflow-hidden cursor-pointer group relative"
              onClick={() => setShowFullImage(true)}
            >
              <img
                src={event.image_url}
                alt={event.title}
                className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-transparent group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center pointer-events-none">
                <svg className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </div>
            </div>
          )}

          {/* Description */}
          {event.description && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">{t('form.description')}</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
            </div>
          )}

          {/* Date and Time */}
          <div>
            <div className="flex items-center gap-2 text-gray-700 mb-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-semibold">
                {format(startDate, 'EEEE, MMMM d, yyyy')}
              </span>
            </div>
            <p className="text-gray-600 ml-7">
              {format(startDate, 'HH:mm')} {t('time.to')} {format(endDate, 'HH:mm')}
            </p>
          </div>

          {/* Location */}
          {event.location && (
            <div className="flex items-start gap-2 text-gray-700">
              <svg className="w-5 h-5 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <p className="font-semibold">{t('form.location')}</p>
                <p className="text-gray-600">{event.location}</p>
              </div>
            </div>
          )}

          {/* Attendance Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="font-semibold text-gray-900">
                  {event.attendee_count} {t('attendance.goingPlural')}
                  {event.max_attendees && ` / ${event.max_attendees}`}
                </span>
              </div>
              {isFull && (
                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">
                  {t('attendance.maxReached')}
                </span>
              )}
            </div>
          </div>

          {/* Creator Info */}
          {event.creator && (
            <div className="text-sm text-gray-600">
              {t('createdBy')} <span className="font-medium">{event.creator.full_name || event.creator.username}</span>
            </div>
          )}

          {/* RSVP Button */}
          {!event.is_cancelled && currentUserId && !isCreator && !isPast && onRSVP && (
            <button
              onClick={() => handleRSVP('going')}
              disabled={loading || (isFull && event.user_status !== 'going')}
              className={`
                w-full py-3 px-4 rounded-lg font-bold text-base transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg
                ${event.user_status === 'going'
                  ? 'bg-green-100 text-green-700 border-2 border-green-300'
                  : 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {event.user_status === 'going' ? '✅ מגיע' : 'מגיע 🔥'}
            </button>
          )}

          {/* Creator Actions */}
          {isCreator && onEdit && onDelete && (
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              {!showDeleteConfirm ? (
                <>
                  <button
                    onClick={onEdit}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
                  >
                    {t('editEvent')}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 transition-colors"
                  >
                    {t('deleteEvent')}
                  </button>
                </>
              ) : (
                <>
                  <div className="flex-1 text-sm text-gray-700 flex items-center">
                    {t('confirmDelete')}
                  </div>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-md hover:bg-gray-200 transition-colors"
                  >
                    {t('form.cancel')}
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={loading}
                    className="px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? t('form.deleting') : t('form.delete')}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}

function getEventIcon(type: string): string {
  const icons: Record<string, string> = {
    party: '🎉',
    game_night: '🎮',
    drinking_night: '🍺',
    study_group: '📚',
    movie_night: '🎬',
    sports: '⚽',
    food: '🍕',
    other: '📅',
  };
  return icons[type] || '📅';
}

