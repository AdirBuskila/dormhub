'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import type { DormEventWithCreator, EventType } from '@/types/database';
import { format } from 'date-fns';

interface EventCardProps {
  event: DormEventWithCreator;
  onClick?: () => void;
}

const EVENT_TYPE_COLORS: Record<EventType, { bg: string; text: string; border: string; icon: string }> = {
  party: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200', icon: '🎉' },
  game_night: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', icon: '🎮' },
  drinking_night: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: '🍺' },
  study_group: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: '📚' },
  movie_night: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', icon: '🎬' },
  sports: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: '⚽' },
  food: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', icon: '🍕' },
  other: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', icon: '📅' },
};

export function EventCard({ event, onClick }: EventCardProps) {
  const t = useTranslations('calendar');
  const colors = EVENT_TYPE_COLORS[event.event_type];

  const startDate = new Date(event.start_time);
  const endDate = new Date(event.end_time);
  const now = new Date();
  const isUpcoming = startDate > now;
  const isOngoing = startDate <= now && endDate >= now;
  const isPast = endDate < now;

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return t('time.today');
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return t('time.tomorrow');
    } else if (date.toDateString() === yesterday.toDateString()) {
      return t('time.yesterday');
    } else {
      return format(date, 'MMM d, yyyy');
    }
  };

  return (
    <div
      onClick={onClick}
      className={`
        ${colors.bg} ${colors.border} border-2 rounded-lg p-4 cursor-pointer
        transition-all duration-200 hover:shadow-lg hover:-translate-y-1
        ${event.is_cancelled ? 'opacity-60' : ''}
        ${isOngoing ? 'ring-2 ring-green-500 ring-offset-2' : ''}
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{colors.icon}</span>
          <div>
            <h3 className={`font-bold text-lg ${colors.text}`}>
              {event.title}
            </h3>
            <p className="text-xs text-gray-600">
              {t(`eventType.${event.event_type}`)}
            </p>
          </div>
        </div>
        {event.is_cancelled && (
          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">
            {t('time.cancelled')}
          </span>
        )}
      </div>

      {/* Description */}
      {event.description && (
        <p className="text-sm text-gray-700 mb-3 line-clamp-2">
          {event.description}
        </p>
      )}

      {/* Date and Time */}
      <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="font-medium">
          {formatDate(startDate)} {t('time.at')} {format(startDate, 'HH:mm')}
        </span>
      </div>

      {/* Location */}
      {event.location && (
        <div className="flex items-center gap-2 text-sm text-gray-700 mb-3">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{event.location}</span>
        </div>
      )}

      {/* Attendance Info */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span className="text-sm font-medium text-gray-700">
            {event.attendee_count} {t('attendance.going').toLowerCase()}
            {event.max_attendees && ` / ${event.max_attendees}`}
          </span>
        </div>

        {/* User Status Badge */}
        {event.user_status && (
          <span className={`
            px-2 py-1 text-xs font-semibold rounded
            ${event.user_status === 'going' ? 'bg-green-100 text-green-700' : ''}
            ${event.user_status === 'interested' ? 'bg-blue-100 text-blue-700' : ''}
            ${event.user_status === 'not_going' ? 'bg-gray-100 text-gray-700' : ''}
          `}>
            {t(`attendance.${event.user_status}`)}
          </span>
        )}
      </div>

      {/* Status Indicator */}
      {isOngoing && !event.is_cancelled && (
        <div className="mt-3 flex items-center gap-2 text-green-700 bg-green-100 px-3 py-2 rounded-md">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs font-semibold uppercase">{t('time.started')} - Live Now!</span>
        </div>
      )}
    </div>
  );
}

