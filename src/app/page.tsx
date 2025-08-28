"use client";

import { useEvents } from '@/context/EventContext';
import { EventForm } from '@/components/EventForm';
import { EventList } from '@/components/EventList';
import { addDays, isWithinInterval, startOfToday } from 'date-fns';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { PlusCircle } from 'lucide-react';

export default function Home() {
  const { events } = useEvents();
  const [isDialogOpen, setDialogOpen] = useState(false);

  const upcomingEvents = useMemo(() => {
    const today = startOfToday();
    const sevenDaysFromNow = addDays(today, 7);
    return events.filter(event =>
      isWithinInterval(new Date(event.datetime), { start: today, end: sevenDaysFromNow })
    );
  }, [events]);

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Upcoming Events</h1>
        <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2" />
              Create Event
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
              <DialogDescription>
                Fill in the details below to add a new event to your calendar.
              </DialogDescription>
            </DialogHeader>
            <EventForm onEventCreated={() => setDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
      <EventList events={upcomingEvents} emptyStateMessage="No events in the next 7 days."/>
    </div>
  );
}
