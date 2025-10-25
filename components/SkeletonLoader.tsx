import React from 'react';

const SkeletonBlock: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-slate-200 dark:bg-slate-700 rounded animate-pulse ${className}`} />
);

const SkeletonLoader: React.FC = () => {
  return (
    <div className="bg-white dark:bg-primary">
      {/* Skeleton Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <SkeletonBlock className="h-8 w-32" />
            <div className="hidden md:flex items-center space-x-8">
              <SkeletonBlock className="h-4 w-16" />
              <SkeletonBlock className="h-4 w-20" />
              <SkeletonBlock className="h-4 w-16" />
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <SkeletonBlock className="h-10 w-10 rounded-full" />
              <SkeletonBlock className="h-10 w-24 rounded-lg" />
            </div>
            <div className="md:hidden">
              <SkeletonBlock className="h-8 w-8" />
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Skeleton Hero */}
        <section className="text-center py-24 sm:py-32 lg:py-48 min-h-screen flex items-center justify-center">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <SkeletonBlock className="h-12 sm:h-16 w-3/4 mx-auto mb-4" />
            <SkeletonBlock className="h-12 sm:h-16 w-1/2 mx-auto mb-8" />
            <SkeletonBlock className="h-6 w-full max-w-2xl mx-auto mb-8" />
            <SkeletonBlock className="h-14 w-48 mx-auto rounded-lg" />
          </div>
        </section>

        {/* Skeleton About */}
        <section className="py-20 sm:py-28 bg-white dark:bg-secondary">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <SkeletonBlock className="w-full aspect-[4/3] rounded-xl" />
              </div>
              <div>
                <SkeletonBlock className="h-10 w-3/4 mb-6" />
                <SkeletonBlock className="h-4 w-full mb-4" />
                <SkeletonBlock className="h-4 w-full mb-4" />
                <SkeletonBlock className="h-4 w-5/6 mb-8" />
                <SkeletonBlock className="h-12 w-40 rounded-lg" />
              </div>
            </div>
          </div>
        </section>
        
        {/* Skeleton Services */}
        <section className="py-20 sm:py-28 bg-slate-50 dark:bg-primary">
             <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                     <SkeletonBlock className="h-10 w-1/2 mx-auto mb-4" />
                     <SkeletonBlock className="h-5 w-3/4 mx-auto" />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <SkeletonBlock className="h-56 rounded-xl" />
                    <SkeletonBlock className="h-56 rounded-xl" />
                    <SkeletonBlock className="h-56 rounded-xl" />
                    <SkeletonBlock className="h-56 rounded-xl" />
                </div>
            </div>
        </section>

        {/* Skeleton Portfolio */}
        <section className="py-20 sm:py-28 bg-white dark:bg-secondary">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <SkeletonBlock className="h-10 w-1/2 mx-auto mb-4" />
              <SkeletonBlock className="h-5 w-3/4 mx-auto" />
            </div>
            <div className="flex justify-center flex-wrap gap-4 mb-12">
              <SkeletonBlock className="h-10 w-20 rounded-full" />
              <SkeletonBlock className="h-10 w-24 rounded-full" />
              <SkeletonBlock className="h-10 w-28 rounded-full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <SkeletonBlock className="w-full aspect-video rounded-lg" />
              <SkeletonBlock className="w-full aspect-video rounded-lg" />
              <SkeletonBlock className="w-full aspect-video rounded-lg" />
              <SkeletonBlock className="w-full aspect-video rounded-lg" />
              <SkeletonBlock className="w-full aspect-video rounded-lg" />
              <SkeletonBlock className="w-full aspect-video rounded-lg" />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default SkeletonLoader;
