'use client';

import { useEffect, useState } from 'react';

export default function FloatingBubbles({ count = 35 }: { count?: number }) {
  const [bubbles, setBubbles] = useState<Array<{
    id: number;
    left: string;
    bottom: string;
    size: number;
    delay: number;
    duration: number;
  }>>([]);

  useEffect(() => {
    // Generate new bubbles whenever component mounts (resets animation)
    const newBubbles = [...Array(count)].map((_, i) => {
      const size = Math.random() * 40 + 30; // 30-70px (bigger bubbles)
      return {
        id: i,
        left: `${Math.random() * 100}%`,
        bottom: `${Math.random() * 100 - 20}%`, // Start at different heights
        size,
        delay: Math.random() * 10,
        duration: Math.random() * 15 + 15, // 15-30s
      };
    });
    setBubbles(newBubbles);
  }, []); // Runs on mount, resets bubbles

  return (
    <div className="absolute inset-0 pointer-events-none">
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className="absolute rounded-full bg-white opacity-10 animate-float-bubble"
          style={{
            left: bubble.left,
            bottom: bubble.bottom,
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            animationDelay: `${bubble.delay}s`,
            animationDuration: `${bubble.duration}s`
          }}
        />
      ))}
    </div>
  );
}

