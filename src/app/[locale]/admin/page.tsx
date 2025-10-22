import { requireAdminWithRedirect } from '@/lib/auth';
import AdminPanel from '@/components/admin/AdminPanel';

export default async function AdminPage() {
  // Require admin access
  await requireAdminWithRedirect('/');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">Admin Panel</h1>
        <AdminPanel />
      </div>
    </div>
  );
}

