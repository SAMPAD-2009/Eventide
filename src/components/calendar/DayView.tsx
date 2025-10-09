
"use client";

import { useDroppable } from '@dnd-kit/core';
import type { Event } from '@/lib/types';
import { Button } from '../ui/button';
import { ArrowLeft, Edit } from 'lucide-react';
import { DraggableDayEvent } from './DraggableDayEvent';
import { format, parseISO, set } from 'date-fns';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface DayViewProps {
  selectedDay: Date;
  events: Event[];
  onBack: () => void;
  onEditEvent: (event: Event) => void;
  onTimeSlotDoubleClick: (date: Date) => void;
}

const hours = Array.from({ length: 24 }, (_, i) => i);

export function DayView({ selectedDay, events, onBack, onEditEvent, onTimeSlotDoubleClick }: DayViewProps) {
  const eventsByHour = useMemo(() => {
    const map = new Map<number, Event[]>();
    events.forEach(event => {
      if (event.datetime) {
        const hour = parseISO(event.datetime).getHours();
        if (!map.has(hour)) {
          map.set(hour, []);
        }
        map.get(hour)!.push(event);
      }
    });
    return map;
  }, [events]);

  const TimeSlot = ({ hour }: { hour: number }) => {
    const { setNodeRef, isOver } = useDroppable({ id: `time-slot-${hour}` });
    const hourEvents = eventsByHour.get(hour) || [];

    const handleDoubleClick = () => {
        const newEventDate = set(selectedDay, { hours: hour, minutes: 0, seconds: 0, milliseconds: 0 });
        onTimeSlotDoubleClick(newEventDate);
    };

    return (
      <div
        ref={setNodeRef}
        className={cn(
            "relative flex border-t border-r border-border min-h-[60px]",
            isOver && "bg-accent"
        )}
        onDoubleClick={handleDoubleClick}
      >
        <div className="w-20 text-center text-sm text-muted-foreground pt-1 border-r">
          {format(new Date(2000, 0, 1, hour), 'ha')}
        </div>
        <div className="flex-1 p-1 space-y-1">
          {hourEvents.map(event => (
            <DraggableDayEvent key={event.event_id} event={event} onEdit={onEditEvent} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="p-2 border-b">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Month
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="border-l">
          {hours.map(hour => (
            <TimeSlot key={hour} hour={hour} />
          ))}
        </div>
      </div>
    </div>
  );
}
