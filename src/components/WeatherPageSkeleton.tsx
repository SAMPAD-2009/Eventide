
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function WeatherPageSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {/* Left Sidebar Skeleton */}
      <div className="lg:col-span-1 xl:col-span-1 space-y-6">
        <Card className="p-6">
          <Skeleton className="h-28 w-28 mb-4" />
          <Skeleton className="h-12 w-3/4 mb-2" />
          <Skeleton className="h-6 w-1/2 mb-4" />
          <Skeleton className="h-px w-full my-4" />
          <Skeleton className="h-6 w-full mb-2" />
          <Skeleton className="h-6 w-3/4" />
        </Card>
        <Card className="p-6">
            <Skeleton className="h-8 w-1/2 mb-4" />
            <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex justify-between items-center">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-6 w-1/4" />
                        <Skeleton className="h-6 w-1/3" />
                    </div>
                ))}
            </div>
        </Card>
      </div>

      {/* Main Content Skeleton */}
      <div className="lg:col-span-2 xl:col-span-3 space-y-6">
        <Skeleton className="h-8 w-1/3 mb-2" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6"><Skeleton className="h-32 w-full" /></Card>
          <Card className="p-6"><Skeleton className="h-32 w-full" /></Card>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <Card className="p-6"><Skeleton className="h-20 w-full" /></Card>
          <Card className="p-6"><Skeleton className="h-20 w-full" /></Card>
          <Card className="p-6"><Skeleton className="h-20 w-full" /></Card>
          <Card className="p-6"><Skeleton className="h-20 w-full" /></Card>
        </div>
        <Card className="p-6">
            <Skeleton className="h-8 w-1/3 mb-4" />
            <div className="flex justify-between">
                 {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                        <Skeleton className="h-5 w-10" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-6 w-8" />
                    </div>
                ))}
            </div>
        </Card>
      </div>
    </div>
  );
}
