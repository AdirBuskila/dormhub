'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSupabaseClient } from '@/hooks/useSupabaseClient';

interface EventImageUploaderProps {
  imageUrl?: string | null;
  onImageUrlChange: (url: string) => void;
}

export function EventImageUploader({ imageUrl, onImageUrlChange }: EventImageUploaderProps) {
  const t = useTranslations('calendar');
  const supabase = useSupabaseClient();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploadError(null);
      setUploading(true);

      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setUploadError('Please upload a valid image file (JPEG, PNG, WEBP, or GIF)');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('Image size must be less than 5MB');
        return;
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('event-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('event-images')
        .getPublicUrl(filePath);

      onImageUrlChange(publicUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadError('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!imageUrl) return;

    try {
      // Extract filename from URL
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];

      // Delete from storage
      await supabase.storage.from('event-images').remove([fileName]);

      onImageUrlChange('');
    } catch (error) {
      console.error('Error removing image:', error);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {t('form.eventImage')}
      </label>

      {imageUrl && imageUrl.trim() !== '' ? (
        <div className="relative">
          <img
            src={imageUrl}
            alt="Event preview"
            className="w-full h-48 object-cover rounded-lg border border-gray-300"
          />
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-lg"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : (
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
            id="event-image-upload"
          />
          <label
            htmlFor="event-image-upload"
            className={`
              flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer
              transition-colors
              ${uploading
                ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400'
              }
            `}
          >
            {uploading ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-3"></div>
                <span className="text-sm text-gray-600">Uploading...</span>
              </div>
            ) : (
              <>
                <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="text-sm text-gray-600 mb-1">
                  {t('form.uploadImage')}
                </span>
                <span className="text-xs text-gray-500">
                  PNG, JPG, WEBP or GIF (max 5MB)
                </span>
              </>
            )}
          </label>
        </div>
      )}

      {uploadError && (
        <p className="text-sm text-red-600 mt-2">{uploadError}</p>
      )}
    </div>
  );
}

