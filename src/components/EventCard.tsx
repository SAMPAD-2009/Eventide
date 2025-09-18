
"use client";

import { format } from 'date-fns';
import { Calendar, Clock, Tag, Trash2, Infinity, Pencil } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useEvents } from '@/context/EventContext';
import type { Event } from '@/lib/types';
import { getCategoryByName } from '@/lib/categories';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface EventCardProps {
  event: Event;
  onEdit: (event: Event) => void;
}

export function EventCard({ event, onEdit }: EventCardProps) {
  const { deleteEvent } = useEvents();
  const categoryInfo = getCategoryByName(event.category);

  return (
    <Card className="border-2 flex flex-col" style={{ borderColor: categoryInfo ? `hsl(var(${categoryInfo?.cssVars.fg}))` : undefined }}>
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start gap-2">
            <div className="flex-1">
                <CardTitle className="text-lg leading-tight">{event.title}</CardTitle>
            </div>
            <div className="flex items-center -mr-2 -mt-2">
                 <Button variant="ghost" size="icon" className="flex-shrink-0" onClick={() => onEdit(event)}>
                    <Pencil className="h-4 w-4 text-muted-foreground" />
                </Button>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="flex-shrink-0">
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your event.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => deleteEvent(event.id)}
                          className="bg-red-600 text-destructive-foreground hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 flex-grow min-h-[40px]">
        {event.details && (
          <p className="text-sm text-muted-foreground line-clamp-2">{event.details}</p>
        )}
      </CardContent>
      <CardFooter className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground p-4 pt-0">
        {event.isIndefinite ? (
            <div className="flex items-center gap-2">
                <Infinity className="h-4 w-4" />
                <span>Lasts forever</span>
            </div>
        ) : (
            <>
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(event.datetime), 'E, d MMM')}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{format(new Date(event.datetime), 'p')}</span>
                </div>
            </>
        )}
        <div className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            <Badge 
              variant="default"
              style={{
                backgroundColor: `hsl(var(${categoryInfo?.cssVars.bg}))`,
                color: `hsl(var(${categoryInfo?.cssVars.fg}))`,
                border: `1px solid hsl(var(${categoryInfo?.cssVars.fg}))`,
              }}
            >
                {event.category}
            </Badge>
        </div>
      </CardFooter>
    </Card>
  );
}
