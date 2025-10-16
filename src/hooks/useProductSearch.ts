'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useCallback, useMemo, useTransition } from 'react';
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
  const [isPending, startTransition] = useTransition();

  // Get current filters from URL - memoized to prevent unnecessary re-renders
  const filters: ProductSearchFilters = useMemo(() => ({
    search: searchParams.get('search') || '',
    brand: searchParams.get('brand') || 'all',
    category: searchParams.get('category') || 'all',
    condition: searchParams.get('condition') || 'all',
    promotion: searchParams.get('promotion'),
    tag: searchParams.get('tag') || 'all',
  }), [searchParams]);

  // Update URL with new filters - wrapped in transition for better performance
  const updateFilters = useCallback((newFilters: Partial<ProductSearchFilters>) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      
      Object.entries(newFilters).forEach(([key, value]) => {
        if (value && value !== 'all' && value !== '') {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });

      // Use router.replace instead of push to avoid adding to history on every keystroke
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }, [searchParams, pathname, router]);

  // Filter products based on current filters
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Hebrew-enabled search
      const matchesSearch = !filters.search || matchesHebrewSearch(filters.search, product);
      
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
  }, [products, filters]);

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
    filters,
    filteredProducts,
    updateFilters,
    availableBrands,
    availableCategories,
    availableTags,
  };
}

