import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase';
import { upsertClientFromClerkUser } from '@/lib/db/clients';
import OrderConfirmation from '@/components/customer/OrderConfirmation';

interface OrderDetailsPageProps {
  params: {
    orderId: string;
  };
}

export default async function OrderDetailsPage({ params }: OrderDetailsPageProps) {
  const { orderId } = await params;
  
  try {
    // Get authenticated user
    const { userId } = await auth();
    const user = await currentUser();
    
    if (!userId || !user) {
      redirect('/sign-in');
    }

    console.log('Order details page - userId:', userId, 'orderId:', orderId);

    // Create client user data
    const clerkUser = {
      userId: user.id,
      email: user.emailAddresses[0]?.emailAddress || '',
      firstName: user.firstName || '',
      lastName: user.lastName || ''
    };

    console.log('Creating/finding client for user:', clerkUser);
    const client = await upsertClientFromClerkUser(clerkUser);
    console.log('Client found:', client.id);

    // Get order items with product details
    const { data: orderItems, error: itemsError } = await supabaseAdmin
      .from('order_items')
      .select(`
        id,
        quantity,
        price,
        product_id
      `)
      .eq('order_id', orderId);

    console.log('Order items query result:', { orderItems, itemsError });

    // Fetch product details for each order item
    if (orderItems && orderItems.length > 0) {
      for (const item of orderItems) {
        const { data: product, error: productError } = await supabaseAdmin
          .from('products')
          .select('*')
          .eq('id', item.product_id)
          .single();
        
        console.log(`Fetching product ${item.product_id}:`, { product, productError });
        item.product = product;
      }
    }

    // Get order details
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select(`
        id,
        status,
        total_price,
        created_at,
        updated_at,
        client_id
      `)
      .eq('id', orderId)
      .eq('client_id', client.id)
      .single();

    // Combine the data
    if (order && orderItems) {
      (order as any).order_items = orderItems;
    }

    console.log('Order query result:', { order, orderError });
    
    if (order?.order_items) {
      console.log('Order items details:', order.order_items.map(item => ({
        id: item.id,
        quantity: item.quantity,
        price: item.price,
        product: item.products
      })));
    }

    if (orderError || !order) {
      console.log('Order not found or error:', orderError);
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <h2 className="text-2xl font-bold text-gray-900">Order Not Found</h2>
            <p className="mt-2 text-gray-600">This order doesn't exist or you don't have access to it.</p>
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                <strong>Error:</strong> {orderError?.message || 'Order not found'}
              </p>
            </div>
            <a 
              href="/customer"
              className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Back to Dashboard
            </a>
          </div>
        </div>
      );
    }

    console.log('Rendering OrderConfirmation with order:', order);
    return <OrderConfirmation order={order} />;

  } catch (error) {
    console.error('Order details page error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <h2 className="text-2xl font-bold text-gray-900">Error Loading Order</h2>
          <p className="mt-2 text-gray-600">Please try refreshing the page.</p>
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              <strong>Error:</strong> {errorMessage}
            </p>
          </div>
          <a 
            href="/customer"
            className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    );
  }
}
