'use client';

import { useState } from 'react';

export default function TestWhatsApp() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const testWhatsApp = async () => {
    setLoading(true);
    setResult('Testing...');
    
    try {
      const response = await fetch('/api/test-whatsapp-simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">WhatsApp Test</h1>
      
      <button
        onClick={testWhatsApp}
        disabled={loading}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Send Test WhatsApp Message'}
      </button>
      
      {result && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Result:</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
            {result}
          </pre>
        </div>
      )}
      
      <div className="mt-6 text-sm text-gray-600">
        <p>This will send a test message to +972546093624</p>
        <p>Check your phone for the WhatsApp message!</p>
      </div>
    </div>
  );
}


