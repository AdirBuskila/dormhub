'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { Product } from '@/types/database';
import { matchesHebrewSearch } from '@/lib/hebrew-search';

export interface ProductSearchFilters {
  search: string;
  brand: string;
  category: string;
  condition: string;
  promotion: string | null;
  tag: string;
}

export function useProductSearch(products: Product[]) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  // Get initial search from URL (for bookmarks/sharing)
  const initialSearch = searchParams.get('search') || '';
  
  // LOCAL state for search - NO URL sync during typing!
  const [searchQuery, setSearchQuery] = useState(initialSearch);

  // Get other filters from URL (these can update URL immediately)
  const filters: Omit<ProductSearchFilters, 'search'> = useMemo(() => ({
    brand: searchParams.get('brand') || 'all',
    category: searchParams.get('category') || 'all',
    condition: searchParams.get('condition') || 'all',
    promotion: searchParams.get('promotion'),
    tag: searchParams.get('tag') || 'all',
  }), [searchParams]);

  // Update search query (local only, no URL update)
  const setSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // Update URL with filters (for dropdowns, NOT search input)
  const updateFilters = useCallback((newFilters: Partial<Omit<ProductSearchFilters, 'search'>>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== 'all' && value !== '') {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, pathname, router]);

  // Update URL with search (call this manually when appropriate, e.g., on blur)
  const commitSearch = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (searchQuery && searchQuery.trim() !== '') {
      params.set('search', searchQuery);
    } else {
      params.delete('search');
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchQuery, searchParams, pathname, router]);
  
  // CLIENT-SIDE filtering - NO API CALLS!
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Hebrew-enabled search (instant, client-side)
      const matchesSearch = !searchQuery || matchesHebrewSearch(searchQuery, product);
      
      const matchesBrand = filters.brand === 'all' || product.brand === filters.brand;
      const matchesCategory = filters.category === 'all' || product.category === filters.category;
      const matchesCondition = filters.condition === 'all' || product.condition === filters.condition;
      
      // Use boolean fields for tag filtering
      let matchesTag = true;
      if (filters.tag === 'Runner') {
        matchesTag = product.is_runner === true;
      } else if (filters.tag === 'Best Seller') {
        matchesTag = product.is_best_seller === true;
      }
      
      let matchesPromotion = true;
      if (filters.promotion === 'true') {
        matchesPromotion = product.is_promotion === true;
      } else if (filters.promotion === 'false') {
        matchesPromotion = product.is_promotion === false;
      }
      
      const hasStock = product.total_stock > 0;
      
      return matchesSearch && matchesBrand && matchesCategory && matchesCondition && matchesPromotion && matchesTag && hasStock;
    });
  }, [products, searchQuery, filters]);

  // Get available options for filters
  const availableBrands = useMemo(() => {
    const brands = [...new Set(products.map(p => p.brand))];
    return brands.sort();
  }, [products]);

  const availableCategories = useMemo(() => {
    const categories = [...new Set(products.map(p => p.category))];
    return categories.sort();
  }, [products]);

  const availableTags = useMemo(() => {
    const allTags = products.flatMap(p => p.tags || []);
    const uniqueTags = [...new Set(allTags)];
    return uniqueTags.sort();
  }, [products]);

  return {
    searchQuery,
    setSearch,
    commitSearch,
    filters,
    filteredProducts,
    updateFilters,
    availableBrands,
    availableCategories,
    availableTags,
  };
}

