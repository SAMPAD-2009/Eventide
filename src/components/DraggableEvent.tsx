
"use client";

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import type { Event } from '@/lib/types';
import { getCategoryByName } from '@/lib/categories';
import { cn } from '@/lib/utils';
import { GripVertical } from 'lucide-react';

interface DraggableEventProps {
  event: Event;
  onEditClick: (event: Event) => void;
}

export function DraggableEvent({ event, onEditClick }: DraggableEventProps) {
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
        <Card
            className={cn(
                "p-1 sm:p-2 text-xs sm:text-sm rounded-md shadow-sm mb-1 flex items-center gap-1 cursor-grab",
                isDragging && "shadow-lg"
            )}
            style={{ 
                backgroundColor: categoryInfo ? `hsl(var(${categoryInfo.cssVars.bg}))` : undefined,
                borderColor: categoryInfo ? `hsl(var(${categoryInfo.cssVars.fg}))` : undefined,
            }}
             onClick={(e) => {
                // Prevent card click from triggering anything else, but allow edit button
                if ((e.target as HTMLElement).closest('button')) return;
                e.preventDefault();
                onEditClick(event);
            }}
        >
            <div {...listeners} className="cursor-grab touch-none p-1 -ml-1 hidden sm:block">
                <GripVertical className="h-4 w-4 text-muted-foreground/50" />
            </div>
            <span 
                className="font-medium truncate flex-1"
                style={{ color: categoryInfo ? `hsl(var(${categoryInfo.cssVars.fg}))` : undefined }}
            >
                {event.title}
            </span>
        </Card>
    </div>
  );
}
