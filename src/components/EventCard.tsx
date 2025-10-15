
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
import type { Event, Label } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useState } from 'react';
import { useLabels } from '@/context/LabelContext';
import { getCategoryByName } from '@/lib/categories';

interface EventCardProps {
  event: Event;
  onEdit: (event: Event) => void;
}

export function EventCard({ event, onEdit }: EventCardProps) {
  const { deleteEvent } = useEvents();
  const { getLabelById } = useLabels();
  const [isDeleting, setIsDeleting] = useState(false);
  
  const label = event.label_id ? getLabelById(event.label_id) : null;
  const categoryInfo = event.category ? getCategoryByName(event.category) : null;

  let borderColor, badge;

  if (label) {
      borderColor = label.color;
      badge = (
        <Badge style={{ backgroundColor: label.color, color: '#ffffff' }}>
            {label.name}
        </Badge>
      );
  } else if (categoryInfo) {
      borderColor = `hsl(var(${categoryInfo.cssVars.fg}))`;
      badge = <Badge className={categoryInfo.colorClass}>{categoryInfo.name}</Badge>;
  }


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
        style={{ borderColor: borderColor }}>
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
                 <Button variant="ghost" size="icon" className="flex-shrink-0" onClick={() => onEdit(event)} disabled={isDeleting}>
                    <Pencil className="h-4 w-4 text-muted-foreground" />
                </Button>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="flex-shrink-0" disabled={isDeleting}>
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
        {badge && (
            <div className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                {badge}
            </div>
        )}
      </CardFooter>
    </Card>
  );
}
