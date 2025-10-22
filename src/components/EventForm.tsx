
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, parseISO } from 'date-fns';
import { Calendar as CalendarIcon, Loader2, ChevronsUpDown, PlusCircle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { useEvents } from '@/context/EventContext';
import { useLabels } from '@/context/LabelContext';
import { useEffect, useState } from 'react';
import { Checkbox } from './ui/checkbox';
import type { Event } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command';
import { Badge } from './ui/badge';
import { LabelDialog } from './settings/LabelDialog';
import { CATEGORIES, getCategoryByName } from '@/lib/categories';
import { summarize } from '@/ai/flows/summarize-flow';

const eventFormSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters long." }),
  details: z.string().optional(),
  date: z.date().optional(),
  time: z.string().optional(),
  label_id: z.string().optional(),
  category: z.string().optional(),
  isIndefinite: z.boolean().default(false).optional(),
}).refine(data => data.isIndefinite || (data.date && data.time), {
    message: "Date and time are required unless the event is indefinite.",
    path: ['date'],
});


type EventFormValues = z.infer<typeof eventFormSchema>;

interface EventFormProps {
    event?: Event | null;
    onEventCreated?: (data: any) => void;
    onEventUpdated?: (data: any) => void;
    selectedDate?: Date;
}

export function EventForm({ event, onEventCreated, onEventUpdated, selectedDate }: EventFormProps) {
  const { addEvent, updateEvent, isLoading } = useEvents();
  const { labels, getLabelById } = useLabels();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCategoryPopoverOpen, setCategoryPopoverOpen] = useState(false);
  const [isLabelDialogOpen, setLabelDialogOpen] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      details: "",
      date: undefined,
      time: "",
      label_id: undefined,
      category: "Other",
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
            time: event.isIndefinite || !event.datetime ? '' : format(parseISO(event.datetime), 'HH:mm'),
            label_id: event.label_id ?? undefined,
            category: event.category,
            isIndefinite: event.isIndefinite,
        });
    } else {
        form.reset({
            title: "",
            details: "",
            date: selectedDate ?? new Date(),
            time: selectedDate ? format(selectedDate, 'HH:mm') : format(new Date(), 'HH:mm'),
            label_id: undefined,
            category: "Other",
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
        // await updateEvent(event.event_id, eventData);
        onEventUpdated?.(eventData);
    } else {
        // await addEvent(eventData);
        onEventCreated?.(eventData);
    }
  };

  const handleSummarize = async () => {
    const details = form.getValues('details');
    if (!details || details.trim().length < 20) {
      toast({
        variant: 'destructive',
        title: 'Not enough text',
        description: 'Please provide more details to generate a summary.',
      });
      return;
    }
    setIsSummarizing(true);
    try {
      const summary = await summarize(details);
      form.setValue('details', summary, { shouldDirty: true });
    } catch (e) {
      console.error(e);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to generate summary.' });
    } finally {
      setIsSummarizing(false);
    }
  };


  const currentLabelId = form.watch('label_id');
  const selectedLabel = currentLabelId ? getLabelById(currentLabelId) : null;
  const currentCategoryName = form.watch('category');
  const selectedCategory = currentCategoryName ? getCategoryByName(currentCategoryName) : null;

  return (
    <>
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
                           <div className="flex items-center justify-between">
                             <FormLabel>Event Details (Optional)</FormLabel>
                             <Button
                               type="button"
                               variant="ghost"
                               size="sm"
                               onClick={handleSummarize}
                               disabled={isSummarizing}
                             >
                               {isSummarizing ? (
                                 <Loader2 className="animate-spin" />
                               ) : (
                                 <Sparkles className="text-yellow-500" />
                               )}
                               Summarize
                             </Button>
                           </div>
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
                        <FormItem className="flex flex-row items-center space-x-2 space-y-0 pt-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Indefinite Event
                            </FormLabel>
                             <FormDescription>
                                This event has no specific date or time.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                        control={form.control}
                        name="label_id"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Category</FormLabel>
                                <Popover open={isCategoryPopoverOpen} onOpenChange={setCategoryPopoverOpen}>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                className={cn("w-full justify-between", !field.value && !currentCategoryName && "text-muted-foreground")}
                                            >
                                                {selectedLabel ? (
                                                     <Badge style={{ backgroundColor: selectedLabel.color }}>
                                                        {selectedLabel.name}
                                                    </Badge>
                                                ) : selectedCategory ? (
                                                    <Badge className={cn(selectedCategory.colorClass)}>
                                                        {selectedCategory.name}
                                                    </Badge>
                                                ) : (
                                                    "Select a category"
                                                )}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                       <Command>
                                            <CommandInput placeholder="Search labels..." />
                                            <CommandList>
                                                <CommandEmpty>No labels found.</CommandEmpty>
                                                <CommandGroup heading="Categories">
                                                  {CATEGORIES.map((cat) => (
                                                    <CommandItem
                                                      value={cat.name}
                                                      key={cat.name}
                                                      onSelect={() => {
                                                          form.setValue("category", cat.name);
                                                          form.setValue("label_id", undefined);
                                                          setCategoryPopoverOpen(false);
                                                      }}
                                                    >
                                                        {cat.name}
                                                    </CommandItem>
                                                  ))}
                                                </CommandGroup>
                                                <CommandSeparator />
                                                <CommandGroup heading="Custom Labels">
                                                    {labels.map((label) => (
                                                        <CommandItem
                                                            value={label.name}
                                                            key={label.label_id}
                                                            onSelect={() => {
                                                                form.setValue("label_id", label.label_id);
                                                                form.setValue("category", undefined);
                                                                setCategoryPopoverOpen(false);
                                                            }}
                                                        >
                                                            <div className="flex items-center">
                                                                <span className="h-2 w-2 rounded-full mr-2" style={{ backgroundColor: label.color }} />
                                                                {label.name}
                                                            </div>
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                                <CommandSeparator />
                                                <CommandGroup>
                                                     <CommandItem onSelect={() => {
                                                         setCategoryPopoverOpen(false);
                                                         setLabelDialogOpen(true);
                                                     }}>
                                                        <PlusCircle className="mr-2 h-4 w-4" />
                                                        Create new label
                                                     </CommandItem>
                                                </CommandGroup>
                                            </CommandList>
                                       </Command>
                                    </PopoverContent>
                                </Popover>
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
    <LabelDialog isOpen={isLabelDialogOpen} onOpenChange={setLabelDialogOpen} label={null} />
    </>
  );
}

    