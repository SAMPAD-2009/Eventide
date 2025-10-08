
"use client";

import { useState, useMemo } from 'react';
import { useEvents } from '@/context/EventContext';
import { useAuth } from '@/context/AuthContext';
import { isSameDay, parseISO, startOfToday, format, startOfMonth, add } from 'date-fns';
import type { Event } from '@/lib/types';
import { getCategoryByName } from '@/lib/categories';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { EventListSkeleton } from '@/components/EventListSkeleton';
import { PlusCircle, Trash2, Pencil, Calendar as CalendarIcon, Clock, Tag, Infinity } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { EventForm } from '@/components/EventForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function CalendarPage() {
  const { events, deleteEvent, isLoading: areEventsLoading } = useEvents();
  const { user, isLoading: isAuthLoading } = useAuth();

  const [date, setDate] = useState<Date | undefined>(new Date());
  const [month, setMonth] = useState<Date>(startOfMonth(new Date()));

  const [isFormOpen, setFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);


  const eventsOnSelectedDate = useMemo(() => {
    if (!date) return [];
    return events.filter(event => event.datetime && isSameDay(parseISO(event.datetime), date));
  }, [events, date]);

  const handleEditClick = (event: Event) => {
    setEditingEvent(event);
    setFormOpen(true);
  };

  const handleCreateClick = () => {
    setEditingEvent(null);
    setFormOpen(true);
  };
  
  const handleFormSubmit = () => {
    setFormOpen(false);
    setEditingEvent(null);
  };

  const DayWithDot = ({ day, date }: { day: Date; date: Date | undefined }) => {
    const hasEvents = useMemo(() => {
        return events.some(event => event.datetime && isSameDay(parseISO(event.datetime), day));
    }, [day]);

    return (
        <div className="relative">
            {format(day, 'd')}
            {hasEvents && <div className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-primary" />}
        </div>
    );
};


  if (isAuthLoading || areEventsLoading) {
    return (
        <div className="w-full mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-bold tracking-tight mb-6">Calendar</h1>
            <Card>
                <CardContent className="p-6">
                    <EventListSkeleton count={10} />
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
        <Dialog open={isFormOpen} onOpenChange={setFormOpen}>
            <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>{editingEvent ? 'Edit Event' : 'Create New Event'}</DialogTitle>
              <DialogDescription>
                {editingEvent ? 'Update the details for your event below.' : `Adding a new event for ${date ? format(date, 'PPP') : ''}.`}
              </DialogDescription>
            </DialogHeader>
            <div className="flex-grow overflow-y-auto px-1 py-2">
                <EventForm 
                    event={editingEvent}
                    onEventCreated={handleFormSubmit}
                    onEventUpdated={handleFormSubmit}
                    selectedDate={date}
                />
            </div>
            </DialogContent>
        </Dialog>


      <header className="flex items-center justify-between border-b px-4 py-3 sm:px-6">
        <h1 className="text-xl font-semibold">Calendar</h1>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 md:flex-row md:gap-6 md:p-6">
        <div className="flex-shrink-0">
          <Card>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              month={month}
              onMonthChange={setMonth}
              className="p-3"
              components={{
                Day: ({ date: dayDate }) => <DayWithDot day={dayDate} date={date} />,
              }}
            />
          </Card>
        </div>
        <Card className="flex flex-1 flex-col">
          <CardContent className="flex flex-1 flex-col p-4 md:p-6">
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold">
                        {date ? format(date, 'PPP') : 'Select a date'}
                    </h2>
                     <p className="text-sm text-muted-foreground">
                        {eventsOnSelectedDate.length} {eventsOnSelectedDate.length === 1 ? 'event' : 'events'}
                    </p>
                </div>
               <Button size="sm" onClick={handleCreateClick} disabled={!date}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Event
              </Button>
            </div>
            <ScrollArea className="flex-1">
              <div className="space-y-3 pr-4">
                {date && eventsOnSelectedDate.length > 0 ? (
                  eventsOnSelectedDate.map(event => {
                    const categoryInfo = getCategoryByName(event.category);
                    return (
                        <div key={event.event_id} className="flex items-start gap-3 rounded-lg border p-3" style={{borderColor: categoryInfo ? `hsl(var(${categoryInfo.cssVars.fg}))` : 'hsl(var(--border))'}}>
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                    <p className="font-semibold">{event.title}</p>
                                    <Badge 
                                        variant="outline"
                                        style={{
                                            backgroundColor: `hsl(var(${categoryInfo?.cssVars.bg}))`,
                                            color: `hsl(var(${categoryInfo?.cssVars.fg}))`,
                                            borderColor: `hsl(var(${categoryInfo?.cssVars.fg}))`,
                                        }}
                                        >
                                        {event.category}
                                    </Badge>
                                </div>
                                {event.details && <p className="text-sm text-muted-foreground">{event.details}</p>}
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                     {event.datetime && !event.isIndefinite ? (
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            <span>{format(parseISO(event.datetime), 'p')}</span>
                                        </div>
                                    ) : (
                                         <div className="flex items-center gap-1">
                                            <Infinity className="h-3 w-3" />
                                            <span>Indefinite</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center">
                                <Button variant="ghost" size="icon" onClick={() => handleEditClick(event)}>
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete your event.
                                        </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => deleteEvent(event.event_id)} className="bg-red-600 text-destructive-foreground hover:bg-red-700">Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                    );
                  })
                ) : (
                  <div className="flex h-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 py-12">
                    <CalendarIcon className="h-10 w-10 text-muted-foreground/80" />
                    <p className="mt-4 text-center text-muted-foreground">
                      {date ? 'No events for this day.' : 'Select a day to see events.'}
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

