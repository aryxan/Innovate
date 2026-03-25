import React from 'react';

export const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-ashoka-blue/5 rounded-xl ${className}`} />
);

export const DashboardSkeleton = () => (
  <div className="space-y-8">
    {/* Stats Skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 p-6 h-32 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <Skeleton className="w-10 h-10 rounded-lg" />
            <Skeleton className="w-12 h-4 rounded-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="w-20 h-3" />
            <Skeleton className="w-24 h-6" />
          </div>
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Chart Skeleton */}
      <div className="lg:col-span-2 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 p-6 h-[450px]">
        <div className="flex justify-between items-center mb-8">
          <div className="space-y-2">
            <Skeleton className="w-48 h-6" />
            <Skeleton className="w-64 h-4" />
          </div>
          <div className="flex gap-4">
            <Skeleton className="w-16 h-4" />
            <Skeleton className="w-16 h-4" />
          </div>
        </div>
        <Skeleton className="w-full h-[300px] rounded-xl" />
      </div>

      {/* Sidebar Skeleton */}
      <div className="bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 p-6 h-[450px] flex flex-col">
        <div className="flex items-center gap-3 mb-6">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <Skeleton className="w-32 h-6" />
        </div>
        <div className="space-y-6 flex-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="w-2 h-2 rounded-full" />
                <Skeleton className="w-24 h-4" />
              </div>
              <Skeleton className="w-full h-12 rounded-lg" />
            </div>
          ))}
        </div>
        <Skeleton className="w-full h-12 rounded-xl mt-8" />
      </div>
    </div>
  </div>
);

export const TableSkeleton = () => (
  <div className="bg-ashoka-blue/5 rounded-2xl border border-ashoka-blue/10 overflow-hidden">
    <div className="p-6 border-b border-ashoka-blue/10 flex items-center justify-between">
      <Skeleton className="w-48 h-6" />
      <div className="flex gap-2">
        <Skeleton className="w-20 h-6 rounded-full" />
        <Skeleton className="w-20 h-6 rounded-full" />
      </div>
    </div>
    <div className="p-6 space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
          <Skeleton className="w-24 h-4" />
          <Skeleton className="w-48 h-4" />
          <Skeleton className="w-20 h-4" />
          <Skeleton className="w-16 h-4" />
          <Skeleton className="w-24 h-4" />
        </div>
      ))}
    </div>
  </div>
);

export const MapSkeleton = () => (
  <div className="h-[600px] bg-ashoka-blue/5 rounded-2xl border border-ashoka-blue/10 overflow-hidden relative">
    <div className="absolute inset-0 bg-cream">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000080_1px,transparent_1px)] [background-size:20px_20px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] border border-ashoka-blue/5 rounded-full animate-pulse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] border border-ashoka-blue/5 rounded-full animate-pulse" />
      
      <div className="absolute top-6 left-6 bg-ashoka-blue/5 p-4 rounded-xl border border-ashoka-blue/10 w-48 space-y-3">
        <Skeleton className="w-32 h-4" />
        <div className="space-y-2">
          <Skeleton className="w-24 h-2" />
          <Skeleton className="w-20 h-2" />
          <Skeleton className="w-28 h-2" />
        </div>
      </div>

      <div className="absolute bottom-6 right-6 flex flex-col gap-2">
        <Skeleton className="w-10 h-10 rounded-lg" />
        <Skeleton className="w-10 h-10 rounded-lg" />
      </div>
    </div>
  </div>
);

export const FormSkeleton = () => (
  <div className="max-w-3xl mx-auto bg-ashoka-blue/5 rounded-2xl border border-ashoka-blue/10 p-8 space-y-10">
    <div className="flex items-center gap-4">
      <Skeleton className="w-12 h-12 rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="w-48 h-6" />
        <Skeleton className="w-64 h-4" />
      </div>
    </div>
    
    {/* Location Section Skeleton */}
    <div className="space-y-4">
      <div className="flex justify-between">
        <Skeleton className="w-32 h-3" />
        <Skeleton className="w-24 h-3" />
      </div>
      <Skeleton className="w-full h-24 rounded-xl" />
      <div className="grid grid-cols-3 gap-4">
        <Skeleton className="h-12 rounded-xl" />
        <Skeleton className="h-12 rounded-xl" />
        <Skeleton className="h-12 rounded-xl" />
      </div>
    </div>

    {/* Contact Section Skeleton */}
    <div className="space-y-4">
      <Skeleton className="w-40 h-3" />
      <div className="flex gap-4">
        <Skeleton className="flex-1 h-12 rounded-xl" />
        <Skeleton className="w-24 h-12 rounded-xl" />
      </div>
    </div>

    {/* Details Section Skeleton */}
    <div className="grid grid-cols-2 gap-6">
      <div className="space-y-2">
        <Skeleton className="w-32 h-3" />
        <Skeleton className="w-full h-12 rounded-xl" />
      </div>
      <div className="space-y-2">
        <Skeleton className="w-32 h-3" />
        <Skeleton className="w-full h-12 rounded-xl" />
      </div>
    </div>

    <Skeleton className="w-full h-14 rounded-xl" />
  </div>
);
