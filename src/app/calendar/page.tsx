
"use client";

import { useState } from 'react';
import type { DayContentProps } from 'react-day-picker';
import { useEvents } from '@/context/EventContext';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { isSameDay, parseISO, startOfDay } from 'date-fns';
import { EventListSkeleton } from '@/components/EventListSkeleton';
import { useAuth } from '@/context/AuthContext';
import { CalendarEventCard } from '@/components/CalendarEventCard';
import type { Event } from '@/lib/types';
import { getCategoryByName } from '@/lib/categories';

function DayContentWithDots(props: DayContentProps) {
  const { events } = useEvents();
  const eventsOnDate = events.filter(event => 
    !event.isIndefinite && isSameDay(parseISO(event.datetime), props.date)
  );

  return (
    <div className="relative h-full w-full flex flex-col items-center justify-center">
      <span>{props.date.getDate()}</span>
      {eventsOnDate.length > 0 && (
        <div className="absolute bottom-1 flex space-x-0.5">
          {eventsOnDate.slice(0, 4).map((event, index) => {
            const categoryInfo = getCategoryByName(event.category);
            return (
              <div
                key={index}
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: categoryInfo ? `hsl(var(${categoryInfo.cssVars.fg}))` : 'gray' }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function CalendarPage() {
  const { events, isLoading: areEventsLoading } = useEvents();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [date, setDate] = useState<Date | undefined>(new Date());

  const eventsOnSelectedDate = events.filter(event =>
    date && !event.isIndefinite && isSameDay(parseISO(event.datetime), date)
  );

  if (isAuthLoading || areEventsLoading) {
    return (
      <div className="w-full mx-auto p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tight mb-6">Event Calendar</h1>
           <div className="flex flex-col md:flex-row gap-8">
            <Card className="flex-grow md:w-1/2">
              <CardContent className="p-0">
                 <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="p-3 w-full"
                    disabled
                  />
              </CardContent>
            </Card>
             <div className="md:w-1/3">
                <h2 className="text-xl font-semibold mb-4">Events on Selected Date</h2>
                <EventListSkeleton count={1} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Event Calendar</h1>
        <div className="flex flex-col md:flex-row gap-8 md:items-start">
          <Card className="flex-grow md:w-1/2">
            <CardContent className="p-0">
               <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="p-3 w-full"
                  components={{
                    DayContent: DayContentWithDots
                  }}
                />
            </CardContent>
          </Card>
          <div className="md:w-1/3">
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
  );
}
