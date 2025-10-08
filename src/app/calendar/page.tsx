
"use client";

import { useState } from 'react';
import { useEvents } from '@/context/EventContext';
import { useAuth } from '@/context/AuthContext';
import { isSameDay, parseISO, set, startOfMonth, endOfMonth, eachDayOfInterval, format, addMonths, subMonths, getDay, isToday } from 'date-fns';
import type { Event } from '@/lib/types';
import { getCategoryByName } from '@/lib/categories';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import type { DropResult } from 'react-beautiful-dnd';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { EventListSkeleton } from '@/components/EventListSkeleton';
import { CalendarEventCard } from '@/components/CalendarEventCard';

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarPage() {
  const { events, updateEvent, isLoading: areEventsLoading } = useEvents();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());

  const firstDayOfMonth = startOfMonth(currentDate);
  const lastDayOfMonth = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: firstDayOfMonth, end: lastDayOfMonth });

  // Create padding days for the start of the calendar grid
  const startingDayIndex = getDay(firstDayOfMonth);
  const paddingDays = Array.from({ length: startingDayIndex }, (_, i) => null);

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return; // Dropped outside a valid target
    if (destination.droppableId === source.droppableId) return; // No change

    const eventToMove = events.find(e => e.event_id === draggableId);
    if (!eventToMove) return;

    const destinationDate = parseISO(destination.droppableId);
    const sourceDate = eventToMove.datetime ? parseISO(eventToMove.datetime) : new Date();

    const newDateTime = set(destinationDate, {
      hours: sourceDate.getHours(),
      minutes: sourceDate.getMinutes(),
      seconds: sourceDate.getSeconds(),
    });

    const eventData = {
      title: eventToMove.title,
      details: eventToMove.details,
      date: newDateTime.toISOString().split('T')[0],
      time: newDateTime.toTimeString().substring(0, 5),
      category: eventToMove.category,
      isIndefinite: eventToMove.isIndefinite,
    };

    updateEvent(eventToMove.event_id, eventData);
  };

  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleToday = () => setCurrentDate(new Date());

  if (isAuthLoading || areEventsLoading) {
    return (
      <div className="w-full mx-auto p-4 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          </div>
          <div className="border rounded-lg p-4">
              <EventListSkeleton count={10} />
          </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto p-4 md:p-8">
       <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold tracking-tight">{format(currentDate, 'MMMM yyyy')}</h1>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={handlePrevMonth}><ChevronLeft className="h-4 w-4" /></Button>
                    <Button variant="outline" onClick={handleToday}>Today</Button>
                    <Button variant="outline" size="icon" onClick={handleNextMonth}><ChevronRight className="h-4 w-4" /></Button>
                </div>
            </div>
            <p className="text-sm text-muted-foreground">Drag and drop events to reschedule them.</p>
        </div>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-7 border-t border-l rounded-lg overflow-hidden">
          {dayNames.map(day => (
            <div key={day} className="text-center font-semibold p-2 border-b border-r bg-muted/50 text-muted-foreground text-sm">
              {day}
            </div>
          ))}

          {paddingDays.map((_, index) => (
            <div key={`padding-${index}`} className="border-b border-r bg-muted/20"></div>
          ))}

          {daysInMonth.map((day) => {
            const eventsOnDay = events.filter(event => event.datetime && isSameDay(parseISO(event.datetime), day));
            const droppableId = day.toISOString();

            return (
              <Droppable key={day.toString()} droppableId={droppableId}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      "h-48 min-w-[100px] border-b border-r p-2 flex flex-col gap-1 overflow-y-auto",
                      snapshot.isDraggingOver ? "bg-primary/20" : "bg-background",
                    )}
                  >
                    <span className={cn(
                        "font-semibold text-sm",
                        isToday(day) && "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center"
                    )}>
                      {format(day, 'd')}
                    </span>
                    <div className="flex-grow">
                        {eventsOnDay.map((event, index) => (
                          <Draggable key={event.event_id} draggableId={event.event_id} index={index}>
                            {(provided, snapshot) => (
                               <div
                                 ref={provided.innerRef}
                                 {...provided.draggableProps}
                                 {...provided.dragHandleProps}
                                 className="mb-1"
                               >
                                  <CalendarEventCard event={event} isDragging={snapshot.isDragging} />
                               </div>
                            )}
                          </Draggable>
                        ))}
                    </div>
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}

