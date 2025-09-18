
"use client";

import { useEvents } from '@/context/EventContext';
import { EventList } from '@/components/EventList';
import { addDays, isAfter, startOfToday, isSameDay } from 'date-fns';
import { useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { EventListSkeleton } from '@/components/EventListSkeleton';

export default function FutureEventsPage() {
  const { events } = useEvents();
  const { user, isLoading: isAuthLoading } = useAuth();

  const futureEvents = useMemo(() => {
    const sevenDaysFromNow = addDays(startOfToday(), 7);
    return events.filter(event => {
      const eventDate = new Date(event.datetime);
      return isAfter(eventDate, sevenDaysFromNow) || isSameDay(eventDate, sevenDaysFromNow);
    });
  }, [events]);

  if (isAuthLoading || !user) {
    return (
       <div className="w-full mx-auto p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tight mb-6">Future Events</h1>
          <p className="text-muted-foreground mb-6">
            This page lists all events scheduled 7 days or more from now.
          </p>
          <EventListSkeleton count={2} />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Future Events</h1>
        <p className="text-muted-foreground mb-6">
          This page lists all events scheduled 7 days or more from now.
        </p>
        <EventList events={futureEvents} emptyStateMessage="No events scheduled beyond the next 7 days."/>
      </div>
    </div>
  );
}
