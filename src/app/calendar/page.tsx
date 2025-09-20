
"use client";

import { useState } from 'react';
import { useEvents } from '@/context/EventContext';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { isSameDay, parseISO } from 'date-fns';
import { EventListSkeleton } from '@/components/EventListSkeleton';
import { useAuth } from '@/context/AuthContext';
import { CalendarEventCard } from '@/components/CalendarEventCard';

export default function CalendarPage() {
  const { events, isLoading: areEventsLoading } = useEvents();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [date, setDate] = useState<Date | undefined>(new Date());

  const eventsOnSelectedDate = events.filter(event =>
    date && !event.isIndefinite && isSameDay(parseISO(event.datetime), date)
  );

  const eventDays = events
    .filter(event => !event.isIndefinite)
    .map(event => parseISO(event.datetime));

  const dayModifiers = {
    hasEvent: eventDays,
  };

  const dayModifiersClassNames = {
    hasEvent: 'has-event',
  };

  if (isAuthLoading || areEventsLoading) {
    return (
      <div className="w-full mx-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tight mb-6">Event Calendar</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <Card className="w-full max-w-md mx-auto">
              <CardContent className="p-0">
                 <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="p-3"
                    disabled
                  />
              </CardContent>
            </Card>
             <div className="mt-8 md:mt-0">
                <h2 className="text-xl font-semibold mb-4">Events on Selected Date</h2>
                <EventListSkeleton count={1} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .has-event {
          position: relative;
        }
        .has-event::after {
          content: '';
          position: absolute;
          bottom: 6px;
          left: 50%;
          transform: translateX(-50%);
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background-color: hsl(var(--primary));
        }
        .rdp-day_selected.has-event::after {
           background-color: hsl(var(--primary-foreground));
        }
      `}</style>
      <div className="w-full mx-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tight mb-6">Event Calendar</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <Card className="w-full max-w-md mx-auto">
              <CardContent className="p-0">
                 <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="p-3"
                    modifiers={dayModifiers}
                    modifiersClassNames={dayModifiersClassNames}
                  />
              </CardContent>
            </Card>
            <div className="mt-8 md:mt-0">
                <h2 className="text-xl font-semibold mb-4">
                    {date ? `Events on ${date.toLocaleDateString()}` : 'Select a date'}
                </h2>
                {date ? (
                    eventsOnSelectedDate.length > 0 ? (
                        <div className="space-y-4">
                            {eventsOnSelectedDate.map(event => (
                                <CalendarEventCard key={event.id} event={event} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground">No events for this day.</p>
                    )
                ) : (
                    <p className="text-muted-foreground">Select a day on the calendar to see events.</p>
                )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
