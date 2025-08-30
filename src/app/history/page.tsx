import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface HistoryEvent {
  year: number;
  event: string;
}

async function fetchHistoryEvents() {
  try {
    const apiKey = process.env.API_NINJAS_KEY;
    if (!apiKey || apiKey === "YOUR_API_NINJAS_KEY") {
      throw new Error('API key for API-Ninjas is not configured. Please add it to your .env file.');
    }
    
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    
    const url = `https://api.api-ninjas.com/v1/historicalevents?month=${month}&day=${day}`;
    const response = await fetch(url, {
      headers: {
        'X-Api-Key': apiKey,
      },
      next: { revalidate: 3600 } // Revalidate once per hour
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error Response:", errorText);
      throw new Error('Failed to fetch historical events. Check API key and network.');
    }

    const data: HistoryEvent[] = await response.json();
    return { events: data, error: null };
  } catch (err: any) {
    return { events: [], error: err.message || 'An unexpected error occurred.' };
  }
}

export default async function HistoryPage() {
  const { events, error } = await fetchHistoryEvents();
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });


  return (
    <div className="w-full mx-auto p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-2">On This Day in History: {formattedDate}</h1>
        <p className="text-muted-foreground mb-6">
          Events that occurred on this day throughout history, powered by API-Ninjas.
        </p>

        {error && (
            <Alert variant="destructive" className="max-w-2xl mx-auto">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

        {!error && (
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
             {events.length === 0 && (
                <p className="text-muted-foreground col-span-full text-center">
                    No historical events found for this day.
                </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
