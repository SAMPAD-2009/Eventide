"use client";

import { useEvents } from '@/context/EventContext';
import { EventForm } from '@/components/EventForm';
import { EventList } from '@/components/EventList';
import { addDays, isWithinInterval, startOfToday } from 'date-fns';
import { useMemo } from 'react';

export default function Home() {
  const { events } = useEvents();

  const upcomingEvents = useMemo(() => {
    const today = startOfToday();
    const sevenDaysFromNow = addDays(today, 7);
    return events.filter(event =>
      isWithinInterval(new Date(event.datetime), { start: today, end: sevenDaysFromNow })
    );
  }, [events]);

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1 lg:sticky lg:top-24">
          <EventForm />
        </div>
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold tracking-tight mb-6">Upcoming Events</h1>
          <EventList events={upcomingEvents} emptyStateMessage="No events in the next 7 days."/>
        </div>
      </div>
    </div>
  );
}
