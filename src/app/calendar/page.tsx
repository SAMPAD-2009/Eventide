
"use client";

import { useState } from 'react';
import type { DayContentProps } from 'react-day-picker';
import { useEvents } from '@/context/EventContext';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { isSameDay, parseISO, startOfDay, set } from 'date-fns';
import { EventListSkeleton } from '@/components/EventListSkeleton';
import { useAuth } from '@/context/AuthContext';
import { DraggableEventCard } from '@/components/DraggableEventCard';
import type { Event } from '@/lib/types';
import { getCategoryByName } from '@/lib/categories';
import { DragDropContext, Droppable, OnDragEndResponder, DropResult } from 'react-beautiful-dnd';
import { cn } from '@/lib/utils';

export default function CalendarPage() {
  const { events, updateEvent, isLoading: areEventsLoading } = useEvents();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isDraggingOverDate, setIsDraggingOverDate] = useState<Date | null>(null);

  const eventsOnSelectedDate = events.filter(event =>
    date && !event.isIndefinite && event.datetime && isSameDay(parseISO(event.datetime), date)
  ).sort((a,b) => parseISO(a.datetime!).getTime() - parseISO(b.datetime!).getTime());

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    setIsDraggingOverDate(null); // Reset highlight on drop

    if (!destination) {
      return;
    }
    
    // Check if the drop target is a calendar day
    if (destination.droppableId.startsWith('calendar-day-')) {
        const eventToMove = events.find(e => e.event_id === draggableId);
        if (!eventToMove || !eventToMove.datetime) return;

        const sourceDate = parseISO(eventToMove.datetime);
        const newDateString = destination.droppableId.replace('calendar-day-', '');
        const newDate = parseISO(newDateString);

        if (isSameDay(sourceDate, newDate)) return; // No change if dropped on the same day

        const updatedDateTime = set(newDate, {
            hours: sourceDate.getHours(),
            minutes: sourceDate.getMinutes(),
            seconds: sourceDate.getSeconds(),
        });

        const eventData = {
            title: eventToMove.title,
            details: eventToMove.details,
            date: updatedDateTime.toISOString().split('T')[0],
            time: updatedDateTime.toTimeString().substring(0,5),
            category: eventToMove.category,
            isIndefinite: eventToMove.isIndefinite,
        };
        
        updateEvent(eventToMove.event_id, eventData);
    }
    // Handle reordering within the list if you implement it
  };

  const handleDragUpdate = (update: any) => {
    if (update.destination && update.destination.droppableId.startsWith('calendar-day-')) {
        const dateString = update.destination.droppableId.replace('calendar-day-', '');
        setIsDraggingOverDate(parseISO(dateString));
    } else {
        setIsDraggingOverDate(null);
    }
  }


  function DayContentWithDrop(props: DayContentProps) {
    const eventsOnDate = events.filter(event => 
      !event.isIndefinite && event.datetime && isSameDay(parseISO(event.datetime), props.date)
    );
    const isDroppingOver = isDraggingOverDate && isSameDay(props.date, isDraggingOverDate);

    // This is no longer a Droppable itself, just a visual container
    return (
        <div
            className={cn(
                "relative h-full w-full flex flex-col items-center justify-center rounded-md p-1",
                isDroppingOver && "bg-primary/20 ring-2 ring-primary"
            )}
        >
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
             <div className="md:w-1/2">
                <h2 className="text-xl font-semibold mb-4">Events on Selected Date</h2>
                <EventListSkeleton count={1} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd} onDragUpdate={handleDragUpdate}>
        <div className="w-full mx-auto p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold tracking-tight mb-6">Event Calendar</h1>
            <div className="flex flex-col md:flex-row gap-8">
                {/* The calendar itself is now the drop zone context */}
                <Droppable droppableId="calendar" isDropDisabled={false}>
                    {(provided) => (
                        <div ref={provided.innerRef} {...provided.droppableProps} className="flex-grow flex">
                            <Card className="flex-grow flex">
                                <CardContent className="p-0 flex flex-1">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    className="p-3 w-full h-full"
                                    components={{
                                        DayContent: DayContentWithDrop
                                    }}
                                    dayPickerProps={{
                                        // This is a way to pass info down to the DayContent
                                        // We can check if a day is a drop target
                                        getDropTargetId: (day: Date) => `calendar-day-${day.toISOString().split('T')[0]}`
                                    }}
                                    
                                />
                                </CardContent>
                            </Card>
                            {/* This placeholder is for the overall calendar droppable */}
                             <div style={{ display: 'none' }}>{provided.placeholder}</div>
                        </div>
                    )}
                </Droppable>

                <div className="md:w-1/2">
                    <h2 className="text-xl font-semibold mb-4">
                        {date ? `Events on ${date.toLocaleDateString()}` : 'Select a date'}
                    </h2>
                    {date ? (
                         <Droppable droppableId={`event-list-${date.toISOString().split('T')[0]}`}>
                            {(provided) => (
                                <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-4">
                                    {eventsOnSelectedDate.length > 0 ? (
                                        eventsOnSelectedDate.map((event, index) => (
                                            <DraggableEventCard key={event.event_id} event={event} index={index} />
                                        ))
                                    ) : (
                                        <p className="text-muted-foreground">No events for this day. Drag events from other days to schedule them here.</p>
                                    )}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    ) : (
                        <p className="text-muted-foreground">Select a day on the calendar to see events.</p>
                    )}
                </div>
            </div>
        </div>
        </div>
    </DragDropContext>
  );
}
