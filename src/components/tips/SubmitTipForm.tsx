'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { TipImageUploader } from './TipImageUploader';

interface SubmitTipFormProps {
  locale: string;
}

export function SubmitTipForm({ locale }: SubmitTipFormProps) {
  const t = useTranslations('tips');
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: '',
    body: '',
    tags: '',
  });

  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Prepare payload
      const payload = {
        title: formData.title.trim(),
        body: formData.body.trim(),
        tags: formData.tags
          ? formData.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
          : [],
        images: images.length > 0 ? images : undefined,
      };

      // Submit to API
      const response = await fetch('/api/tips/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to submit tip');
      }

      // Success!
      setSuccess(true);
      setFormData({ title: '', body: '', tags: '' });
      setImages([]);

      // Redirect after a brief delay
      setTimeout(() => {
        router.push(`/${locale}/tips`);
      }, 2000);
    } catch (err) {
      console.error('Error submitting tip:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit tip');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          {t('submitSuccess')}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

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

      {/* Body */}
      <div>
        <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-1">
          {t('form.body')} <span className="text-red-500">*</span>
        </label>
        <textarea
          id="body"
          name="body"
          value={formData.body}
          onChange={handleChange}
          required
          rows={8}
          minLength={20}
          maxLength={5000}
          placeholder={t('form.bodyPlaceholder')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          {formData.body.length}/5000 {t('form.characters')}
        </p>
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
          Images (Optional)
        </label>
        <TipImageUploader 
          images={images}
          onImagesChange={setImages}
          maxImages={3}
        />
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md text-sm">
        {t('submitInfo')}
      </div>

      {/* Submit Button */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading || success || !formData.title.trim() || !formData.body.trim()}
          className="flex-1 bg-blue-600 text-white py-3 rounded-md font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? t('form.submitting') : t('form.submit')}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          disabled={loading || success}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-md font-medium hover:bg-gray-300 disabled:opacity-50 transition-colors"
        >
          {t('form.cancel')}
        </button>
      </div>
    </form>
  );
}

