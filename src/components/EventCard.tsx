
"use client";

import { format } from 'date-fns';
import { Calendar, Clock, Tag, Trash2 } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useEvents } from '@/context/EventContext';
import type { Event } from '@/lib/types';
import { getCategoryByName } from '@/lib/categories';
import { cn } from '@/lib/utils';

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const { deleteEvent } = useEvents();
  const categoryInfo = getCategoryByName(event.category);

  return (
    <Card>
      <CardHeader className="p-4">
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="text-xl">{event.title}</CardTitle>
                <CardDescription className="pt-1">{event.summary}</CardDescription>
            </div>
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
                    <AlertDialogAction onClick={() => deleteEvent(event.id)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-sm text-muted-foreground">{event.details}</p>
      </CardContent>
      <CardFooter className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground p-4 pt-0">
        <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{format(new Date(event.datetime), 'E, d MMM yyyy')}</span>
        </div>
        <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{format(new Date(event.datetime), 'p')}</span>
        </div>
        <div className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            <Badge 
              variant="outline"
              className={cn('border-transparent', categoryInfo?.colorClass)}
            >
                {event.category}
            </Badge>
        </div>
      </CardFooter>
    </Card>
  );
}
