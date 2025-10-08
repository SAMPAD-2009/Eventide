
"use client";

import { format, parseISO } from 'date-fns';
import { Clock } from 'lucide-react';
import type { Event } from '@/lib/types';
import { getCategoryByName } from '@/lib/categories';
import { cn } from '@/lib/utils';

interface CalendarEventCardProps {
  event: Event;
  isDragging: boolean;
}

export function CalendarEventCard({ event, isDragging }: CalendarEventCardProps) {
  const categoryInfo = getCategoryByName(event.category);

  return (
    <div
      className={cn(
        "w-full rounded-md p-2 text-sm cursor-pointer border-l-4",
        "transition-all duration-200 ease-in-out",
        isDragging ? "shadow-lg scale-105" : "shadow-sm",
      )}
      style={{
          backgroundColor: categoryInfo ? `hsl(var(${categoryInfo.cssVars.bg}))` : 'hsl(var(--muted))',
          borderColor: categoryInfo ? `hsl(var(${categoryInfo.cssVars.fg}))` : 'hsl(var(--muted-foreground))',
          color: categoryInfo ? `hsl(var(${categoryInfo.cssVars.fg}))` : 'hsl(var(--muted-foreground))'
      }}
    >
        <p className="font-bold truncate">{event.title}</p>
        {event.datetime && (
             <div className="flex items-center gap-1 text-xs">
                <Clock className="h-3 w-3" />
                <span>{format(parseISO(event.datetime), 'p')}</span>
            </div>
        )}
    </div>
  );
}
