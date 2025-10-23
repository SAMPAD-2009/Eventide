
"use client";

import { useEvents } from '@/context/EventContext';
import { EventForm } from '@/components/EventForm';
import { EventList } from '@/components/EventList';
import { addDays, isWithinInterval, startOfToday, isSameDay } from 'date-fns';
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
import { PlusCircle, CalendarDays } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { EventListSkeleton } from '@/components/EventListSkeleton';
import type { Event } from '@/lib/types';
import Link from 'next/link';

export default function Home() {
  const { events, addEvent, updateEvent, isLoading: areEventsLoading } = useEvents();
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const upcomingEvents = useMemo(() => {
    const today = startOfToday();
    const sevenDaysFromNow = addDays(today, 7);
    // Include all events, personal and collaborated
    return events.filter(event => {
      if (event.isIndefinite || !event.datetime) return true;
      const eventDate = new Date(event.datetime);
      return isWithinInterval(eventDate, { start: today, end: sevenDaysFromNow }) || isSameDay(eventDate, sevenDaysFromNow);
    });
  }, [events]);

  const handleCreateClick = () => {
    setEditingEvent(null);
    setDialogOpen(true);
  };

  const handleEditClick = (event: Event) => {
    // This page only edits personal events
    if (event.collab_id) return;
    setEditingEvent(event);
    setDialogOpen(true);
  }

  const handleFormSubmit = () => {
    setDialogOpen(false);
    setEditingEvent(null);
  }

  const handleEventCreated = (data: any) => {
    addEvent(data);
    handleFormSubmit();
  }

  const handleEventUpdated = (data: any) => {
    if (editingEvent) {
      updateEvent(editingEvent.event_id, data);
    }
    handleFormSubmit();
  }

  if (isAuthLoading || areEventsLoading) {
    return (
      <div className="w-full mx-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Upcoming Events</h1>
            <Button disabled>
              <PlusCircle className="mr-2" />
              Create Event
            </Button>
        </div>
        <EventListSkeleton count={4} />
      </div>
    );
  }

  if (!user) {
    // This case should be handled by AuthProvider redirect, but it's a good fallback.
    // You could also render a "Please login" message here.
    return (
       <div className="w-full mx-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Upcoming Events</h1>
        </div>
         <p>Please log in to see your events.</p>
      </div>
    )
  }

  return (
    <div className="w-full mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Upcoming Events</h1>
        <div className="flex items-center gap-2">
           <Button asChild variant="outline">
              <Link href="/calendar">
                <CalendarDays className="mr-2 h-4 w-4" />
                View Calendar
              </Link>
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleCreateClick}>
                  <PlusCircle className="mr-2" />
                  Create Event
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                  <DialogTitle>{editingEvent ? 'Edit Event' : 'Create New Event'}</DialogTitle>
                  <DialogDescription>
                    {editingEvent ? 'Update the details for your event below.' : 'Fill in the details below to add a new event to your calendar.'}
                  </DialogDescription>
                </DialogHeader>
                <div className="flex-grow overflow-y-auto px-1 py-2">
                    <EventForm 
                      event={editingEvent} 
                      onEventCreated={handleEventCreated}
                      onEventUpdated={handleEventUpdated}
                    />
                </div>
              </DialogContent>
            </Dialog>
        </div>
      </div>
      <EventList 
        events={upcomingEvents} 
        emptyStateMessage="No personal events in the next 7 days."
        onEditEvent={handleEditClick}
        isReadOnly={true}
      />
    </div>
  );
}
