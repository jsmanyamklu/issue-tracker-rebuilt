import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({
  className = '',
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse',
}: SkeletonProps) {
  const baseClasses = 'bg-gray-200 rounded';

  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]',
    none: '',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${animationClasses[animation]}
        ${className}
      `}
      style={style}
    />
  );
}

// Predefined skeleton components
export function CardSkeleton() {
  return (
    <div className="bg-white p-6 rounded-lg shadow border border-gray-200 space-y-4">
      <Skeleton variant="text" height={24} width="60%" />
      <Skeleton variant="text" height={16} width="100%" />
      <Skeleton variant="text" height={16} width="80%" />
      <div className="flex gap-2 mt-4">
        <Skeleton variant="rectangular" height={24} width={60} />
        <Skeleton variant="rectangular" height={24} width={80} />
      </div>
    </div>
  );
}

export function ProjectCardSkeleton() {
  return (
    <div className="bg-white p-6 rounded-lg shadow border border-gray-200 space-y-4">
      <Skeleton variant="text" height={24} width="70%" />
      <Skeleton variant="text" height={16} width="100%" />
      <Skeleton variant="text" height={16} width="90%" />
      <div className="flex gap-2 mt-4">
        <Skeleton variant="rectangular" height={20} width={70} />
        <Skeleton variant="rectangular" height={20} width={90} />
        <Skeleton variant="rectangular" height={20} width={80} />
      </div>
      <div className="pt-4 border-t border-gray-100">
        <Skeleton variant="text" height={14} width="50%" />
      </div>
    </div>
  );
}

export function IssueListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="bg-white p-4 rounded-lg border border-gray-200 space-y-3"
        >
          <Skeleton variant="text" height={20} width="80%" />
          <div className="flex gap-2">
            <Skeleton variant="rectangular" height={20} width={60} />
            <Skeleton variant="rectangular" height={20} width={50} />
            <Skeleton variant="rectangular" height={20} width={70} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow text-center space-y-2">
            <Skeleton variant="text" height={32} width={60} className="mx-auto" />
            <Skeleton variant="text" height={16} width={100} className="mx-auto" />
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <Skeleton variant="text" height={24} width={150} className="mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton variant="text" height={18} width="90%" />
                <div className="flex gap-2">
                  <Skeleton variant="rectangular" height={18} width={50} />
                  <Skeleton variant="rectangular" height={18} width={60} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <Skeleton variant="text" height={24} width={150} className="mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton variant="text" height={18} width="85%" />
                <Skeleton variant="text" height={14} width="70%" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 p-4">
        <div className="flex gap-4">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} variant="text" height={16} width={100} />
          ))}
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-200">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="p-4">
            <div className="flex gap-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton key={colIndex} variant="text" height={16} width={120} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
