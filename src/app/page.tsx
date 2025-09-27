import Dashboard from '@/components/Dashboard';

export default function Home() {
  // For development - bypass authentication
  // In production, uncomment the auth check below
  return <Dashboard />;
  
  // Production auth check (uncomment when you have real Clerk keys):
  // const { userId } = auth();
  // if (!userId) {
  //   redirect('/sign-in');
  // }
  // return <Dashboard />;
}
