import { NextRequest, NextResponse } from 'next/server';
import { getOptionalUser, requireAuth } from '@/lib/auth';
import { getSupabaseClient } from '@/lib/supabase';
import {
  getEvents,
  createEvent,
  getUpcomingEvents,
  getEventsByDateRange,
} from '@/lib/db/events';
import type { CreateEventPayload, EventFilters } from '@/types/database';

/**
 * GET /api/events
 * Get all events with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const user = await getOptionalUser();
    const userProfileId = user?.profileId;

    // Parse query parameters
    const mode = searchParams.get('mode'); // 'upcoming' or 'range'
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Handle different modes
    if (mode === 'upcoming') {
      const { data, error } = await getUpcomingEvents(limit, userProfileId);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ data });
    }

    if (mode === 'range' && startDate && endDate) {
      const { data, error } = await getEventsByDateRange(
        startDate,
        endDate,
        userProfileId
      );
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ data });
    }

    // Default: get events with filters
    const filters: EventFilters = {};
    
    if (searchParams.get('event_type')) {
      filters.event_type = searchParams.get('event_type') as any;
    }
    if (startDate) filters.start_date = startDate;
    if (endDate) filters.end_date = endDate;
    if (searchParams.get('created_by')) {
      filters.created_by = searchParams.get('created_by')!;
    }
    if (searchParams.get('is_cancelled') !== null) {
      filters.is_cancelled = searchParams.get('is_cancelled') === 'true';
    }
    if (searchParams.get('tags')) {
      filters.tags = searchParams.get('tags')!.split(',');
    }

    const { data, error, count } = await getEvents(
      filters,
      limit,
      offset,
      userProfileId
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data, count });
  } catch (error) {
    console.error('Error in GET /api/events:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/events
 * Create a new event
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const payload: CreateEventPayload = await request.json();
    console.log('Creating event with payload:', payload);

    // Validate required fields
    if (!payload.title || !payload.event_type || !payload.start_time || !payload.end_time) {
      console.error('Missing required fields:', { 
        title: !!payload.title, 
        event_type: !!payload.event_type, 
        start_time: !!payload.start_time, 
        end_time: !!payload.end_time 
      });
      return NextResponse.json(
        { error: 'Missing required fields: title, event_type, start_time, and end_time are required' },
        { status: 400 }
      );
    }

    // Validate time range
    const startTime = new Date(payload.start_time);
    const endTime = new Date(payload.end_time);
    console.log('Time validation:', { startTime, endTime, isValid: endTime > startTime });
    
    if (endTime <= startTime) {
      return NextResponse.json(
        { error: `End time (${endTime.toISOString()}) must be after start time (${startTime.toISOString()})` },
        { status: 400 }
      );
    }

    const { data, error } = await createEvent(payload, user.profileId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/events:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

