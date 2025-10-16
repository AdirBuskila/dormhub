'use client';

import { useState, useRef, useEffect } from 'react';
import { X, User, Phone, MapPin, Store } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { filterCities, validateIsraeliPhone, formatIsraeliPhone } from '@/lib/israeli-cities';

interface ClientOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export default function ClientOnboardingModal({ 
  isOpen, 
  onClose, 
  onComplete 
}: ClientOnboardingModalProps) {
  const [formData, setFormData] = useState({
    phone: '',
    city: '',
    shop_name: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({
    phone: '',
    city: '',
    shop_name: ''
  });
  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const cityInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const t = useTranslations();

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        cityInputRef.current &&
        !cityInputRef.current.contains(event.target as Node)
      ) {
        setShowCitySuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const validateForm = (): boolean => {
    const errors = {
      phone: '',
      city: '',
      shop_name: ''
    };
    let isValid = true;

    // Validate phone
    const phoneValidation = validateIsraeliPhone(formData.phone);
    if (!phoneValidation.valid) {
      errors.phone = phoneValidation.message || 'מספר טלפון לא תקין';
      isValid = false;
    }

    // Validate city (non-empty)
    if (!formData.city.trim()) {
      errors.city = 'נא לבחור עיר';
      isValid = false;
    }

    // Validate shop name (non-empty)
    if (!formData.shop_name.trim()) {
      errors.shop_name = 'נא להזין שם חנות';
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setFieldErrors({ phone: '', city: '', shop_name: '' });

    // Validate form
    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      // Format phone number before sending
      const formattedData = {
        ...formData,
        phone: formatIsraeliPhone(formData.phone)
      };

      const response = await fetch('/api/clients/upsert-self', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
        }
        console.error('API Error:', errorData);
        console.error('Response status:', response.status);
        console.error('Response headers:', Object.fromEntries(response.headers.entries()));
        throw new Error(errorData.error || `Failed to save profile (${response.status})`);
      }

      onComplete();
    } catch (error) {
      console.error('Error saving profile:', error);
      setError('שגיאה בשמירת הפרופיל. אנא נסה שוב.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear field error when user starts typing
    if (fieldErrors[name as keyof typeof fieldErrors]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Handle city autocomplete
    if (name === 'city') {
      if (value.trim().length > 0) {
        const suggestions = filterCities(value);
        setCitySuggestions(suggestions);
        setShowCitySuggestions(suggestions.length > 0);
      } else {
        setCitySuggestions([]);
        setShowCitySuggestions(false);
      }
    }
  };

  const selectCity = (city: string) => {
    setFormData(prev => ({
      ...prev,
      city
    }));
    setShowCitySuggestions(false);
    setFieldErrors(prev => ({
      ...prev,
      city: ''
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {t('clientOnboarding.completeProfile')}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <p className="text-sm text-gray-600 mb-6">
            {t('clientOnboarding.profileIncomplete')}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('clientOnboarding.phone')} *
              </label>
              <div className="relative">
                <Phone className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className={`block w-full pl-10 pr-3 py-2 border rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 sm:text-sm ${
                    fieldErrors.phone 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                  }`}
                  placeholder="050-1234567"
                />
              </div>
              {fieldErrors.phone && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.phone}</p>
              )}
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('clientOnboarding.city')} *
              </label>
              <div className="relative">
                <MapPin className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                <input
                  ref={cityInputRef}
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  onFocus={() => {
                    if (citySuggestions.length > 0) {
                      setShowCitySuggestions(true);
                    }
                  }}
                  required
                  autoComplete="off"
                  className={`block w-full pl-10 pr-3 py-2 border rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 sm:text-sm ${
                    fieldErrors.city 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                  }`}
                  placeholder="תל אביב"
                />
                
                {/* City Suggestions Dropdown */}
                {showCitySuggestions && citySuggestions.length > 0 && (
                  <div 
                    ref={suggestionsRef}
                    className="absolute z-20 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
                  >
                    {citySuggestions.map((city) => (
                      <div
                        key={city}
                        onClick={() => selectCity(city)}
                        className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-50 hover:text-indigo-900"
                      >
                        <span className="block truncate">{city}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {fieldErrors.city && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.city}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('clientOnboarding.shopName')} *
              </label>
              <div className="relative">
                <Store className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="shop_name"
                  value={formData.shop_name}
                  onChange={handleInputChange}
                  required
                  className={`block w-full pl-10 pr-3 py-2 border rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 sm:text-sm ${
                    fieldErrors.shop_name 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                  }`}
                  placeholder="חנות המובייל שלי"
                />
              </div>
              {fieldErrors.shop_name && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.shop_name}</p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? t('common.submitting') : t('clientOnboarding.saveProfile')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
