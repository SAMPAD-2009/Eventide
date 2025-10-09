
"use client";

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { Event } from '@/lib/types';
import { getCategoryByName } from '@/lib/categories';
import { cn } from '@/lib/utils';
import { GripVertical } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface DraggableDayEventProps {
  event: Event;
  onEdit: (event: Event) => void;
}

export function DraggableDayEvent({ event, onEdit }: DraggableDayEventProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: event.event_id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 100 : undefined,
  };

  const categoryInfo = getCategoryByName(event.category);

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div
        className={cn(
          "p-2 text-sm rounded-md shadow-sm flex items-start gap-2",
          isDragging && "shadow-lg opacity-80"
        )}
        style={{
          backgroundColor: categoryInfo ? `hsl(var(${categoryInfo.cssVars.bg}))` : undefined,
          borderColor: categoryInfo ? `hsl(var(${categoryInfo.cssVars.fg}))` : undefined,
          borderLeftWidth: '4px',
        }}
      >
        <div {...listeners} className="cursor-grab touch-none pt-0.5">
          <GripVertical className="h-4 w-4 text-muted-foreground/50" />
        </div>
        <div 
            className="flex-1 cursor-pointer" 
            onClick={(e) => { e.stopPropagation(); onEdit(event); }}
        >
          <p
            className="font-semibold"
            style={{ color: categoryInfo ? `hsl(var(${categoryInfo.cssVars.fg}))` : undefined }}
          >
            {event.title}
          </p>
          {event.datetime && (
            <p className="text-xs" style={{ color: categoryInfo ? `hsl(var(${categoryInfo.cssVars.fg}))` : undefined, opacity: 0.8 }}>
              {format(parseISO(event.datetime), 'p')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
