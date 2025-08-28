import type { Event } from '@/lib/types';
import { EventCard } from '@/components/EventCard';
import { Card, CardContent } from './ui/card';

interface EventListProps {
  events: Event[];
  emptyStateMessage?: string;
}

export function EventList({ events, emptyStateMessage = "No events to display." }: EventListProps) {
  if (events.length === 0) {
    return (
        <Card className="flex items-center justify-center h-48">
            <CardContent className="p-6">
                <p className="text-muted-foreground">{emptyStateMessage}</p>
            </CardContent>
        </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {events.map(event => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
