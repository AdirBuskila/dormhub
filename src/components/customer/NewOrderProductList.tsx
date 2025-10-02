'use client';

import { useState, useMemo } from 'react';
import { Product } from '@/types/database';
import { Package, Plus, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface CartItem {
  product: Product;
  quantity: number;
}

interface NewOrderProductListProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  cartItems: CartItem[];
}

export default function NewOrderProductList({
  products,
  onAddToCart,
  cartItems
}: NewOrderProductListProps) {
  const t = useTranslations();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBrand, setFilterBrand] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterCondition, setFilterCondition] = useState<string>('all');

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.model.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBrand = filterBrand === 'all' || product.brand === filterBrand;
      const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
      const matchesCondition = filterCondition === 'all' || product.condition === filterCondition;
      const hasStock = product.total_stock > 0;
      
      return matchesSearch && matchesBrand && matchesCategory && matchesCondition && hasStock;
    });
  }, [products, searchTerm, filterBrand, filterCategory, filterCondition]);

  const availableBrands = useMemo(() => {
    const brands = [...new Set(products.map(p => p.brand))];
    return brands.sort();
  }, [products]);

  const getCartQuantity = (productId: string) => {
    const item = cartItems.find(item => item.product.id === productId);
    return item ? item.quantity : 0;
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          {t('inventory.inventoryManagement')} ({filteredProducts.length})
        </h2>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 mb-6">
          <div className="sm:col-span-1">
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={t('inventory.searchProducts')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>
          
          <div>
            <select
              value={filterBrand}
              onChange={(e) => setFilterBrand(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="all">{t('inventory.allCategories')}</option>
              {availableBrands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="all">{t('inventory.allCategories')}</option>
              <option value="phone">{t('inventory.phones')}</option>
              <option value="tablet">{t('inventory.tablets')}</option>
              <option value="earphones">{t('inventory.earphones')}</option>
              <option value="accessories">{t('inventory.accessories')}</option>
            </select>
          </div>

          <div>
            <select
              value={filterCondition}
              onChange={(e) => setFilterCondition(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="all">{t('inventory.allConditions')}</option>
              <option value="new">{t('inventory.new')}</option>
              <option value="refurbished">{t('inventory.refurbished')}</option>
              <option value="used">{t('inventory.used')}</option>
              <option value="activated">{t('inventory.activated')}</option>
              <option value="open_box">{t('inventory.openBox')}</option>
            </select>
          </div>
        </div>

        {/* Products Grid - Mobile Optimized */}
        <div className="space-y-4">
          {filteredProducts.map((product) => {
            const cartQuantity = getCartQuantity(product.id);
            const canAddMore = cartQuantity < product.total_stock;
            
            return (
              <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                {/* Mobile Layout */}
                <div className="block sm:hidden">
                  <div className="flex items-start space-x-3 mb-3">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={`${product.brand} ${product.model}`}
                          className="h-20 w-20 rounded-lg object-cover border border-gray-200"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className={`h-20 w-20 rounded-lg bg-gray-200 flex items-center justify-center ${product.image_url ? 'hidden' : 'flex'}`}
                      >
                        <Package className="h-10 w-10 text-gray-500" />
                      </div>
                    </div>

                    {/* Product Title and Stock */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 leading-tight mb-1">
                        {product.brand} {product.model}
                      </h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        product.total_stock > 10 ? 'bg-green-100 text-green-800' :
                        product.total_stock > 5 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {product.total_stock} {t('inventory.inStock')}
                      </span>
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 font-medium">{t('common.storage')}:</span>
                      <span className="text-sm text-gray-900">{product.storage}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 font-medium">{t('common.condition')}:</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        product.condition === 'new' ? 'bg-blue-100 text-blue-800' :
                        product.condition === 'refurbished' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {product.condition}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 font-medium">{t('common.category')}:</span>
                      <span className="text-sm text-gray-900 capitalize">{product.category}</span>
                    </div>
                  </div>

                  {/* Cart Status and Add Button */}
                  <div className="flex items-center justify-between">
                    {cartQuantity > 0 && (
                      <div className="text-sm text-indigo-600 font-medium">
                        {t('customer.cart')}: {cartQuantity}
                      </div>
                    )}
                    <button
                      onClick={() => onAddToCart(product)}
                      disabled={!canAddMore}
                      className={`flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md ${
                        canAddMore
                          ? 'text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                          : 'text-gray-400 bg-gray-200 cursor-not-allowed'
                      }`}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add to Cart
                    </button>
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden sm:flex items-start space-x-4">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={`${product.brand} ${product.model}`}
                        className="h-16 w-16 rounded-lg object-cover border border-gray-200"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className={`h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center ${product.image_url ? 'hidden' : 'flex'}`}
                    >
                      <Package className="h-8 w-8 text-gray-500" />
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {product.brand} {product.model}
                      </h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        product.total_stock > 10 ? 'bg-green-100 text-green-800' :
                        product.total_stock > 5 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {product.total_stock} {t('inventory.inStock')}
                      </span>
                    </div>
                    
                    <div className="mt-1 space-y-1">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Storage:</span> {product.storage}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Condition:</span> 
                        <span className={`ml-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          product.condition === 'new' ? 'bg-blue-100 text-blue-800' :
                          product.condition === 'refurbished' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {product.condition}
                        </span>
                      </p>
                      <p className="text-sm text-gray-600 capitalize">
                        <span className="font-medium">Category:</span> {product.category}
                      </p>
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <div className="flex-shrink-0">
                    {cartQuantity > 0 && (
                      <div className="text-sm text-gray-500 mb-1">
                        {t('customer.cart')}: {cartQuantity}
                      </div>
                    )}
                    <button
                      onClick={() => onAddToCart(product)}
                      disabled={!canAddMore}
                      className={`inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md ${
                        canAddMore
                          ? 'text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                          : 'text-gray-400 bg-gray-200 cursor-not-allowed'
                      }`}
                    >
                        <Plus className='h-4 w-4 mr-1' />
                        {t('customer.addToCart')}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-8">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
