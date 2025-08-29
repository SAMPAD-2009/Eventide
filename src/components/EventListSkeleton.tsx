
import { EventCardSkeleton } from '@/components/EventCardSkeleton';

interface EventListSkeletonProps {
  count: number;
}

export function EventListSkeleton({ count }: EventListSkeletonProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <EventCardSkeleton key={i} />
      ))}
    </div>
  );
}
