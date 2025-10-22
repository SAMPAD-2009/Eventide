
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function HistoryEventCardSkeleton() {
  return (
    <Card className="flex flex-col overflow-hidden">
        <Skeleton className="relative w-full h-48 bg-muted" />
      <CardHeader>
        <Skeleton className="h-7 w-32" />
      </CardHeader>
      <CardContent className="flex-grow space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </CardContent>
    </Card>
  );
}
