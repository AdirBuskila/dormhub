'use client';

import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';

interface SuccessAnimationProps {
  message?: string;
  onComplete?: () => void;
  duration?: number;
}

export default function SuccessAnimation({ 
  message = 'Success!', 
  onComplete,
  duration = 2000 
}: SuccessAnimationProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Trigger animation after mount
    setTimeout(() => setShow(true), 10);

    // Call onComplete callback after duration
    if (onComplete) {
      const timer = setTimeout(onComplete, duration);
      return () => clearTimeout(timer);
    }
  }, [onComplete, duration]);

  return (
    <div className="fixed inset-0 bg-gray-50 z-[70] flex items-center justify-center">
      <div className={`bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center max-w-sm mx-4 transform transition-all duration-500 ${
        show ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
      }`}>
        {/* Animated Checkmark Circle */}
        <div className="relative mb-6">
          {/* Outer circle with scale animation */}
          <div className={`w-20 h-20 rounded-full bg-green-100 flex items-center justify-center transform transition-all duration-700 ${
            show ? 'scale-100 rotate-0' : 'scale-0 rotate-180'
          }`}>
            {/* Inner circle */}
            <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center">
              {/* Checkmark with delayed animation */}
              <Check 
                className={`h-10 w-10 text-white transition-all duration-500 delay-300 ${
                  show ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                }`} 
                strokeWidth={3}
              />
            </div>
          </div>
          
          {/* Pulsing ring effect */}
          <div className={`absolute inset-0 rounded-full bg-green-400 transition-all duration-1000 ${
            show ? 'scale-150 opacity-0' : 'scale-100 opacity-30'
          }`}></div>
        </div>

        {/* Success Message */}
        <h3 className={`text-xl font-semibold text-gray-900 mb-2 transition-all duration-500 delay-500 ${
          show ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}>
          {message}
        </h3>
      </div>

      {/* CSS for additional animations */}
      <style jsx>{`
        @keyframes checkmark {
          0% {
            stroke-dashoffset: 100;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  );
}

