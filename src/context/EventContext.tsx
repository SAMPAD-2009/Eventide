
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Event } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from './AuthContext';
import { createClient } from '@/lib/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';

type EventCreationData = Omit<Event, 'event_id' | 'datetime' | 'user_email'>;


interface EventContextType {
  events: Event[];
  addEvent: (eventData: EventCreationData) => Promise<void>;
  updateEvent: (event_id: string, eventData: EventCreationData) => Promise<void>;
  deleteEvent: (event_id: string) => Promise<void>;
  isLoading: boolean;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const { user } = useAuth();
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);

  useEffect(() => {
    // Initialize the Supabase client only on the client-side
    setSupabase(createClient());
  }, []);

  useEffect(() => {
    const loadEvents = async () => {
      if (user?.email && supabase) {
        setIsLoading(true);
        try {
          const { data, error } = await supabase
            .from('events')
            .select('*')
            .eq('user_email', user.email)
            .order('datetime', { ascending: false });

          if (error) throw error;
          
          // The datetime might come back in a format that needs parsing.
          // Also handle optional properties.
          const formattedEvents: Event[] = data.map((e: any) => ({
            event_id: e.event_id,
            title: e.title,
            details: e.details || '',
            datetime: e.datetime,
            date: e.datetime.split('T')[0],
            time: new Date(e.datetime).toTimeString().substring(0,5),
            category: e.category,
            isIndefinite: e.is_indefinite,
            user_email: e.user_email
          }));

          setEvents(formattedEvents);

        } catch (error: any) {
           console.error("Failed to load events from Supabase", error);
           toast({
             variant: "destructive",
             title: "Error",
             description: `Could not fetch your events: ${error.message}`,
           });
           setEvents([]);
        } finally {
            setIsLoading(false);
        }
      } else {
        setEvents([]);
        setIsLoading(false);
      }
    };

    loadEvents();
  }, [user, supabase, toast]);

  const addEvent = async (eventData: EventCreationData) => {
    if (!user?.email || !supabase) {
        toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "You must be logged in to create an event.",
        });
        return;
    }
    
    const newRecord = {
      event_id: crypto.randomUUID(),
      title: eventData.title,
      details: eventData.details || '',
      datetime: eventData.isIndefinite ? new Date(8640000000000000).toISOString() : new Date(`${eventData.date}T${eventData.time}`).toISOString(),
      category: eventData.category,
      is_indefinite: !!eventData.isIndefinite,
      user_email: user.email,
    };

    const { data: newEvent, error } = await supabase
        .from('events')
        .insert(newRecord)
        .select()
        .single();
    
    if (error) {
         toast({
            variant: "destructive",
            title: "Error Creating Event",
            description: error.message,
        });
        return;
    }

    // Map DB record to client-side Event type
     const formattedEvent: Event = {
        event_id: newEvent.event_id,
        title: newEvent.title,
        details: newEvent.details || '',
        datetime: newEvent.datetime,
        date: newEvent.datetime.split('T')[0],
        time: new Date(newEvent.datetime).toTimeString().substring(0,5),
        category: newEvent.category,
        isIndefinite: newEvent.is_indefinite,
        user_email: newEvent.user_email
      };

    setEvents(prevEvents => [formattedEvent, ...prevEvents]);
    toast({
        title: "Event Created",
        description: "Your new event has been added successfully.",
    });
  };

  const updateEvent = async (event_id: string, eventData: EventCreationData) => {
    if (!supabase) return;
    const originalEvents = [...events];
    
    const updatedRecord = {
      title: eventData.title,
      details: eventData.details || '',
      datetime: eventData.isIndefinite ? new Date(8640000000000000).toISOString() : new Date(`${eventData.date}T${eventData.time}`).toISOString(),
      category: eventData.category,
      is_indefinite: !!eventData.isIndefinite,
    };

    // Optimistic update
    const optimisticEvent: Event = {
        event_id,
        user_email: user?.email || '',
        ...eventData,
        datetime: updatedRecord.datetime
    };
    setEvents(prevEvents => prevEvents.map(event => event.event_id === event_id ? optimisticEvent : event));

    const { error } = await supabase
      .from('events')
      .update(updatedRecord)
      .eq('event_id', event_id);

    if (error) {
        setEvents(originalEvents);
        toast({
            variant: "destructive",
            title: "Error Updating Event",
            description: error.message,
        });
    } else {
       toast({
          title: "Event Updated",
          description: "Your event has been successfully updated.",
       });
    }
  };

  const deleteEvent = async (event_id: string) => {
    if (!supabase) return;
    const originalEvents = events;
    setEvents(events.filter(event => event.event_id !== event_id));
    
    const { error } = await supabase
        .from('events')
        .delete()
        .eq('event_id', event_id);

    if (error) {
        setEvents(originalEvents);
        toast({
            variant: "destructive",
            title: "Error Deleting Event",
            description: error.message,
        });
    } else {
        toast({
            title: "Event Deleted",
            description: "The event has been removed.",
        });
    }
  };
  
  const contextValue = { events, addEvent, updateEvent, deleteEvent, isLoading };

  return (
    <EventContext.Provider value={contextValue}>
      {children}
    </EventContext.Provider>
  );
};

export const useEvents = () => {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
};
