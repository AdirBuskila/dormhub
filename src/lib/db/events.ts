import { getSupabaseClient } from '@/lib/supabase';
import type {
  DormEvent,
  DormEventWithCreator,
  CreateEventPayload,
  UpdateEventPayload,
  EventFilters,
  AttendeeStatus,
  UUID,
} from '@/types/database';

/**
 * Get events with optional filters
 */
export async function getEvents(
  filters: EventFilters = {},
  limit = 50,
  offset = 0,
  userProfileId?: string
) {
  const supabase = getSupabaseClient();

  let query = supabase
    .from('dorm_events')
    .select(
      `
      *,
      creator:profiles!dorm_events_created_by_fkey(id, full_name, username, avatar_url)
    `,
      { count: 'exact' }
    )
    .order('start_time', { ascending: true })
    .range(offset, offset + limit - 1);

  // Apply filters
  if (filters.event_type) {
    query = query.eq('event_type', filters.event_type);
  }

  if (filters.start_date) {
    query = query.gte('start_time', filters.start_date);
  }

  if (filters.end_date) {
    query = query.lte('end_time', filters.end_date);
  }

  if (filters.created_by) {
    query = query.eq('created_by', filters.created_by);
  }

  if (filters.is_cancelled !== undefined) {
    query = query.eq('is_cancelled', filters.is_cancelled);
  }

  if (filters.tags && filters.tags.length > 0) {
    query = query.overlaps('tags', filters.tags);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching events:', error);
    return { data: null, error, count: 0 };
  }

  // If user is logged in, fetch their attendance status for each event
  let eventsWithStatus: DormEventWithCreator[] = data || [];
  if (userProfileId && data) {
    const eventIds = data.map((e) => e.id);
    const { data: attendees } = await supabase
      .from('dorm_event_attendees')
      .select('event_id, status')
      .eq('profile_id', userProfileId)
      .in('event_id', eventIds);

    const statusMap = new Map(
      attendees?.map((a) => [a.event_id, a.status]) || []
    );

    eventsWithStatus = data.map((event) => ({
      ...event,
      user_status: statusMap.get(event.id) || null,
    }));
  }

  return { data: eventsWithStatus, error: null, count: count || 0 };
}

/**
 * Get a single event by ID
 */
export async function getEventById(id: string, userProfileId?: string) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('dorm_events')
    .select(
      `
      *,
      creator:profiles!dorm_events_created_by_fkey(id, full_name, username, avatar_url)
    `
    )
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching event:', error);
    return { data: null, error };
  }

  let eventWithStatus: DormEventWithCreator = data;
  if (userProfileId) {
    const { data: attendee } = await supabase
      .from('dorm_event_attendees')
      .select('status')
      .eq('event_id', id)
      .eq('profile_id', userProfileId)
      .single();

    eventWithStatus = {
      ...data,
      user_status: attendee?.status || null,
    };
  }

  return { data: eventWithStatus, error: null };
}

/**
 * Create a new event
 */
export async function createEvent(
  payload: CreateEventPayload,
  creatorProfileId: string
) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('dorm_events')
    .insert({
      ...payload,
      created_by: creatorProfileId,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating event:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Update an existing event
 */
export async function updateEvent(id: string, payload: UpdateEventPayload) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('dorm_events')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating event:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Delete an event
 */
export async function deleteEvent(id: string) {
  const supabase = getSupabaseClient();

  const { error } = await supabase.from('dorm_events').delete().eq('id', id);

  if (error) {
    console.error('Error deleting event:', error);
    return { error };
  }

  return { error: null };
}

/**
 * Set attendance status for an event
 */
export async function setAttendanceStatus(
  eventId: string,
  profileId: string,
  status: AttendeeStatus
) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('dorm_event_attendees')
    .upsert(
      {
        event_id: eventId,
        profile_id: profileId,
        status,
      },
      {
        onConflict: 'event_id,profile_id',
      }
    )
    .select()
    .single();

  if (error) {
    console.error('Error setting attendance:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Remove attendance status (user no longer interested/going)
 */
export async function removeAttendance(eventId: string, profileId: string) {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('dorm_event_attendees')
    .delete()
    .eq('event_id', eventId)
    .eq('profile_id', profileId);

  if (error) {
    console.error('Error removing attendance:', error);
    return { error };
  }

  return { error: null };
}

/**
 * Get attendees for an event
 */
export async function getEventAttendees(eventId: string, status?: AttendeeStatus) {
  const supabase = getSupabaseClient();

  let query = supabase
    .from('dorm_event_attendees')
    .select(
      `
      *,
      profile:profiles(id, full_name, username, avatar_url, room)
    `
    )
    .eq('event_id', eventId);

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching attendees:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Get upcoming events (from today onwards)
 */
export async function getUpcomingEvents(limit = 20, userProfileId?: string) {
  const now = new Date().toISOString();
  
  return getEvents(
    {
      start_date: now,
      is_cancelled: false,
    },
    limit,
    0,
    userProfileId
  );
}

/**
 * Get events by date range
 */
export async function getEventsByDateRange(
  startDate: string,
  endDate: string,
  userProfileId?: string
) {
  return getEvents(
    {
      start_date: startDate,
      end_date: endDate,
      is_cancelled: false,
    },
    100, // Get more events for calendar view
    0,
    userProfileId
  );
}

