
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
import { Checkbox } from '@/components/ui/checkbox';
import { useState } from 'react';

interface EventCardProps {
  event: Event;
  onEdit: (event: Event) => void;
}

export function EventCard({ event, onEdit }: EventCardProps) {
  const { deleteEvent } = useEvents();
  const categoryInfo = getCategoryByName(event.category);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleQuickDelete = () => {
    setIsDeleting(true);
    setTimeout(() => {
      deleteEvent(event.event_id);
    }, 500); // Wait for the animation to finish
  };


  return (
    <Card 
        className={cn(
            "border-2 flex flex-col transition-opacity duration-500",
            isDeleting ? "opacity-50" : "opacity-100"
        )} 
        style={{ borderColor: categoryInfo ? `hsl(var(${categoryInfo?.cssVars.fg}))` : undefined }}>
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start gap-2">
            <div className="flex items-start gap-3 flex-1">
                 <Checkbox
                    id={`delete-${event.event_id}`}
                    aria-label={`Mark and delete ${event.title}`}
                    className="mt-1"
                    onCheckedChange={handleQuickDelete}
                 />
                <div className="flex-1">
                    <CardTitle className={cn(
                        "text-lg leading-tight transition-all duration-300",
                        isDeleting ? "line-through text-muted-foreground" : ""
                    )}>
                        {event.title}
                    </CardTitle>
                </div>
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
                          onClick={() => deleteEvent(event.event_id)}
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
      <CardContent className="p-4 pt-0 pl-11 flex-grow min-h-[40px]">
        {event.details && (
          <p className="text-sm text-muted-foreground line-clamp-2">{event.details}</p>
        )}
      </CardContent>
      <CardFooter className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground p-4 pt-0 pl-11">
        {event.isIndefinite || !event.datetime ? (
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
