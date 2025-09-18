
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Event } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from './AuthContext';
import { fetchEventsFromN8n } from '@/services/n8n';

interface EventContextType {
  events: Event[];
  addEvent: (eventData: Omit<Event, 'id' | 'datetime' | 'event_id'>) => Event;
  updateEvent: (id: string, eventData: Omit<Event, 'id' | 'datetime' | 'event_id'>) => void;
  deleteEvent: (id: string) => void;
  isLoading: boolean;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

const generateUniqueEventId = (email: string, title: string, date: string, time: string): string => {
    const combinedString = `${email}-${title}-${date}-${time}`;
    // Use btoa for a simple, client-side base64 encoding to create a unique-looking ID
    return btoa(combinedString);
}


export const EventProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const { user } = useAuth();

  const loadEvents = async () => {
    if (user?.email) {
      setIsLoading(true);
      try {
        const fetchedEvents = await fetchEventsFromN8n(user.email);
        setEvents(fetchedEvents);
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
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [user]);

  const addEvent = (eventData: Omit<Event, 'id' | 'datetime' | 'event_id'>): Event => {
    if (!user?.email) {
        toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "You must be logged in to create an event.",
        });
        // This is not ideal, but we have to return an event.
        // The form logic should prevent this from being called if there's no user.
        return { ...eventData, id: '', datetime: '', details: ''}; 
    }
    
    const eventId = generateUniqueEventId(
        user.email, 
        eventData.title, 
        eventData.isIndefinite ? 'indefinite' : eventData.date!, 
        eventData.isIndefinite ? '' : eventData.time!
    );

    const newEvent: Event = {
      ...eventData,
      id: eventId,
      event_id: eventId,
      datetime: eventData.isIndefinite ? new Date(8640000000000000).toISOString() : new Date(`${eventData.date}T${eventData.time}`).toISOString(),
      details: eventData.details || '',
    };
    
    // Optimistic update
    setEvents(prevEvents => [newEvent, ...prevEvents]);
    return newEvent;
  };

  const updateEvent = (id: string, eventData: Omit<Event, 'id' | 'datetime' | 'event_id'>) => {
    const originalEvents = [...events];
    
    const updatedEvent: Event = {
      ...eventData,
      id: id,
      event_id: id,
      datetime: eventData.isIndefinite ? new Date(8640000000000000).toISOString() : new Date(`${eventData.date}T${eventData.time}`).toISOString(),
      details: eventData.details || '',
    };
    updatedEvent.isIndefinite = !!updatedEvent.isIndefinite;

    // Optimistic update
    setEvents(prevEvents => prevEvents.map(event => event.id === id ? updatedEvent : event));

    const n8nWebhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
     if (!n8nWebhookUrl) {
        console.error("n8n webhook URL not configured");
        setEvents(originalEvents);
        toast({
            variant: "destructive",
            title: "Configuration Error",
            description: "Could not update event due to configuration issue."
        });
        return;
     }

    fetch(n8nWebhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                event: {
                    event_id: updatedEvent.id,
                    title: updatedEvent.title,
                    details: updatedEvent.details,
                    date: updatedEvent.date,
                    time: updatedEvent.time,
                    category: updatedEvent.category,
                    is_indefinite: updatedEvent.isIndefinite,
                },
                user: { email: user?.email },
                action: 'update',
            }),
            keepalive: true,
    }).then(response => {
        if(!response.ok) {
            setEvents(originalEvents);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not update the event. Please try again.",
            });
        } else {
            toast({
              title: "Event Updated",
              description: "Your event has been successfully updated.",
            });
        }
    }).catch(error => {
       console.error("Failed to update event:", error);
       setEvents(originalEvents);
       toast({
        variant: "destructive",
        title: "Error",
        description: "Could not update the event. Please try again.",
      });
    });
  };

  const deleteEvent = async (id: string) => {
    const originalEvents = events;
    setEvents(events.filter(event => event.id !== id));
    
    const n8nWebhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
    if (n8nWebhookUrl) {
        try {
            const response = await fetch(n8nWebhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    event: { event_id: id },
                    user: { email: user?.email },
                    action: 'delete',
                }),
                keepalive: true,
            });
            if (!response.ok) {
              throw new Error("Webhook for delete failed");
            }
             toast({
              title: "Event Deleted",
              description: "The event has been removed.",
            });
        } catch (webhookError) {
            console.error("Failed to send delete notification to n8n webhook:", webhookError);
            setEvents(originalEvents); // Revert on failure
             toast({
              variant: "destructive",
              title: "Error",
              description: "Could not delete the event from the server. Please try again.",
            });
        }
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

    