"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Event } from '@/lib/types';
import { summarizeEvent } from '@/ai/flows/summarize-event';
import { useToast } from "@/hooks/use-toast";

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
  const [events, setEvents] = useState<Event[]>(() => {
    if (typeof window === 'undefined') {
      return [];
    }
    try {
      const item = window.localStorage.getItem('eventide_events');
      const parsedEvents = item ? JSON.parse(item) : [];
      return parsedEvents.map((event: Event) => ({
        ...event,
        datetime: event.datetime,
      }));
    } catch (error) {
      console.error("Failed to load events from localStorage", error);
      return [];
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem('eventide_events', JSON.stringify(events));
    } catch (error) {
      console.error("Failed to save events to localStorage", error);
    }
  }, [events]);

  const addEvent = async (eventData: Omit<Event, 'id' | 'summary' | 'datetime'>) => {
    setIsLoading(true);
    try {
      const { summary } = await summarizeEvent({ details: eventData.details });
      const newEvent: Event = {
        ...eventData,
        id: new Date().toISOString(),
        summary,
        datetime: new Date(`${eventData.date}T${eventData.time}`).toISOString(),
      };
      const updatedEvents = [...events, newEvent].sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());
      setEvents(updatedEvents);
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

  return (
    <EventContext.Provider value={{ events, addEvent, deleteEvent, isLoading }}>
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
