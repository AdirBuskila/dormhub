import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the current user to check if they're admin
    const user = await clerkClient.users.getUser(userId);
    const userEmail = user.emailAddresses[0]?.emailAddress?.toLowerCase();
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim().toLowerCase()) || [];
    
    if (!userEmail || !adminEmails.includes(userEmail)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch all users from Clerk
    const users = await clerkClient.users.getUserList({
      limit: 100,
      orderBy: '-created_at'
    });

    // Transform the data to match our interface
    const transformedUsers = users.data.map(user => ({
      id: user.id,
      emailAddresses: user.emailAddresses,
      firstName: user.firstName,
      lastName: user.lastName,
      createdAt: user.createdAt,
      lastSignInAt: user.lastSignInAt,
      publicMetadata: user.publicMetadata,
      privateMetadata: user.privateMetadata,
      unsafeMetadata: user.unsafeMetadata,
      imageUrl: user.imageUrl,
      hasImage: user.hasImage,
      primaryEmailAddressId: user.primaryEmailAddressId
    }));

    return NextResponse.json({ 
      users: transformedUsers,
      totalCount: users.totalCount 
    });

  } catch (error) {
    console.error('Error fetching Clerk users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' }, 
      { status: 500 }
    );
  }
}
