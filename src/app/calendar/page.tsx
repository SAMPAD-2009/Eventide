
"use client";

import { useState } from 'react';
import { useEvents } from '@/context/EventContext';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { isSameDay, parseISO, startOfDay } from 'date-fns';
import { EventListSkeleton } from '@/components/EventListSkeleton';
import { useAuth } from '@/context/AuthContext';
import { CalendarEventCard } from '@/components/CalendarEventCard';
import type { Event } from '@/lib/types';
import { getCategoryByName } from '@/lib/categories';
import { CATEGORIES } from '@/lib/categories';

interface DayWithCategories {
  date: Date;
  categories: Set<string>;
}

export default function CalendarPage() {
  const { events, isLoading: areEventsLoading } = useEvents();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [date, setDate] = useState<Date | undefined>(new Date());

  const eventsOnSelectedDate = events.filter(event =>
    date && !event.isIndefinite && isSameDay(parseISO(event.datetime), date)
  );

  const getDayWithCategories = (): DayWithCategories[] => {
    const dateMap = new Map<string, Set<string>>();
    events
      .filter(event => !event.isIndefinite)
      .forEach(event => {
        const day = startOfDay(parseISO(event.datetime)).toISOString();
        if (!dateMap.has(day)) {
          dateMap.set(day, new Set());
        }
        dateMap.get(day)!.add(event.category);
      });
    return Array.from(dateMap.entries()).map(([dateStr, categories]) => ({
      date: new Date(dateStr),
      categories,
    }));
  };

  const dayWithCategories = getDayWithCategories();

  const dayModifiers = dayWithCategories.reduce((acc, item) => {
    item.categories.forEach(category => {
      const categoryClassName = `has-event-${category.toLowerCase()}`;
      if (!acc[categoryClassName]) {
        acc[categoryClassName] = [];
      }
      acc[categoryClassName].push(item.date);
    });
    return acc;
  }, {} as Record<string, Date[]>);
  
  const dayModifiersClassNames = Object.keys(dayModifiers).reduce((acc, key) => {
    acc[key] = key;
    return acc;
  }, {} as Record<string, string>);

  if (isAuthLoading || areEventsLoading) {
    return (
      <div className="w-full mx-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tight mb-6">Event Calendar</h1>
           <div className="flex flex-col md:flex-row gap-8">
            <Card className="md:w-1/2">
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
             <div className="md:w-1/2">
                <h2 className="text-xl font-semibold mb-4">Events on Selected Date</h2>
                <EventListSkeleton count={1} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const categoryStyles = CATEGORIES.map(category => {
    const categoryInfo = getCategoryByName(category.name);
    if (!categoryInfo) return '';
    return `
      .has-event-${category.name.toLowerCase()} {
        border-bottom: 3px solid hsl(var(${categoryInfo.cssVars.fg}));
      }
    `;
  }).join('');

  return (
    <>
      <style>{categoryStyles}</style>
      <div className="w-full mx-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tight mb-6">Event Calendar</h1>
          <div className="flex flex-col md:flex-row gap-8">
            <Card className="md:w-1/2">
              <CardContent className="p-0">
                 <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="p-3 w-full"
                    modifiers={dayModifiers}
                    modifiersClassNames={dayModifiersClassNames}
                  />
              </CardContent>
            </Card>
            <div className="md:w-1/2">
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
