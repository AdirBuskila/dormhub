import { redirect } from 'next/navigation';
import { auth, currentUser } from '@clerk/nextjs/server';
import { Calendar, Truck, AlertTriangle, DollarSign, TrendingUp } from 'lucide-react';
import Layout from '@/components/Layout';
import KpiCard from '@/components/KpiCard';
import OrdersToDeliverTable from '@/components/OrdersToDeliverTable';
import LowStockTable from '@/components/LowStockTable';
import ReceivablesAndPayments from '@/components/ReceivablesAndPayments';
import AlertsSidebar from '@/components/AlertsSidebar';
import ClientRedirect from '@/components/ClientRedirect';
import { 
  getKpis, 
  getOrdersToDeliver, 
  getLowStock, 
  getTopDebtors, 
  getRecentPayments, 
  getRecentAlerts 
} from '@/lib/dashboard';

export default async function Home() {
  const { userId } = await auth();
  const user = await currentUser();
  
  console.log('Home page auth check:', { 
    userId: userId ? 'exists' : 'null',
    user: user ? 'exists' : 'null',
    userEmail: user?.emailAddresses?.[0]?.emailAddress
  });
  
  // Check if user is admin
  let isAdmin = false;
  if (userId && user) {
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim().toLowerCase()) || [];
    const userEmail = user.emailAddresses[0]?.emailAddress?.toLowerCase();
    isAdmin = userEmail ? adminEmails.includes(userEmail) : false;
    
    console.log('Home page admin check:', { 
      userEmail, 
      adminEmails, 
      isAdmin 
    });
    
    // If user is authenticated and NOT admin, use client-side redirect
    if (!isAdmin) {
      console.log('Non-admin user, showing client redirect to customer portal');
      return <ClientRedirect redirectTo="/customer" />;
    }
  }
  
  // If not authenticated, show sign-in prompt
  if (!userId || !user) {
    return (
      <Layout isAdmin={false}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Please Sign In</h2>
            <p className="mt-2 text-gray-600">Sign in to access the dashboard.</p>
          </div>
        </div>
      </Layout>
    );
  }
  
  // If authenticated and is admin, show the new admin dashboard
  return <AdminDashboard />;
}

async function AdminDashboard() {
  // Fetch all dashboard data in parallel
  const [kpis, ordersToDeliver, lowStock, topDebtors, recentPayments, recentAlerts] = await Promise.all([
    getKpis(),
    getOrdersToDeliver({ limit: 15 }),
    getLowStock({ limit: 15 }),
    getTopDebtors({ limit: 10 }),
    getRecentPayments({ limit: 10 }),
    getRecentAlerts({ limit: 20 }),
  ]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <Layout isAdmin={true}>
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <Calendar className="h-4 w-4 mr-2" />
                Today
              </button>
            </div>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          <KpiCard
            title="To Deliver"
            value={kpis.toDeliver}
            icon={Truck}
            href="/orders"
            formatter={(val) => val.toString()}
          />
          <KpiCard
            title="Low-Stock SKUs"
            value={kpis.lowStock}
            icon={AlertTriangle}
            href="/inventory"
            formatter={(val) => val.toString()}
          />
          <KpiCard
            title="Receivables"
            value={kpis.receivables}
            icon={DollarSign}
            formatter={formatCurrency}
          />
          <KpiCard
            title="New Orders Today"
            value={kpis.newOrders}
            icon={TrendingUp}
            href="/orders"
            formatter={(val) => val.toString()}
          />
          <KpiCard
            title="Payments Yesterday"
            value={kpis.paymentsYesterday}
            icon={DollarSign}
            href="/payments"
            formatter={formatCurrency}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Side - Orders and Low Stock */}
          <div className="lg:col-span-3 space-y-6">
            {/* Orders to Deliver and Low Stock */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <OrdersToDeliverTable orders={ordersToDeliver} />
              <LowStockTable items={lowStock} />
            </div>

            {/* Money Panel */}
            <ReceivablesAndPayments 
              debtors={topDebtors} 
              payments={recentPayments} 
            />
          </div>

          {/* Right Sidebar - Recent Alerts */}
          <div className="lg:col-span-1">
            <AlertsSidebar alerts={recentAlerts} />
          </div>
        </div>
      </div>
    </Layout>
  );
}
