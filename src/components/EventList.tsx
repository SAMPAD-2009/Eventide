
import type { Event } from '@/lib/types';
import { EventCard } from '@/components/EventCard';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface EventListProps {
  events: Event[];
  emptyStateMessage?: string;
  onEditEvent: (event: Event) => void;
  isReadOnly?: boolean;
}

export function EventList({ events, emptyStateMessage = "No events to display.", onEditEvent, isReadOnly = false }: EventListProps) {
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 gap-4 mt-8">
        <Image
            src="/event-not-min.png"
            alt="No events found"
            data-ai-hint="illustration empty state"
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
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1
          }
        }
      }}
      initial="hidden"
      animate="show"
    >
      <AnimatePresence>
        {events.map(event => (
           <motion.div
            key={event.event_id}
            variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
            exit={{ opacity: 0, scale: 0.9 }}
            layout
          >
            <EventCard event={event} onEdit={onEditEvent} isReadOnly={isReadOnly && !!event.collab_id} />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
