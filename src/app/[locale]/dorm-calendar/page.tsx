'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useUser } from '@clerk/nextjs';
import { EventCard } from '@/components/calendar/EventCard';
import { EventModal } from '@/components/calendar/EventModal';
import { EventDetailsModal } from '@/components/calendar/EventDetailsModal';
import type { DormEventWithCreator, CreateEventPayload, UpdateEventPayload, AttendeeStatus } from '@/types/database';

export default function DormCalendarPage() {
  const t = useTranslations('calendar');
  const { user, isLoaded } = useUser();
  const [events, setEvents] = useState<DormEventWithCreator[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'today'>('upcoming');
  const [selectedEvent, setSelectedEvent] = useState<DormEventWithCreator | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [userProfileId, setUserProfileId] = useState<string | undefined>();

  // Fetch user profile ID
  useEffect(() => {
    if (user) {
      fetch('/api/profile')
        .then((res) => res.json())
        .then((data) => {
          if (data.data) {
            setUserProfileId(data.data.id);
          }
        })
        .catch((error) => console.error('Error fetching profile:', error));
    }
  }, [user]);

  // Fetch events
  const fetchEvents = async () => {
    setLoading(true);
    try {
      let url = '/api/events?';
      if (filter === 'upcoming') {
        url += 'mode=upcoming';
      } else if (filter === 'today') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        url += `start_date=${today.toISOString()}&end_date=${tomorrow.toISOString()}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      setEvents(data.data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [filter]);

  const handleCreateEvent = async (payload: CreateEventPayload) => {
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await fetchEvents();
        alert(t('form.createSuccess'));
      } else {
        alert(t('form.createError'));
      }
    } catch (error) {
      console.error('Error creating event:', error);
      alert(t('form.createError'));
    }
  };

  const handleUpdateEvent = async (payload: UpdateEventPayload) => {
    if (!selectedEvent) return;

    try {
      const response = await fetch(`/api/events/${selectedEvent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await fetchEvents();
        setIsEditModalOpen(false);
        setIsDetailsModalOpen(false);
        alert(t('form.updateSuccess'));
      } else {
        alert(t('form.updateError'));
      }
    } catch (error) {
      console.error('Error updating event:', error);
      alert(t('form.updateError'));
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;

    try {
      const response = await fetch(`/api/events/${selectedEvent.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchEvents();
        setIsDetailsModalOpen(false);
        alert(t('form.deleteSuccess'));
      } else {
        alert(t('form.deleteError'));
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      alert(t('form.deleteError'));
    }
  };

  const handleRSVP = async (status: AttendeeStatus) => {
    if (!selectedEvent) return;

    try {
      const response = await fetch(`/api/events/${selectedEvent.id}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        await fetchEvents();
        // Update selected event
        const updatedEvent = events.find((e) => e.id === selectedEvent.id);
        if (updatedEvent) {
          setSelectedEvent({ ...updatedEvent, user_status: status });
        }
      }
    } catch (error) {
      console.error('Error updating attendance:', error);
    }
  };

  const handleEventClick = (event: DormEventWithCreator) => {
    setSelectedEvent(event);
    setIsDetailsModalOpen(true);
  };

  const handleEditClick = () => {
    setIsDetailsModalOpen(false);
    setIsEditModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {t('title')} 🎉
            </h1>
            <p className="text-gray-600 text-lg">
              {t('subtitle')}
            </p>
          </div>

          {isLoaded && user && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              + {t('createEvent')}
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t('filters.all')}
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              filter === 'upcoming'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t('filters.upcoming')}
          </button>
          <button
            onClick={() => setFilter('today')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              filter === 'today'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t('filters.today')}
          </button>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {t('noEvents')}
            </h3>
            <p className="text-gray-600 mb-6">
              {t('noEventsDescription')}
            </p>
            {isLoaded && user && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                + {t('createEvent')}
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onClick={() => handleEventClick(event)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <EventModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateEvent}
        mode="create"
      />

      <EventModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setIsDetailsModalOpen(true);
        }}
        onSubmit={handleUpdateEvent}
        event={selectedEvent}
        mode="edit"
      />

      <EventDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedEvent(null);
        }}
        event={selectedEvent}
        currentUserId={userProfileId}
        onEdit={handleEditClick}
        onDelete={handleDeleteEvent}
        onRSVP={handleRSVP}
      />
    </div>
  );
}

