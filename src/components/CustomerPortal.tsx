'use client';

import { useEffect, useState } from 'react';
import { Product } from '@/types/database';
import { getProducts } from '@/lib/database';
import { formatCurrency } from '@/lib/utils';
import {
  Package,
  Search,
  Filter,
  ShoppingCart,
  Star,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface CartItem {
  product: Product;
  quantity: number;
}

export default function CustomerPortal() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterBrand, setFilterBrand] = useState<string>('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.warn('Failed to load products, using empty array:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  const getFilteredProducts = () => {
    return products.filter(product => {
      const matchesSearch = product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.model.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
      const matchesBrand = filterBrand === 'all' || product.brand.toLowerCase() === filterBrand.toLowerCase();
      
      return matchesSearch && matchesCategory && matchesBrand && product.total_stock > 0;
    });
  };

  const getAvailableBrands = () => {
    const brands = [...new Set(products.map(p => p.brand))];
    return brands.sort();
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

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
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

  const getCartTotal = () => {
    // Mock pricing - in real app, you'd have actual prices
    return cart.reduce((total, item) => {
      let basePrice = 50; // default for accessories
      
      if (['iphone', 'samsung', 'android_phone'].includes(item.product.category)) {
        basePrice = 500;
      } else if (item.product.category === 'tablet') {
        basePrice = 400;
      } else if (item.product.category === 'smartwatch') {
        basePrice = 300;
      } else if (item.product.category === 'earphones') {
        basePrice = 100;
      } else if (item.product.category === 'chargers') {
        basePrice = 30;
      } else if (item.product.category === 'cases') {
        basePrice = 40;
      }
      
      return total + (basePrice * item.quantity);
    }, 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const filteredProducts = getFilteredProducts();
  const availableBrands = getAvailableBrands();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-2">Loading products...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mobile For You Store</h1>
          <p className="mt-1 text-sm text-gray-500">
            Browse our complete selection of phones, tablets, and accessories
          </p>
        </div>
        <button
          onClick={() => setShowCart(true)}
          className="relative inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          Cart ({getCartItemCount()})
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Products
            </label>
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by brand or model..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="all">All Categories</option>
              <option value="phone">Phones</option>
              <option value="tablet">Tablets</option>
              <option value="earphones">Earphones</option>
              <option value="accessories">Accessories</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Brand
            </label>
            <select
              value={filterBrand}
              onChange={(e) => setFilterBrand(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="all">All Brands</option>
              {availableBrands.map(brand => (
                <option key={brand} value={brand.toLowerCase()}>{brand}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid - Mobile Optimized */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            {/* Product Image */}
            <div className="aspect-w-16 aspect-h-9 bg-gray-200">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={`${product.brand} ${product.model}`}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    // Fallback to placeholder if image fails to load
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNzVMMTI1IDEwMEgxNzVMMTUwIDc1SDEwMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTc1IDEyNUwxMDAgMTAwSDE1MEwxMjUgMTI1SDc1WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
                  }}
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  <Package className="h-16 w-16 text-gray-400" />
                </div>
              )}
            </div>
            
            {/* Product Details */}
            <div className="p-4">
              {/* Title and Stock - Mobile Optimized */}
              <div className="mb-3">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 leading-tight mb-2">
                  {product.brand} {product.model}
                </h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  product.total_stock > 10 ? 'bg-green-100 text-green-800' :
                  product.total_stock > 5 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {product.total_stock} in stock
                </span>
              </div>
              
              {/* Product Info - Mobile Optimized */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 font-medium">Storage:</span>
                  <span className="text-sm text-gray-900">{product.storage}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 font-medium">Condition:</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    product.condition === 'new' ? 'bg-blue-100 text-blue-800' :
                    product.condition === 'refurbished' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {product.condition}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 font-medium">Category:</span>
                  <span className="text-sm text-gray-900 capitalize">{product.category}</span>
                </div>
              </div>

              {/* Price and Add Button - Mobile Optimized */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div className="text-lg font-bold text-indigo-600">
                  {/* Mock pricing */}
                  {['iphone', 'samsung', 'android_phone'].includes(product.category) && formatCurrency(500)}
                  {product.category === 'tablet' && formatCurrency(400)}
                  {product.category === 'smartwatch' && formatCurrency(300)}
                  {product.category === 'earphones' && formatCurrency(100)}
                  {product.category === 'chargers' && formatCurrency(30)}
                  {product.category === 'cases' && formatCurrency(40)}
                  {product.category === 'accessories' && formatCurrency(50)}
                </div>
                <button
                  onClick={() => addToCart(product)}
                  disabled={product.total_stock === 0}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}

      {/* Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Shopping Cart ({getCartItemCount()} items)
                </h3>
                <button
                  onClick={() => setShowCart(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Your cart is empty</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Add some products to get started.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex items-center justify-between border-b pb-3">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">
                          {item.product.brand} {item.product.model}
                        </h4>
                        <p className="text-sm text-gray-500">{item.product.storage}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                          className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-300"
                        >
                          -
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                          className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-300"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="ml-2 text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Total:</span>
                      <span className="text-lg font-bold text-indigo-600">
                        {formatCurrency(getCartTotal())}
                      </span>
                    </div>
                    <button className="w-full mt-4 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                      Proceed to Checkout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
