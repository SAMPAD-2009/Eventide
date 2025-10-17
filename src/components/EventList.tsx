
import type { Event } from '@/lib/types';
import { EventCard } from '@/components/EventCard';
import Image from 'next/image';

interface EventListProps {
  events: Event[];
  emptyStateMessage?: string;
  onEditEvent: (event: Event) => void;
}

export function EventList({ events, emptyStateMessage = "No events to display.", onEditEvent }: EventListProps) {
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 gap-4 mt-8">
        <Image
            src="https://i.ibb.co/Q7Qy1VB/event-not-min.png"
            alt="No events found"
            width={300}
            height={300}
            className="max-w-[200px] md:max-w-[300px] rounded-lg"
        />
        <h3 className="text-xl md:text-2xl font-semibold text-muted-foreground mt-4">{emptyStateMessage}</h3>
        <p className="text-muted-foreground">Try creating a new event to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {events.map(event => (
        <EventCard key={event.event_id} event={event} onEdit={onEditEvent} />
      ))}
    </div>
  );
}
