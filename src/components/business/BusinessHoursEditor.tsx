'use client';

import { useState } from 'react';

interface BusinessHour {
  id: string;
  day_of_week: string;
  opens_at: string | null;
  closes_at: string | null;
  is_closed: boolean;
  notes: string | null;
}

interface BusinessHoursEditorProps {
  businessId: string;
  initialHours: BusinessHour[];
}

const DAYS_OF_WEEK = [
  { value: 'sunday', label: 'Sunday' },
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
];

export default function BusinessHoursEditor({ businessId, initialHours }: BusinessHoursEditorProps) {
  const [hours, setHours] = useState<BusinessHour[]>(initialHours);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const getHoursForDay = (day: string) => {
    return hours.find(h => h.day_of_week === day) || {
      id: '',
      day_of_week: day,
      opens_at: null,
      closes_at: null,
      is_closed: false,
      notes: null,
    };
  };

  const updateDay = (day: string, field: keyof BusinessHour, value: any) => {
    setHours(prev => {
      const existingIndex = prev.findIndex(h => h.day_of_week === day);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], [field]: value };
        return updated;
      } else {
        return [...prev, { 
          id: '', 
          day_of_week: day, 
          opens_at: null, 
          closes_at: null, 
          is_closed: false, 
          notes: null,
          [field]: value 
        }];
      }
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/business/hours', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId, hours }),
      });

      if (!response.ok) {
        throw new Error('Failed to save hours');
      }

      setMessage({ type: 'success', text: 'Opening hours updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save hours. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Opening Hours</h2>
        <p className="mt-1 text-sm text-gray-500">Set your business hours for each day of the week</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-md ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      <div className="space-y-4">
        {DAYS_OF_WEEK.map(day => {
          const dayHours = getHoursForDay(day.value);
          return (
            <div key={day.value} className="border border-gray-200 rounded-lg p-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="sm:w-32">
                  <label className="font-medium text-gray-900">{day.label}</label>
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={dayHours.is_closed}
                    onChange={(e) => updateDay(day.value, 'is_closed', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="text-sm text-gray-600">Closed</label>
                </div>

                {!dayHours.is_closed && (
                  <>
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600 whitespace-nowrap">Opens at:</label>
                      <input
                        type="time"
                        value={dayHours.opens_at || ''}
                        onChange={(e) => updateDay(day.value, 'opens_at', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600 whitespace-nowrap">Closes at:</label>
                      <input
                        type="time"
                        value={dayHours.closes_at || ''}
                        onChange={(e) => updateDay(day.value, 'closes_at', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </>
                )}
              </div>

              {!dayHours.is_closed && (
                <div className="mt-2 sm:ml-32">
                  <input
                    type="text"
                    placeholder="Notes (e.g., 'Delivery only after 8 PM')"
                    value={dayHours.notes || ''}
                    onChange={(e) => updateDay(day.value, 'notes', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? 'Saving...' : 'Save Hours'}
        </button>
      </div>
    </div>
  );
}

