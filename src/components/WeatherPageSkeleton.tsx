
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function WeatherPageSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row bg-background rounded-lg shadow-lg overflow-hidden w-full min-h-[calc(100vh-8rem)]">
        {/* Sidebar Skeleton */}
        <aside className="w-full lg:w-1/3 xl:w-1/4 bg-card-foreground/5 dark:bg-card flex flex-col items-center p-6 text-center">
            <div className="w-full flex justify-between items-center">
                <Skeleton className="h-9 w-36" />
                <Skeleton className="h-10 w-10 rounded-full" />
            </div>
            <Skeleton className="h-48 w-full my-8" />
            <Skeleton className="h-20 w-48 mb-4" />
            <Skeleton className="h-8 w-32" />
            <div className="mt-auto space-y-2 w-full">
                <Skeleton className="h-5 w-3/4 mx-auto" />
                <Skeleton className="h-5 w-1/2 mx-auto" />
            </div>
        </aside>

        {/* Main Content Skeleton */}
        <main className="w-full lg:w-2/3 xl:w-3/4 p-6 md:p-10">
            <div className="flex justify-end gap-2 mb-8">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-10 w-10 rounded-full" />
            </div>

            {/* Forecast Skeleton */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-10">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Card key={i} className="p-4 flex flex-col items-center">
                        <Skeleton className="h-5 w-24 mb-2" />
                        <Skeleton className="h-16 w-16 rounded-full my-2" />
                        <Skeleton className="h-5 w-16" />
                    </Card>
                ))}
            </div>

            {/* Highlights Skeleton */}
            <div>
                <Skeleton className="h-8 w-56 mb-6" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-6 space-y-2"><Skeleton className="h-6 w-24" /><Skeleton className="h-12 w-32" /><Skeleton className="h-5 w-16" /></Card>
                    <Card className="p-6 space-y-2"><Skeleton className="h-6 w-24" /><Skeleton className="h-12 w-24" /><Skeleton className="h-4 w-full" /></Card>
                    <Card className="p-6 space-y-2"><Skeleton className="h-6 w-24" /><Skeleton className="h-12 w-36" /></Card>
                    <Card className="p-6 space-y-2"><Skeleton className="h-6 w-24" /><Skeleton className="h-12 w-32" /></Card>
                </div>
            </div>
        </main>
    </div>
  );
}
