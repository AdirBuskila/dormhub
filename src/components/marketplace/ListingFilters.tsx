'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { ListingType, ListingCondition } from '@/types/database';
import { LISTING_TYPES, LISTING_CONDITIONS, LISTING_CATEGORIES } from '@/types/database';

interface FilterValues {
  type?: ListingType;
  category?: string;
  condition?: ListingCondition;
  min_price?: number;
  max_price?: number;
  search?: string;
}

interface ListingFiltersProps {
  onFilterChange: (filters: FilterValues) => void;
  initialFilters?: FilterValues;
}

export function ListingFilters({ onFilterChange, initialFilters = {} }: ListingFiltersProps) {
  const t = useTranslations('marketplace');
  const [filters, setFilters] = useState<FilterValues>(initialFilters);

  const handleChange = (key: keyof FilterValues, value: string | number | undefined) => {
    const newFilters = {
      ...filters,
      [key]: value || undefined,
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
    onFilterChange({});
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            {t('filters.search')}
          </label>
          <input
            id="search"
            type="text"
            value={filters.search || ''}
            onChange={(e) => handleChange('search', e.target.value)}
            placeholder={t('filters.searchPlaceholder')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Type */}
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
            {t('filters.type')}
          </label>
          <select
            id="type"
            value={filters.type || ''}
            onChange={(e) => handleChange('type', e.target.value as ListingType)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t('filters.allTypes')}</option>
            {LISTING_TYPES.map((type) => (
              <option key={type} value={type}>
                {t(`type.${type}`)}
              </option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            {t('filters.category')}
          </label>
          <select
            id="category"
            value={filters.category || ''}
            onChange={(e) => handleChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t('filters.allCategories')}</option>
            {LISTING_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {t(`category.${cat}`)}
              </option>
            ))}
          </select>
        </div>

        {/* Condition */}
        <div>
          <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-1">
            {t('filters.condition')}
          </label>
          <select
            id="condition"
            value={filters.condition || ''}
            onChange={(e) => handleChange('condition', e.target.value as ListingCondition)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t('filters.allConditions')}</option>
            {LISTING_CONDITIONS.map((cond) => (
              <option key={cond} value={cond}>
                {t(`conditionValue.${cond}`)}
              </option>
            ))}
          </select>
        </div>

        {/* Min Price */}
        <div>
          <label htmlFor="min_price" className="block text-sm font-medium text-gray-700 mb-1">
            {t('filters.minPrice')}
          </label>
          <input
            id="min_price"
            type="number"
            min="0"
            value={filters.min_price || ''}
            onChange={(e) => handleChange('min_price', e.target.value ? Number(e.target.value) : undefined)}
            placeholder="₪0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Max Price */}
        <div>
          <label htmlFor="max_price" className="block text-sm font-medium text-gray-700 mb-1">
            {t('filters.maxPrice')}
          </label>
          <input
            id="max_price"
            type="number"
            min="0"
            value={filters.max_price || ''}
            onChange={(e) => handleChange('max_price', e.target.value ? Number(e.target.value) : undefined)}
            placeholder="₪10000"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Clear Button */}
        <div className="flex items-end">
          <button
            onClick={handleClearFilters}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            {t('filters.clear')}
          </button>
        </div>
      </div>
    </div>
  );
}

