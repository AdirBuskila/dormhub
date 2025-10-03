'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { Product } from '@/types/database';
import { supabase } from '@/lib/supabase';
import NewOrderProductList from './NewOrderProductList';
import CartSidebar from './CartSidebar';
import { useTranslations } from 'next-intl';

interface CartItem {
  product: Product;
  quantity: number;
}

interface NewOrderPageProps {
  clientId: string;
}

export default function NewOrderPage({ clientId }: NewOrderPageProps) {
  const t = useTranslations();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('brand', { ascending: true });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.product.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + 1, product.total_stock) }
            : item
        );
      } else {
        return [...prev, { product, quantity: 1 }];
      }
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(prev => prev.map(item =>
      item.product.id === productId
        ? { ...item, quantity: Math.min(quantity, item.product.total_stock) }
        : item
    ));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const submitOrder = async () => {
    if (cart.length === 0) return;

    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId,
          items: cart.map(item => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: 0 // For MVP, we'll use 0 price and let admin set later
          }))
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Order creation failed:', errorData);
        const errorMessage = errorData.error || 'Unknown error';
        const errorDetails = errorData.details ? ` (${errorData.details})` : '';
        throw new Error(`Failed to create order: ${errorMessage}${errorDetails}`);
      }

      const { orderId } = await response.json();
      router.push(`/customer/orders/${orderId}`);
    } catch (error) {
      console.error('Failed to submit order:', error);
      const errorMessage = error instanceof Error ? error.message : t('common.error');
      setError(`Order creation failed: ${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout isAdmin={false}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-2">{t('common.loading')}</span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout isAdmin={false}>
            <div className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        {t('common.error')}
                      </h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>{error}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Header */}
              <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {t('customer.createNewOrder')}
              </h1>
              <p className="text-gray-600">
                {t('customer.orderDescription')}
              </p>
            </div>
            <div className="text-sm text-gray-500">
              {cart.length} {t('customer.itemsInCart')}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Product List */}
          <div className="lg:col-span-2">
            <NewOrderProductList
              products={products}
              onAddToCart={addToCart}
              cartItems={cart}
            />
          </div>

          {/* Cart Sidebar */}
          <div className="lg:col-span-1">
            <CartSidebar
              items={cart}
              onQuantityChange={updateQuantity}
              onRemove={removeFromCart}
              onSubmit={submitOrder}
              submitting={submitting}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}
