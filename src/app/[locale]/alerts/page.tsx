import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Alert, AlertType, AlertSeverity } from '@/types/database';
import { isAdminEmail } from '@/lib/admin';
import AlertsClient from './AlertsClient';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function AlertsPage() {
  // Check authentication
  const { userId } = await auth();
  const user = await currentUser();
  
  if (!userId || !user) {
    redirect('/sign-in');
  }

  // Check if user is admin
  const userEmail = user.emailAddresses[0]?.emailAddress;
  if (!isAdminEmail(userEmail)) {
    redirect('/');
  }

  // Fetch alerts
  const { data: alerts, error } = await supabase
    .from('alerts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    console.error('Error fetching alerts:', error);
  }

  // Fetch alert counts
  const { count: totalAlerts } = await supabase
    .from('alerts')
    .select('*', { count: 'exact', head: true });

  const { count: unreadAlerts } = await supabase
    .from('alerts')
    .select('*', { count: 'exact', head: true })
    .eq('delivered', false);

  return (
    <AlertsClient 
      initialAlerts={alerts || []}
      totalAlerts={totalAlerts || 0}
      unreadAlerts={unreadAlerts || 0}
    />
  );
}