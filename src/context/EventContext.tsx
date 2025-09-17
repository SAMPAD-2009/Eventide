
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Event } from '@/lib/types';
import { summarizeEvent } from '@/ai/flows/summarize-event';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from './AuthContext';

interface EventContextType {
  events: Event[];
  addEvent: (eventData: Omit<Event, 'id' | 'summary' | 'datetime'>) => Promise<void>;
  deleteEvent: (id: string) => void;
  isLoading: boolean;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    try {
      const item = window.localStorage.getItem('eventide_events');
      const parsedEvents = item ? JSON.parse(item) : [];
      const now = new Date();
      const upcomingEvents = parsedEvents
        .filter((event: Event) => event.isIndefinite || new Date(event.datetime) > now)
        .map((event: Event) => ({
          ...event,
          datetime: event.datetime,
        }))
        .sort((a: Event, b: Event) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());
      
      setEvents(upcomingEvents);

    } catch (error) {
      console.error("Failed to load events from localStorage", error);
      setEvents([]);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      try {
        window.localStorage.setItem('eventide_events', JSON.stringify(events));
      } catch (error) {
        console.error("Failed to save events to localStorage", error);
      }
    }
  }, [events, hydrated]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setEvents(prevEvents =>
        prevEvents.filter(event => event.isIndefinite || new Date(event.datetime) > now)
      );
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const addEvent = async (eventData: Omit<Event, 'id' | 'summary' | 'datetime'>) => {
    setIsLoading(true);
    try {
      let summary = '';
      if (eventData.details && eventData.details.trim().length > 0) {
        const result = await summarizeEvent({ details: eventData.details });
        summary = result.summary;
      }

      const newEvent: Event = {
        ...eventData,
        id: new Date().toISOString(),
        summary,
        datetime: eventData.isIndefinite ? new Date(8640000000000000).toISOString() : new Date(`${eventData.date}T${eventData.time}`).toISOString(),
        details: eventData.details || '',
      };
      const updatedEvents = [...events, newEvent].sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());
      setEvents(updatedEvents);

      const n8nWebhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
      if (n8nWebhookUrl) {
          try {
              await fetch(n8nWebhookUrl, {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                      event: newEvent,
                      user: {
                        email: user?.email
                      },
                      action: 'create',
                  }),
              });
          } catch (webhookError) {
              console.error("Failed to send data to n8n webhook:", webhookError);
              // We can decide if we want to notify the user about this.
              // For now, we'll just log it to the console.
          }
      }


      toast({
        title: "Event Created",
        description: "Your new event has been added successfully.",
      });
    } catch (error) {
      console.error("Failed to add event:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not generate event summary. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteEvent = (id: string) => {
    setEvents(events.filter(event => event.id !== id));
    toast({
      title: "Event Deleted",
      description: "The event has been removed.",
    });
  };
  
  const contextValue = { events: hydrated ? events : [], addEvent, deleteEvent, isLoading };

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
