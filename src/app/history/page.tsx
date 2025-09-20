
"use client";

import { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { HistoryEventCard } from '@/components/HistoryEventCard';
import { supabase } from '@/lib/supabase';
import { HistoryEventCardSkeleton } from '@/components/HistoryEventCardSkeleton';

interface HistoryEvent {
  year: number;
  description: string;
  picture: string;
}

async function fetchHistoryEventsFromSupabase(): Promise<{ events: HistoryEvent[]; error: string | null }> {
  try {
    // Add a delay to simulate loading
    // await new Promise(resolve => setTimeout(resolve, 2000));

    const { data, error } = await supabase
      .from('historical_events')
      .select('event_year, event_description, event_picture');

    if (error) {
      throw error;
    }

    const events: HistoryEvent[] = data.map((item: any) => ({
      year: item.event_year,
      description: item.event_description,
      picture: item.event_picture,
    }));

    return { events, error: null };
  } catch (err: any) {
    console.error("Error fetching from Supabase:", err);
    return { events: [], error: err.message || 'An unexpected error occurred while fetching data from Supabase.' };
  }
}


export default function HistoryPage() {
  const [events, setEvents] = useState<HistoryEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadEvents = async () => {
      setIsLoading(true);
      const { events: fetchedEvents, error: fetchError } = await fetchHistoryEventsFromSupabase();
      setEvents(fetchedEvents);
      setError(fetchError);
      setIsLoading(false);
    };

    loadEvents();
  }, []);

  return (
    <div className="w-full mx-auto p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Moments in History</h1>
        <p className="text-muted-foreground mb-6">
          A collection of notable events from a Supabase database.
        </p>

        {error && (
            <Alert variant="destructive" className="max-w-2xl mx-auto">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
                Array.from({ length: 6 }).map((_, index) => (
                    <HistoryEventCardSkeleton key={index} />
                ))
            ) : (
                 <>
                    {events.map((event, index) => (
                        <HistoryEventCard key={index} event={event} />
                    ))}
                    {events.length === 0 && !error && (
                        <p className="text-muted-foreground col-span-full text-center">
                            No historical events found.
                        </p>
                    )}
                </>
            )}
        </div>
      </div>
    </div>
  );
}
