
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Event } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from './AuthContext';

type EventCreationData = Omit<Event, 'event_id' | 'datetime' | 'user_email'> & {
    date?: string;
    time?: string;
};


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

  useEffect(() => {
    const loadEvents = async () => {
      if (user?.email) {
        setIsLoading(true);
        try {
          const response = await fetch(`/api/events?user_email=${encodeURIComponent(user.email)}`);
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch events');
          }
          const data = await response.json();
          
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
           console.error("Failed to load events", error);
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
  }, [user, toast]);

  const addEvent = async (eventData: EventCreationData) => {
    if (!user?.email) {
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

    try {
        const response = await fetch('/api/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newRecord)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to create event");
        }
        
        const newEvent = await response.json();

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
    } catch(error: any) {
         toast({
            variant: "destructive",
            title: "Error Creating Event",
            description: error.message,
        });
    }
  };

  const updateEvent = async (event_id: string, eventData: EventCreationData) => {
    const originalEvents = [...events];
    
    const updatedRecord = {
      title: eventData.title,
      details: eventData.details || '',
      datetime: eventData.isIndefinite ? new Date(8640000000000000).toISOString() : new Date(`${eventData.date}T${eventData.time}`).toISOString(),
      category: eventData.category,
      isIndefinite: !!eventData.isIndefinite,
    };

    // Optimistic update
    const optimisticEvent: Event = {
        event_id,
        user_email: user?.email || '',
        ...eventData,
        datetime: updatedRecord.datetime
    };
    setEvents(prevEvents => prevEvents.map(event => event.event_id === event_id ? optimisticEvent : event));

    try {
        const response = await fetch(`/api/events/${event_id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedRecord)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update event');
        }

        toast({
          title: "Event Updated",
          description: "Your event has been successfully updated.",
        });
    } catch (error: any) {
        setEvents(originalEvents);
        toast({
            variant: "destructive",
            title: "Error Updating Event",
            description: error.message,
        });
    }
  };

  const deleteEvent = async (event_id: string) => {
    const originalEvents = events;
    setEvents(events.filter(event => event.event_id !== event_id));
    
    try {
        const response = await fetch(`/api/events/${event_id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to delete event');
        }

        toast({
            title: "Event Deleted",
            description: "The event has been removed.",
        });
    } catch(error: any) {
        setEvents(originalEvents);
        toast({
            variant: "destructive",
            title: "Error Deleting Event",
            description: error.message,
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
