import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { updateProfile } from '@/lib/db/profiles';

export async function PUT(request: Request) {
  try {
    // Require authentication
    const user = await requireAuth();

    // Parse request body
    const body = await request.json();
    const { full_name, username, room, phone } = body;

    // Validate input
    if (username && (username.length < 3 || username.length > 30)) {
      return NextResponse.json(
        { error: 'Username must be between 3 and 30 characters' },
        { status: 400 }
      );
    }

    // Update profile
    const updatedProfile = await updateProfile(user.profileId, {
      full_name: full_name || null,
      username: username || null,
      room: room || null,
      phone: phone || null,
    });

    if (!updatedProfile) {
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      profile: updatedProfile 
    });

  } catch (error) {
    console.error('Profile update error:', error);
    
    if (error instanceof Error && error.message === 'User not authenticated') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'An error occurred while updating your profile' },
      { status: 500 }
    );
  }
}

// GET route to fetch current user profile
export async function GET() {
  try {
    const user = await requireAuth();

    return NextResponse.json({
      profileId: user.profileId,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    
    if (error instanceof Error && error.message === 'User not authenticated') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'An error occurred while fetching your profile' },
      { status: 500 }
    );
  }
}

