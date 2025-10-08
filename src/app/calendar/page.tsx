
"use client";

import { useState, useMemo, useCallback } from 'react';
import { useEvents } from '@/context/EventContext';
import { addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, format, startOfWeek, endOfWeek, isSameMonth, isToday, parseISO, set } from 'date-fns';
import type { Event } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { EventListSkeleton } from '@/components/EventListSkeleton';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EventForm } from '@/components/EventForm';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import { DroppableDay } from '@/components/DroppableDay';
import { DraggableEvent } from '@/components/DraggableEvent';

export default function CalendarPage() {
  const { events, updateEvent, isLoading: areEventsLoading } = useEvents();
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [isFormOpen, setFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const daysInMonth = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, Event[]>();
    events.forEach(event => {
      if (event.datetime) {
        const dateKey = format(parseISO(event.datetime), 'yyyy-MM-dd');
        if (!map.has(dateKey)) {
          map.set(dateKey, []);
        }
        map.get(dateKey)!.push(event);
      }
    });
    return map;
  }, [events]);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(startOfMonth(new Date()));

  const handleEditClick = (event: Event) => {
    setEditingEvent(event);
    setFormOpen(true);
  };
  
  const handleFormSubmit = () => {
    setFormOpen(false);
    setEditingEvent(null);
  };

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const activeEvent = events.find(e => e.event_id === active.id);
      const targetDateStr = over.id as string;

      if (activeEvent && activeEvent.datetime) {
        const originalDate = parseISO(activeEvent.datetime);
        const newDate = parseISO(targetDateStr);
        
        const updatedDateTime = set(newDate, {
          hours: originalDate.getHours(),
          minutes: originalDate.getMinutes(),
          seconds: originalDate.getSeconds(),
        });
        
        const eventDataForUpdate = {
          ...activeEvent,
          date: format(updatedDateTime, 'yyyy-MM-dd'),
          time: format(updatedDateTime, 'HH:mm'),
        };
        
        updateEvent(activeEvent.event_id, eventDataForUpdate);
      }
    }
  }, [events, updateEvent]);
  
  if (areEventsLoading) {
    return (
        <div className="w-full mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-bold tracking-tight mb-6">Calendar</h1>
            <EventListSkeleton count={10} />
        </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="flex h-[calc(100vh-4rem)] flex-col p-4 md:p-6">
            <Dialog open={isFormOpen} onOpenChange={setFormOpen}>
                <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                  <DialogTitle>{editingEvent ? 'Edit Event' : 'Create New Event'}</DialogTitle>
                  <DialogDescription>
                    {editingEvent ? 'Update the details for your event below.' : `Adding a new event.`}
                  </DialogDescription>
                </DialogHeader>
                <div className="flex-grow overflow-y-auto px-1 py-2">
                    <EventForm 
                        event={editingEvent}
                        onEventCreated={handleFormSubmit}
                        onEventUpdated={handleFormSubmit}
                    />
                </div>
                </DialogContent>
            </Dialog>

            <header className="flex items-center justify-between border-b pb-4 mb-4">
                <div className="flex items-center gap-4">
                <h1 className="text-2xl font-semibold">{format(currentMonth, 'MMMM yyyy')}</h1>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={prevMonth}>
                    <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" onClick={goToToday}>Today</Button>
                    <Button variant="outline" size="icon" onClick={nextMonth}>
                    <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
                </div>
                 <Button onClick={() => { setEditingEvent(null); setFormOpen(true); }}>Create Event</Button>
            </header>

            <div className="grid grid-cols-7 flex-1 border-t border-l">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="border-b border-r text-center font-medium text-muted-foreground p-2 text-sm">
                        {day}
                    </div>
                ))}
            
                {daysInMonth.map(day => {
                    const dateKey = format(day, 'yyyy-MM-dd');
                    const dayEvents = eventsByDate.get(dateKey) || [];
                    
                    return (
                        <DroppableDay
                            key={day.toString()}
                            date={day}
                            isCurrentMonth={isSameMonth(day, currentMonth)}
                            isToday={isToday(day)}
                        >
                            {dayEvents.map(event => (
                                <DraggableEvent key={event.event_id} event={event} onEditClick={handleEditClick} />
                            ))}
                        </DroppableDay>
                    );
                })}
            </div>
        </div>
    </DndContext>
  );
}
