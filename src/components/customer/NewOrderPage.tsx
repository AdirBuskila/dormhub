'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { Product, Deal } from '@/types/database';
// import { getProducts } from '@/lib/database';
import NewOrderProductList from './NewOrderProductList';
import CartSidebar from './CartSidebar';
import CartModal from './CartModal';
import DealsCarousel from './DealsCarousel';
import DealModal from './DealModal';
import SuccessAnimation from '@/components/SuccessAnimation';
import SkeletonLoader from '@/components/SkeletonLoader';
import { useTranslations } from 'next-intl';

export interface CartItem {
  product: Product;
  quantity: number;
  isDeal?: boolean;
  dealInfo?: {
    dealId: string;
    tierQty: number;
    tierPrice: number;
    totalUnits: number;
  };
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
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const { products } = await response.json();
      console.log('Loaded products:', products?.length || 0, 'products');
      setProducts(products || []);
    } catch (error) {
      console.error('Failed to load products:', error);
      setProducts([]);
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

  const addDealToCart = async (deal: Deal, quantity: number, tierPrice: number, tierQty: number) => {
    if (!deal.product) return;
    
    const totalUnits = tierQty * quantity;
    
    // Add deal to cart with special deal info
    setCart(prev => {
      const existingDealItem = prev.find(
        item => item.isDeal && item.dealInfo?.dealId === deal.id && item.dealInfo?.tierQty === tierQty
      );
      
      if (existingDealItem) {
        // Update existing deal item
        return prev.map(item =>
          item.isDeal && item.dealInfo?.dealId === deal.id && item.dealInfo?.tierQty === tierQty
            ? { 
                ...item, 
                quantity: item.quantity + quantity,
                dealInfo: {
                  ...item.dealInfo,
                  totalUnits: (item.dealInfo.totalUnits || 0) + totalUnits
                }
              }
            : item
        );
      } else {
        // Add new deal item
        return [...prev, {
          product: deal.product,
          quantity: quantity, // Number of "sets" (e.g., 2 sets of 5 units each)
          isDeal: true,
          dealInfo: {
            dealId: deal.id,
            tierQty: tierQty,
            tierPrice: tierPrice,
            totalUnits: totalUnits
          }
        }];
      }
    });
  };

  const submitOrder = async (paymentMethod: string, paymentOtherText?: string) => {
    if (cart.length === 0) return;

    setSubmitting(true);
    setError(null);
    try {
      // Check if we're in test mode
      const testMode = typeof window !== 'undefined' && localStorage.getItem('testMode') === 'true';
      
      // Prepare payment method value
      const paymentMethodValue = paymentMethod === 'other' && paymentOtherText 
        ? `Other: ${paymentOtherText}` 
        : paymentMethod;

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: testMode ? 'test-client-id' : clientId,
          items: cart.map(item => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: 0 // For MVP, we'll use 0 price and let admin set later
          })),
          paymentMethod: paymentMethodValue,
          testMode: testMode
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Order creation failed:', errorData);
        const errorMessage = errorData.error || 'Unknown error';
        const errorDetails = errorData.details ? ` (${errorData.details})` : '';
        
        // Handle specific error cases
        if (response.status === 401) {
          throw new Error('Please sign in to create orders. Your session may have expired.');
        } else if (response.status === 404) {
          throw new Error('Account not found. Please try refreshing the page or contact support.');
        } else if (response.status === 400) {
          throw new Error(errorData.error || 'Invalid request. Please check your selections.');
        } else {
          throw new Error(`Failed to create order: ${errorMessage}${errorDetails}`);
        }
      }

      const responseData = await response.json();
      const { orderId, testMode: isTestOrder } = responseData;
      
      // Show success animation
      setShowSuccess(true);
      setCartModalOpen(false);
      
      // Clear cart
      setCart([]);
      
      // Navigate after success animation completes
      setTimeout(() => {
        if (isTestOrder) {
          // In test mode, just redirect back to the order page
          router.push('/customer/new-order');
        } else {
          router.push(`/customer/orders/${orderId}`);
        }
      }, 2000);
    } catch (error) {
      console.error('Failed to submit order:', error);
      const errorMessage = error instanceof Error ? error.message : t('common.error');
      setError(`Order creation failed: ${errorMessage}`);
      setCartModalOpen(false); // Close modal on error too
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout isAdmin={false}>
        <div className="space-y-6 p-4">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
          </div>
          <SkeletonLoader count={6} type="product" />
        </div>
      </Layout>
    );
  }

  // Check if we're in test mode
  const testMode = typeof window !== 'undefined' && localStorage.getItem('testMode') === 'true';

  return (
    <Layout isAdmin={false}>
      {/* Test Mode Banner */}
      {testMode && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <span className="font-semibold">🧪 Demo Mode:</span> You're testing the app. Orders will appear to complete but won't be saved to the database.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('testMode');
                localStorage.removeItem('testUser');
                window.location.href = '/';
              }}
              className="ml-4 px-3 py-1 bg-yellow-600 text-white text-xs font-medium rounded hover:bg-yellow-700 transition-colors"
            >
              Exit Demo
            </button>
          </div>
        </div>
      )}
      
      {/* Success Animation */}
      {showSuccess && (
        <SuccessAnimation 
          message={testMode ? '🧪 Demo Order Created!' : t('customer.orderSubmitted')}
          onComplete={() => setShowSuccess(false)}
        />
      )}

      <div className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3 flex-1">
                      <h3 className="text-sm font-medium text-red-800">
                        {t('common.error')}
                      </h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>{error}</p>
                        <p className="mt-1 text-xs text-red-600">{t('common.contactSupport')}</p>
                      </div>
                      <div className="mt-3">
                        <button
                          onClick={() => setError(null)}
                          className="text-sm font-medium text-red-800 hover:text-red-900"
                        >
                          {t('common.close')}
                        </button>
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

        {/* Deals Carousel */}
        <DealsCarousel onDealClick={setSelectedDeal} />

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

        {/* Floating Cart Button - Mobile Only */}
        {cart.length > 0 && (
          <div className="fixed bottom-6 right-6 lg:hidden z-50">
            <button
              onClick={() => setCartModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-5 py-3 shadow-lg transition-all duration-200 flex items-center gap-2 hover:scale-105 active:scale-95"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="font-medium">{t('customer.viewCart')}</span>
              <span className="font-medium">({cart.reduce((sum, item) => sum + item.quantity, 0)})</span>
            </button>
          </div>
        )}

        {/* Mobile Cart Modal */}
        <CartModal
          isOpen={cartModalOpen}
          onClose={() => setCartModalOpen(false)}
          items={cart}
          onQuantityChange={updateQuantity}
          onRemove={removeFromCart}
          onSubmit={submitOrder}
          submitting={submitting}
        />

        {/* Deal Modal */}
        {selectedDeal && (
          <DealModal
            deal={selectedDeal}
            onClose={() => setSelectedDeal(null)}
            onAddToCart={addDealToCart}
          />
        )}
      </div>
    </Layout>
  );
}
