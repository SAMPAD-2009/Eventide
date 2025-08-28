
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface HistoryEvent {
  year: number;
  event: string;
}

export default function HistoryPage() {
  const [events, setEvents] = useState<HistoryEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistoryEvents = async () => {
      setIsLoading(true);
      setError(null);
      
      const apiKey = process.env.NEXT_PUBLIC_API_NINJAS_KEY;
      if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
        setError("API key for API-Ninjas is not configured. Please add it to your .env file.");
        setIsLoading(false);
        return;
      }

      const today = new Date();
      const month = today.getMonth() + 1;
      const day = today.getDate();
      
      try {
        const response = await fetch(`https://api.api-ninjas.com/v1/historicalevents?month=${month}&day=${day}`, {
          headers: {
            'X-Api-Key': apiKey,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch historical events.');
        }

        const data: HistoryEvent[] = await response.json();
        setEvents(data);
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistoryEvents();
  }, []);

  return (
    <div className="w-full mx-auto p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-2">On This Day in History</h1>
        <p className="text-muted-foreground mb-6">
          Events that occurred on this day throughout history, powered by API-Ninjas.
        </p>

        {isLoading && (
          <div className="flex items-center justify-center min-h-[calc(100vh-16rem)]">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
          </div>
        )}

        {error && (
            <Alert variant="destructive" className="max-w-2xl mx-auto">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

        {!isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event, index) => (
              <Card key={index} className="flex flex-col">
                <CardHeader>
                  <CardTitle>Year: {event.year}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{event.event}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
