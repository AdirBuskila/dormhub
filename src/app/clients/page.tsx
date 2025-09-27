import ClientManagement from '@/components/ClientManagement';

export default function ClientsPage() {
  // For development - bypass authentication
  return <ClientManagement />;
}
