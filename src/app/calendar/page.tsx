
"use client";

import { useState, useMemo, useCallback } from 'react';
import { useEvents } from '@/context/EventContext';
import { addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, format, startOfWeek, endOfWeek, isSameMonth, isToday, parseISO, set } from 'date-fns';
import type { Event } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, PlusCircle } from 'lucide-react';
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
import { DayView } from '@/components/calendar/DayView';

export default function CalendarPage() {
  const { events, updateEvent, isLoading: areEventsLoading } = useEvents();
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [isFormOpen, setFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [selectedDateForForm, setSelectedDateForForm] = useState<Date | undefined>(undefined);
  const [selectedDayForView, setSelectedDayForView] = useState<Date | null>(null);


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
    setSelectedDateForForm(undefined);
    setFormOpen(true);
  };

  const handleFormSubmit = () => {
    setFormOpen(false);
    setEditingEvent(null);
    setSelectedDateForForm(undefined);
  };
  
  const handleDayDoubleClick = (day: Date) => {
    setEditingEvent(null);
    setSelectedDateForForm(day);
    setFormOpen(true);
  };

  const handleTimeSlotDoubleClick = (date: Date) => {
    setEditingEvent(null);
    setSelectedDateForForm(date);
    setFormOpen(true);
  };

  const handleDayClick = (day: Date) => {
    setSelectedDayForView(day);
  }

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const activeEvent = events.find(e => e.event_id === active.id);
      
      if (!activeEvent) return;

      const overId = over.id.toString();
      
      // Dragging within Month View
      if (overId.includes('-') && overId.length === 10) { // Date string 'yyyy-MM-dd'
        const targetDateStr = overId;
        if (activeEvent.datetime) {
          const originalDate = parseISO(activeEvent.datetime);
          // parseISO is strict, so we need to provide a time component.
          const newDate = parseISO(`${targetDateStr}T00:00:00`);
          
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
      // Dragging within Day View
      else if (overId.startsWith('time-slot-')) {
        const hour = parseInt(overId.replace('time-slot-', ''), 10);
        if (activeEvent.datetime) {
            const originalDate = parseISO(activeEvent.datetime);
            const updatedDateTime = set(originalDate, {
                hours: hour,
                minutes: 0, // Snap to the beginning of the hour
                seconds: 0
            });
             const eventDataForUpdate = {
                ...activeEvent,
                date: format(updatedDateTime, 'yyyy-MM-dd'),
                time: format(updatedDateTime, 'HH:mm'),
            };
            updateEvent(activeEvent.event_id, eventDataForUpdate);
        }
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
        <div className="flex h-[calc(100vh-4rem)] flex-col">
            <Dialog open={isFormOpen} onOpenChange={setFormOpen}>
                <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                  <DialogTitle>{editingEvent ? 'Edit Event' : 'Create New Event'}</DialogTitle>
                  <DialogDescription>
                    {editingEvent ? 'Update the details for your event below.' : 'Fill in the details to add a new event.'}
                  </DialogDescription>
                </DialogHeader>
                <div className="flex-grow overflow-y-auto px-1 py-2">
                    <EventForm 
                        event={editingEvent}
                        selectedDate={selectedDateForForm}
                        onEventCreated={handleFormSubmit}
                        onEventUpdated={handleFormSubmit}
                    />
                </div>
                </DialogContent>
            </Dialog>

            <header className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b p-4">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <h1 className="text-xl md:text-2xl font-semibold text-center sm:text-left">
                        {selectedDayForView ? format(selectedDayForView, 'MMMM d, yyyy') : format(currentMonth, 'MMMM yyyy')}
                    </h1>
                    {!selectedDayForView && (
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" onClick={prevMonth}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" onClick={goToToday}>Today</Button>
                            <Button variant="outline" size="icon" onClick={nextMonth}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>
                 <Button onClick={() => { setEditingEvent(null); setSelectedDateForForm(selectedDayForView || new Date()); setFormOpen(true); }} className="w-full sm:w-auto">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    <span className="sm:inline">Create Event</span>
                 </Button>
            </header>

            {selectedDayForView ? (
                 <DayView
                    selectedDay={selectedDayForView}
                    events={eventsByDate.get(format(selectedDayForView, 'yyyy-MM-dd')) || []}
                    onBack={() => setSelectedDayForView(null)}
                    onEditEvent={handleEditClick}
                    onTimeSlotDoubleClick={handleTimeSlotDoubleClick}
                 />
            ) : (
                <div className="grid grid-cols-7 flex-1 border-t border-l">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="border-b border-r text-center font-medium text-muted-foreground p-2 text-xs sm:text-sm bg-background">
                            <span className="hidden sm:inline">{day}</span>
                            <span className="sm:hidden">{day.charAt(0)}</span>
                        </div>
                    ))}
                
                    {daysInMonth.map(day => {
                        const dateKey = format(day, 'yyyy-MMdd');
                        const dayEvents = eventsByDate.get(format(day, 'yyyy-MM-dd')) || [];
                        
                        return (
                            <DroppableDay
                                key={day.toString()}
                                date={day}
                                isCurrentMonth={isSameMonth(day, currentMonth)}
                                isToday={isToday(day)}
                                onDoubleClick={handleDayDoubleClick}
                                onClick={handleDayClick}
                            >
                                {dayEvents.map(event => (
                                    <DraggableEvent key={event.event_id} event={event} onEditClick={handleEditClick} />
                                ))}
                            </DroppableDay>
                        );
                    })}
                </div>
            )}
        </div>
    </DndContext>
  );
}
