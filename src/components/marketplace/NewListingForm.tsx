'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ImageUploader } from './ImageUploader';
import type { ListingType, ListingCondition } from '@/types/database';
import { LISTING_TYPES, LISTING_CONDITIONS, LISTING_CATEGORIES } from '@/types/database';

interface NewListingFormProps {
  locale: string;
}

export function NewListingForm({ locale }: NewListingFormProps) {
  const t = useTranslations('marketplace');
  const router = useRouter();

  const [formData, setFormData] = useState({
    type: 'sell' as ListingType,
    title: '',
    description: '',
    price_ils: '',
    condition: 'good' as ListingCondition,
    category: '',
    tags: '',
    images: [] as string[],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Prepare payload
      const payload = {
        type: formData.type,
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        price_ils: formData.price_ils ? Number(formData.price_ils) : undefined,
        condition: formData.condition || undefined,
        category: formData.category || undefined,
        tags: formData.tags
          ? formData.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
          : [],
        images: formData.images,
      };

      // Submit to API
      const response = await fetch('/api/marketplace/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to create listing');
      }

      // Redirect to the new listing
      router.push(`/${locale}/marketplace/${result.data.id}`);
    } catch (err) {
      console.error('Error creating listing:', err);
      setError(err instanceof Error ? err.message : 'Failed to create listing');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Type */}
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
          {t('form.type')} <span className="text-red-500">*</span>
        </label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {LISTING_TYPES.map((type) => (
            <option key={type} value={type}>
              {t(`type.${type}`)}
            </option>
          ))}
        </select>
      </div>

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          {t('form.title')} <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          value={formData.title}
          onChange={handleChange}
          required
          maxLength={120}
          placeholder={t('form.titlePlaceholder')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          {t('form.description')}
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          maxLength={5000}
          placeholder={t('form.descriptionPlaceholder')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Price */}
      <div>
        <label htmlFor="price_ils" className="block text-sm font-medium text-gray-700 mb-1">
          {t('form.price')} (₪)
        </label>
        <input
          id="price_ils"
          name="price_ils"
          type="number"
          min="0"
          step="1"
          value={formData.price_ils}
          onChange={handleChange}
          placeholder="100"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">{t('form.priceHint')}</p>
      </div>

      {/* Condition */}
      <div>
        <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-1">
          {t('form.condition')}
        </label>
        <select
          id="condition"
          name="condition"
          value={formData.condition}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {LISTING_CONDITIONS.map((cond) => (
            <option key={cond} value={cond}>
              {t(`conditionValue.${cond}`)}
            </option>
          ))}
        </select>
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
          {t('form.category')}
        </label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">{t('form.selectCategory')}</option>
          {LISTING_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {t(`category.${cat}`)}
            </option>
          ))}
        </select>
      </div>

      {/* Tags */}
      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
          {t('form.tags')}
        </label>
        <input
          id="tags"
          name="tags"
          type="text"
          value={formData.tags}
          onChange={handleChange}
          placeholder={t('form.tagsPlaceholder')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">{t('form.tagsHint')}</p>
      </div>

      {/* Images */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('form.images')}
        </label>
        <ImageUploader
          images={formData.images}
          onImagesChange={(images) => setFormData((prev) => ({ ...prev, images }))}
        />
      </div>

      {/* Submit Button */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading || !formData.title.trim()}
          className="flex-1 bg-blue-600 text-white py-3 rounded-md font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? t('form.submitting') : t('form.submit')}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          disabled={loading}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-md font-medium hover:bg-gray-300 disabled:opacity-50 transition-colors"
        >
          {t('form.cancel')}
        </button>
      </div>
    </form>
  );
}

