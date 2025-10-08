import { auth, currentUser } from '@clerk/nextjs/server';
import { getClientByClerkUserId, getClientOrders } from '@/lib/db/clients';
import OrderConfirmation from '@/components/customer/OrderConfirmation';
import { notFound } from 'next/navigation';

interface OrderPageProps {
  params: {
    orderId: string;
  };
}

export default async function OrderPage({ params }: OrderPageProps) {
  const { orderId } = params;
  
  // Get authenticated user - middleware already ensures we're authenticated
  const { userId } = await auth();
  const user = await currentUser();
  
  if (!userId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Authentication Error</h2>
          <p className="mt-2 text-gray-600">Please try signing in again.</p>
        </div>
      </div>
    );
  }

  try {
    // Get client and their orders
    const client = await getClientByClerkUserId(userId);
    if (!client) {
      notFound();
    }

    const orders = await getClientOrders(client.id);
    const order = orders.find(o => o.id === orderId);

    if (!order) {
      notFound();
    }

    return <OrderConfirmation order={order as any} />;
  } catch (error) {
    console.error('Order page error:', error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Error Loading Order</h2>
          <p className="mt-2 text-gray-600">Please try refreshing the page.</p>
        </div>
      </div>
    );
  }
}
