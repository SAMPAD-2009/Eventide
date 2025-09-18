
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Event } from '@/lib/types';
import { summarizeEvent } from '@/ai/flows/summarize-event';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from './AuthContext';
import { fetchEventsFromN8n } from '@/services/n8n';

interface EventContextType {
  events: Event[];
  addEvent: (eventData: Omit<Event, 'id' | 'summary' | 'datetime' | 'event_id'>) => Promise<void>;
  updateEvent: (id: string, eventData: Omit<Event, 'id' | 'summary' | 'datetime' | 'event_id'>) => Promise<void>;
  deleteEvent: (id: string) => void;
  isLoading: boolean;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const loadEvents = async () => {
      if (user?.email) {
        setIsLoading(true);
        try {
          const fetchedEvents = await fetchEventsFromN8n(user.email);
          const now = new Date();
          const upcomingEvents = fetchedEvents
            .filter((event: Event) => event.isIndefinite || new Date(event.datetime) > now)
            .sort((a: Event, b: Event) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());
          setEvents(upcomingEvents);
        } catch (error) {
           console.error("Failed to load events from n8n", error);
           toast({
             variant: "destructive",
             title: "Error",
             description: "Could not fetch your events. Please try again later.",
           });
           setEvents([]);
        } finally {
            setIsLoading(false);
        }
      } else {
        setEvents([]);
      }
    };
    loadEvents();
  }, [user, toast]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setEvents(prevEvents =>
        prevEvents.filter(event => event.isIndefinite || new Date(event.datetime) > now)
      );
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const addEvent = async (eventData: Omit<Event, 'id' | 'summary' | 'datetime' | 'event_id'>) => {
    setIsLoading(true);
    const tempId = `temp-${new Date().toISOString()}`;
    try {
      let summary = '';
      if (eventData.details && eventData.details.trim().length > 0) {
        const result = await summarizeEvent({ details: eventData.details });
        summary = result.summary;
      }

      const newEventPayload: Omit<Event, 'id' | 'event_id'> = {
        ...eventData,
        summary,
        datetime: eventData.isIndefinite ? new Date(8640000000000000).toISOString() : new Date(`${eventData.date}T${eventData.time}`).toISOString(),
        details: eventData.details || '',
      };

      const n8nWebhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
      if (!n8nWebhookUrl) {
          throw new Error("n8n webhook URL not configured");
      }

      const response = await fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              event: { ...newEventPayload, event_id: null },
              user: { email: user?.email },
              action: 'create',
          }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to create event via n8n webhook");
      }

      const createdEventResult = await response.json();
      
      const finalEvent: Event = {
        ...newEventPayload,
        id: createdEventResult.event_id,
        event_id: createdEventResult.event_id
      };
      
      setEvents(prevEvents => 
        [...prevEvents, finalEvent].sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime())
      );

      toast({
        title: "Event Created",
        description: "Your new event has been added successfully.",
      });
    } catch (error) {
      console.error("Failed to add event:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not create the event. Please try again.",
      });
      setEvents(prev => prev.filter(e => e.id !== tempId));
    } finally {
      setIsLoading(false);
    }
  };

  const updateEvent = async (id: string, eventData: Omit<Event, 'id' | 'summary' | 'datetime' | 'event_id'>) => {
    setIsLoading(true);
    try {
      const existingEvent = events.find(event => event.id === id);
      if (!existingEvent) {
          throw new Error("Event not found");
      }

      let summary = existingEvent.summary;
      if (eventData.details && eventData.details.trim().length > 0 && eventData.details !== existingEvent.details) {
        const result = await summarizeEvent({ details: eventData.details });
        summary = result.summary;
      } else if (!eventData.details || eventData.details.trim().length === 0) {
        summary = '';
      }

      const updatedEvent: Event = {
        ...eventData,
        id: id,
        event_id: id,
        summary,
        datetime: eventData.isIndefinite ? new Date(8640000000000000).toISOString() : new Date(`${eventData.date}T${eventData.time}`).toISOString(),
        details: eventData.details || '',
      };

      const n8nWebhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
       if (n8nWebhookUrl) {
          await fetch(n8nWebhookUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  event: {
                      event_id: updatedEvent.id,
                      title: updatedEvent.title,
                      event_details: updatedEvent.details,
                      datetime: updatedEvent.datetime,
                      category: updatedEvent.category,
                      is_indefinite: updatedEvent.isIndefinite,
                      summary: updatedEvent.summary
                  },
                  user: { email: user?.email },
                  action: 'update',
              }),
          });
      }

      setEvents(events.map(event => event.id === id ? updatedEvent : event)
        .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime()));

      toast({
        title: "Event Updated",
        description: "Your event has been successfully updated.",
      });

    } catch (error) {
       console.error("Failed to update event:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not update the event. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteEvent = async (id: string) => {
    const n8nWebhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
    if (n8nWebhookUrl) {
        try {
            await fetch(n8nWebhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    event: { event_id: id },
                    user: { email: user?.email },
                    action: 'delete',
                }),
            });
        } catch (webhookError) {
            console.error("Failed to send delete notification to n8n webhook:", webhookError);
        }
    }
    setEvents(events.filter(event => event.id !== id));
    toast({
      title: "Event Deleted",
      description: "The event has been removed.",
    });
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
