import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { sendWhatsApp } from '@/lib/whatsapp';
import { isAdminEmail } from '@/lib/admin';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    const user = await currentUser();
    
    if (!userId || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const userEmail = user.emailAddresses[0]?.emailAddress;
    if (!isAdminEmail(userEmail)) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Fetch up to 10 unsent messages
    const { data: messages, error: fetchError } = await supabase
      .from('outbound_messages')
      .select('*')
      .eq('sent', false)
      .order('created_at', { ascending: true })
      .limit(10);

    if (fetchError) {
      console.error('Error fetching outbound messages:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }

    if (!messages || messages.length === 0) {
      return NextResponse.json({
        processed: 0,
        remaining: 0,
        message: 'No queued messages to process'
      });
    }

    let processed = 0;
    const errors: string[] = [];

    // Process each message
    for (const message of messages) {
      try {
        const result = await sendWhatsApp({
          to: message.to_phone,
          template: message.template,
          variables: message.payload,
          toClientId: message.to_client_id
        });

        // Update message status based on result
        const updateData: any = {
          sent: result.sent || result.queued || false,
          sent_at: result.sent ? new Date().toISOString() : null,
          error: result.error || null
        };

        const { error: updateError } = await supabase
          .from('outbound_messages')
          .update(updateData)
          .eq('id', message.id);

        if (updateError) {
          console.error('Error updating message status:', updateError);
          errors.push(`Failed to update message ${message.id}: ${updateError.message}`);
        } else {
          processed++;
        }

      } catch (error) {
        console.error('Error processing message:', message.id, error);
        errors.push(`Failed to process message ${message.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Get count of remaining messages
    const { count: remainingCount } = await supabase
      .from('outbound_messages')
      .select('*', { count: 'exact', head: true })
      .eq('sent', false);

    return NextResponse.json({
      processed,
      remaining: remainingCount || 0,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Error in dispatch-messages API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to dispatch messages',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}


