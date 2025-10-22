
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Event, Label } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from './AuthContext';
import { getCategoryByName } from '@/lib/categories';

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
            date: e.datetime ? e.datetime.split('T')[0] : '',
            time: e.datetime ? new Date(e.datetime).toTimeString().substring(0,5) : '',
            category: e.category,
            label_id: e.label_id,
            isIndefinite: e.is_indefinite,
            user_email: e.user_email,
            collab_id: e.collab_id,
            collaborations: e.collaborations,
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
      datetime: eventData.isIndefinite ? null : new Date(`${eventData.date}T${eventData.time}`).toISOString(),
      label_id: eventData.label_id,
      category: eventData.category,
      is_indefinite: !!eventData.isIndefinite,
      user_email: user.email,
      collab_id: eventData.collab_id,
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
            date: newEvent.datetime ? newEvent.datetime.split('T')[0] : '',
            time: newEvent.datetime ? new Date(newEvent.datetime).toTimeString().substring(0,5) : '',
            category: newEvent.category,
            label_id: newEvent.label_id,
            isIndefinite: newEvent.is_indefinite,
            user_email: newEvent.user_email,
            collab_id: newEvent.collab_id,
            collaborations: newEvent.collaborations
        };

        setEvents(prevEvents => [formattedEvent, ...prevEvents].sort((a, b) => {
            if (!a.datetime) return 1;
            if (!b.datetime) return -1;
            return new Date(b.datetime).getTime() - new Date(a.datetime).getTime();
        }));
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
      datetime: eventData.isIndefinite ? null : new Date(`${eventData.date}T${eventData.time}`).toISOString(),
      label_id: eventData.label_id,
      category: eventData.category,
      isIndefinite: !!eventData.isIndefinite,
    };

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

        const updatedEvent = await response.json();
        const formattedEvent: Event = {
            event_id: updatedEvent.event_id,
            title: updatedEvent.title,
            details: updatedEvent.details || '',
            datetime: updatedEvent.datetime,
            date: updatedEvent.datetime ? updatedEvent.datetime.split('T')[0] : '',
            time: updatedEvent.datetime ? new Date(updatedEvent.datetime).toTimeString().substring(0,5) : '',
            category: updatedEvent.category,
            label_id: updatedEvent.label_id,
            isIndefinite: updatedEvent.is_indefinite,
            user_email: updatedEvent.user_email,
            collab_id: updatedEvent.collab_id,
        };

        setEvents(prevEvents => prevEvents.map(event => event.event_id === event_id ? formattedEvent : event).sort((a, b) => {
            if (!a.datetime) return 1;
            if (!b.datetime) return -1;
            return new Date(b.datetime).getTime() - new Date(a.datetime).getTime();
        }));

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
