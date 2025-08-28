
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useEvents } from '@/context/EventContext';
import { CATEGORIES } from '@/lib/categories';

const eventFormSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters long." }),
  details: z.string().optional(),
  date: z.date({ required_error: "A date is required." }),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Invalid time format (HH:MM)." }),
  category: z.string().min(2, { message: "Category must be at least 2 characters long." }),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

interface EventFormProps {
    onEventCreated?: () => void;
}

export function EventForm({ onEventCreated }: EventFormProps) {
  const { addEvent, isLoading } = useEvents();
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      details: "",
      date: new Date(),
      time: format(new Date(), 'HH:mm'),
      category: "Personal",
    },
  });

  const onSubmit = async (data: EventFormValues) => {
    const eventData = {
      ...data,
      date: format(data.date, 'yyyy-MM-dd'),
    };
    await addEvent(eventData);
    form.reset();
    onEventCreated?.();
  };

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
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
                <Textarea placeholder="Discuss quarterly goals and project updates..." className="resize-none" {...field} />
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />
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
                        >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                        </Button>
                    </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
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
                        <Input type="time" className="w-full" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
            <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
        <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
            <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Summary...
            </>
            ) : (
            'Add Event'
            )}
        </Button>
        </form>
    </Form>
  );
}
