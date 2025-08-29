
"use client";

import { useEvents } from '@/context/EventContext';
import { EventList } from '@/components/EventList';
import { addDays, isAfter, startOfToday } from 'date-fns';
import { useMemo, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { EventListSkeleton } from '@/components/EventListSkeleton';

export default function FutureEventsPage() {
  const { events } = useEvents();
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login');
    }
  }, [user, isAuthLoading, router]);

  const futureEvents = useMemo(() => {
    const sevenDaysFromNow = addDays(startOfToday(), 7);
    return events.filter(event => isAfter(new Date(event.datetime), sevenDaysFromNow));
  }, [events]);

  if (isAuthLoading || !user) {
    return (
       <div className="w-full mx-auto p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tight mb-6">Future Events</h1>
          <p className="text-muted-foreground mb-6">
            This page lists all events scheduled more than 7 days from now.
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
          This page lists all events scheduled more than 7 days from now.
        </p>
        <EventList events={futureEvents} emptyStateMessage="No events scheduled beyond the next 7 days."/>
      </div>
    </div>
  );
}
