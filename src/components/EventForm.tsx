
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, parseISO } from 'date-fns';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useEvents } from '@/context/EventContext';
import { CATEGORIES } from '@/lib/categories';
import { useEffect } from 'react';
import { Checkbox } from './ui/checkbox';
import type { Event } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

const eventFormSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters long." }),
  details: z.string().optional(),
  date: z.date().optional(),
  time: z.string().optional(),
  category: z.string().min(1, { message: "Please select a category." }),
  isIndefinite: z.boolean().default(false).optional(),
}).refine(data => data.isIndefinite || (data.date && data.time), {
    message: "Date and time are required unless the event is indefinite.",
    path: ['date'],
});


type EventFormValues = z.infer<typeof eventFormSchema>;

interface EventFormProps {
    event?: Event | null;
    onEventCreated?: () => void;
    onEventUpdated?: () => void;
    selectedDate?: Date;
}

export function EventForm({ event, onEventCreated, onEventUpdated, selectedDate }: EventFormProps) {
  const { addEvent, updateEvent, isLoading } = useEvents();
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      details: "",
      date: undefined,
      time: "",
      category: "",
      isIndefinite: false,
    },
  });

  const isIndefinite = form.watch('isIndefinite');
  
  useEffect(() => {
    if (event) {
        form.reset({
            title: event.title,
            details: event.details,
            date: event.isIndefinite || !event.datetime ? undefined : parseISO(event.datetime),
            time: event.isIndefinite || !event.datetime ? undefined : format(parseISO(event.datetime), 'HH:mm'),
            category: event.category,
            isIndefinite: event.isIndefinite,
        });
    } else {
         form.reset({
            title: "",
            details: "",
            date: selectedDate || new Date(),
            time: selectedDate ? '' : format(new Date(), 'HH:mm'),
            category: "Personal",
            isIndefinite: false,
        });
    }
  }, [event, form, selectedDate]);


  const onSubmit = async (data: EventFormValues) => {
    if (!user) {
        toast({
            variant: "destructive",
            title: "Not Logged In",
            description: "You must be logged in to create or update events."
        });
        return;
    }

    const eventData = {
      ...data,
      date: data.isIndefinite || !data.date ? undefined : format(data.date, 'yyyy-MM-dd'),
      time: data.isIndefinite ? undefined : data.time!,
    };

    if (event) {
        await updateEvent(event.event_id, eventData);
        onEventUpdated?.();
    } else {
        await addEvent(eventData);
        onEventCreated?.();
    }
  };

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 md:gap-8 space-y-6 md:space-y-0">
                <div className="space-y-6">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Event Title</FormLabel>
                            <FormControl>
                            <Input placeholder="Team Meeting" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="details"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Event Details (Optional)</FormLabel>
                            <FormControl>
                            <Textarea placeholder="Discuss quarterly goals and project updates..." className="resize-none h-32" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
                <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                            <FormLabel>Date</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                <FormControl>
                                    <Button
                                    variant="outline"
                                    className={cn('w-full justify-start text-left font-normal', !field.value && 'text-muted-foreground')}
                                    disabled={isIndefinite}
                                    >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {field.value ? format(field.value, 'PP') : <span>Pick a date</span>}
                                    </Button>
                                </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={!!isIndefinite}
                                    initialFocus
                                />
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="time"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Time</FormLabel>
                                <FormControl>
                                    <Input type="time" className="w-full" {...field} disabled={isIndefinite} value={field.value ?? ''} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                    </div>
                    <FormField
                      control={form.control}
                      name="isIndefinite"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Keep event forever
                            </FormLabel>
                            <FormDescription>
                              This event doesn't have a specific date/time.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {CATEGORIES.map(category => (
                                    <SelectItem key={category.name} value={category.name}>{category.name}</SelectItem>
                                ))}
                            </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
            </div>
        
        <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
            <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {event ? 'Updating...' : 'Creating...'}
            </>
            ) : (
             event ? 'Update Event' : 'Add Event'
            )}
        </Button>
        </form>
    </Form>
  );
}
