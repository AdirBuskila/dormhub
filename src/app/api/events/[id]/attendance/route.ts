import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { setAttendanceStatus, removeAttendance } from '@/lib/db/events';
import type { AttendeeStatus } from '@/types/database';

/**
 * POST /api/events/[id]/attendance
 * Set or update attendance status for an event
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const user = await requireAuth();

    const { status } = await request.json();

    // Validate status
    if (!['going', 'interested', 'not_going'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const { data, error } = await setAttendanceStatus(
      eventId,
      user.profileId,
      status as AttendeeStatus
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in POST /api/events/[id]/attendance:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/events/[id]/attendance
 * Remove attendance status (user no longer interested/going)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const user = await requireAuth();

    const { error } = await removeAttendance(eventId, user.profileId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/events/[id]/attendance:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

