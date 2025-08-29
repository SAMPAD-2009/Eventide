
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function ProfilePageSkeleton() {
  return (
    <div className="w-full mx-auto p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <Skeleton className="h-9 w-48" />
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-4 w-64 mt-2" />
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex flex-col items-center gap-6">
                    <Skeleton className="h-32 w-32 rounded-full" />
                     <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                        <Skeleton className="h-10 w-28" />
                        <Skeleton className="h-10 w-28" />
                    </div>
                </div>
                 <div className="space-y-4">
                    <Skeleton className="h-5 w-20" />
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <Skeleton className="h-10 flex-grow" />
                      <Skeleton className="h-10 w-32" />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-4 w-48" />
                 </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-full mt-2" />
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-10 w-full" />
                </div>
                 <div className="space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <Skeleton className="h-10 w-44" />
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
