'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Product, Client, SearchResult } from '@/types/database';
import { Package, User, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function SearchPage() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [results, setResults] = useState<SearchResult>({ products: [], clients: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.trim().length >= 2) {
      searchProducts(query);
    } else {
      setResults({ products: [], clients: [] });
    }
  }, [query]);

  const searchProducts = async (searchQuery: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAvailabilityBadge = (product: Product) => {
    const availableStock = product.total_stock - product.reserved_stock;
    const alertThreshold = product.alert_threshold || 10;
    
    if (availableStock >= alertThreshold) {
      return { text: t('products.inStock'), className: 'bg-green-100 text-green-800' };
    } else if (availableStock > 0) {
      return { text: t('products.lastFew'), className: 'bg-yellow-100 text-yellow-800' };
    } else {
      return { text: t('products.outOfStock'), className: 'bg-red-100 text-red-800' };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('search.searchResults')}</h1>
          <p className="mt-2 text-lg text-gray-600">
            {t('search.searchResultsFor')}: "{query}"
          </p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        )}

        {!loading && results.products.length === 0 && results.clients.length === 0 && query && (
          <div className="text-center py-8">
            <Search className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">{t('search.noResults')}</h3>
            <p className="mt-1 text-sm text-gray-500">{t('search.tryDifferentSearch')}</p>
          </div>
        )}

        {/* Products Section */}
        {results.products.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t('search.products')} ({results.products.length})
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {results.products.map((product) => {
                const availabilityBadge = getAvailabilityBadge(product);
                return (
                  <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={`${product.brand} ${product.model}`}
                            className="h-16 w-16 rounded-lg object-cover border border-gray-200"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className={`h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center ${product.image_url ? 'hidden' : 'flex'}`}
                        >
                          <Package className="h-8 w-8 text-gray-500" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {product.brand} {product.model}
                          </h3>
                          {product.is_promotion && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              {t('products.promotions')}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {product.storage} • {product.category}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${availabilityBadge.className}`}>
                            {availabilityBadge.text}
                          </span>
                          {product.sale_price_default > 0 && (
                            <span className="text-sm font-medium text-gray-900">
                              ₪{product.sale_price_default}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Clients Section */}
        {results.clients.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t('search.clients')} ({results.clients.length})
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {results.clients.map((client) => (
                <div key={client.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="h-6 w-6 text-gray-500" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {client.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {client.phone}
                      </p>
                      {client.address && (
                        <p className="text-sm text-gray-500 truncate">
                          {client.address}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
