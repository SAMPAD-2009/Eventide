
"use client";

import { format, parseISO } from 'date-fns';
import { Clock, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Event } from '@/lib/types';
import { getCategoryByName } from '@/lib/categories';
import { Badge } from '@/components/ui/badge';

interface CalendarEventCardProps {
  event: Event;
}

export function CalendarEventCard({ event }: CalendarEventCardProps) {
  const categoryInfo = getCategoryByName(event.category);

  return (
    <Card className="border-l-4" style={{ borderColor: categoryInfo ? `hsl(var(${categoryInfo?.cssVars.fg}))` : undefined }}>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-md leading-tight">{event.title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{format(parseISO(event.datetime), 'p')}</span>
        </div>
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
  );
}
