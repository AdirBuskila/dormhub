'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import type { DormEventWithCreator, CreateEventPayload, UpdateEventPayload, EventType } from '@/types/database';
import { EVENT_TYPES } from '@/types/database';
import { EventImageUploader } from './EventImageUploader';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateEventPayload | UpdateEventPayload) => Promise<void>;
  event?: DormEventWithCreator | null;
  mode: 'create' | 'edit';
}

export function EventModal({ isOpen, onClose, onSubmit, event, mode }: EventModalProps) {
  const t = useTranslations('calendar');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateEventPayload>({
    title: '',
    description: '',
    event_type: 'party',
    location: '',
    start_time: '',
    end_time: '',
    image_url: '',
    max_attendees: undefined,
    tags: [],
  });

  useEffect(() => {
    if (event && mode === 'edit') {
      setFormData({
        title: event.title,
        description: event.description || '',
        event_type: event.event_type,
        location: event.location || '',
        start_time: new Date(event.start_time).toISOString().slice(0, 16),
        end_time: new Date(event.end_time).toISOString().slice(0, 16),
        image_url: event.image_url || '',
        max_attendees: event.max_attendees || undefined,
        tags: event.tags || [],
      });
    } else if (mode === 'create') {
      // Reset form for create mode
      const now = new Date();
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
      setFormData({
        title: '',
        description: '',
        event_type: 'party',
        location: '',
        start_time: now.toISOString().slice(0, 16),
        end_time: oneHourLater.toISOString().slice(0, 16),
        image_url: '',
        max_attendees: undefined,
        tags: [],
      });
    }
  }, [event, mode, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        start_time: new Date(formData.start_time).toISOString(),
        end_time: new Date(formData.end_time).toISOString(),
      };
      await onSubmit(payload);
      onClose();
    } catch (error) {
      console.error('Error submitting event:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-scale-in">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === 'create' ? t('newEvent') : t('editEvent')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              {t('form.title')} *
            </label>
            <input
              type="text"
              id="title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={t('form.titlePlaceholder')}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Event Type */}
          <div>
            <label htmlFor="event_type" className="block text-sm font-medium text-gray-700 mb-2">
              {t('form.eventType')} *
            </label>
            <select
              id="event_type"
              required
              value={formData.event_type}
              onChange={(e) => setFormData({ ...formData, event_type: e.target.value as EventType })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {EVENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {t(`eventType.${type}`)}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              {t('form.description')}
            </label>
            <textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t('form.descriptionPlaceholder')}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              {t('form.location')}
            </label>
            <input
              type="text"
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder={t('form.locationPlaceholder')}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Event Image */}
          <EventImageUploader
            imageUrl={formData.image_url}
            onImageUrlChange={(url) => setFormData({ ...formData, image_url: url })}
          />

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="start_time" className="block text-sm font-medium text-gray-700 mb-2">
                {t('form.startTime')} *
              </label>
              <input
                type="datetime-local"
                id="start_time"
                required
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="end_time" className="block text-sm font-medium text-gray-700 mb-2">
                {t('form.endTime')} *
              </label>
              <input
                type="datetime-local"
                id="end_time"
                required
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Max Attendees */}
          <div>
            <label htmlFor="max_attendees" className="block text-sm font-medium text-gray-700 mb-2">
              {t('form.maxAttendees')}
            </label>
            <input
              type="number"
              id="max_attendees"
              min="1"
              value={formData.max_attendees || ''}
              onChange={(e) => setFormData({ 
                ...formData, 
                max_attendees: e.target.value ? parseInt(e.target.value) : undefined 
              })}
              placeholder={t('form.maxAttendeesPlaceholder')}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-md hover:bg-gray-200 transition-colors"
            >
              {t('form.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('form.saving') : t('form.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

