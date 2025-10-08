
"use client";

import { Draggable } from 'react-beautiful-dnd';
import { format, parseISO } from 'date-fns';
import { Clock, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Event } from '@/lib/types';
import { getCategoryByName } from '@/lib/categories';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface DraggableEventCardProps {
  event: Event;
  index: number;
}

export function DraggableEventCard({ event, index }: DraggableEventCardProps) {
  const categoryInfo = getCategoryByName(event.category);

  return (
    <Draggable draggableId={event.event_id} index={index}>
      {(provided, snapshot) => (
        <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
        >
            <Card 
                className={cn(
                    "border-l-4 transition-shadow",
                    snapshot.isDragging && "shadow-lg scale-105"
                )} 
                style={{ borderColor: categoryInfo ? `hsl(var(${categoryInfo?.cssVars.fg}))` : undefined }}
            >
                <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-md leading-tight">{event.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                    {event.datetime && (
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{format(parseISO(event.datetime), 'p')}</span>
                    </div>
                    )}
                    <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4" />
                        <Badge 
                        variant="default"
                        style={{
                            backgroundColor: `hsl(var(${categoryInfo?.cssVars.bg}))`,
                            color: `hsl(var(${categoryInfo?.cssVars.fg}))`,
                        }}
                        >
                            {event.category}
                        </Badge>
                    </div>
                </CardContent>
            </Card>
        </div>
      )}
    </Draggable>
  );
}
