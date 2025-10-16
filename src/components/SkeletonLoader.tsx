'use client';

interface SkeletonLoaderProps {
  count?: number;
  type?: 'product' | 'list';
}

export default function SkeletonLoader({ count = 3, type = 'product' }: SkeletonLoaderProps) {
  if (type === 'product') {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 animate-pulse">
            {/* Mobile Layout */}
            <div className="block sm:hidden">
              <div className="flex items-start space-x-3 mb-3">
                {/* Image skeleton */}
                <div className="flex-shrink-0 h-20 w-20 bg-gray-200 rounded-lg"></div>
                
                {/* Title and badges */}
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="flex gap-2">
                    <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                  </div>
                </div>
              </div>

              {/* Details skeleton */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
              </div>

              {/* Button skeleton */}
              <div className="h-10 bg-gray-200 rounded w-full"></div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden sm:flex items-start space-x-4">
              {/* Image skeleton */}
              <div className="flex-shrink-0 h-16 w-16 bg-gray-200 rounded-lg"></div>
              
              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 flex-1">
                    <div className="h-5 bg-gray-200 rounded w-48"></div>
                    <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded-full w-24"></div>
                </div>

                <div className="space-y-1">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-4 bg-gray-200 rounded w-40"></div>
                  <div className="h-4 bg-gray-200 rounded w-36"></div>
                </div>
              </div>

              {/* Button skeleton */}
              <div className="flex-shrink-0">
                <div className="h-8 bg-gray-200 rounded w-28"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Simple list skeleton
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="animate-pulse flex space-x-4">
          <div className="h-12 w-12 bg-gray-200 rounded"></div>
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

