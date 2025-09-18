
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface HistoryEvent {
  year: number;
  event: string;
}

async function fetchHistoryEventsFromGoogleSheet(): Promise<{ events: HistoryEvent[]; error: string | null }> {
  try {
    const sheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTcIRABYOByGbUfKWWzuytEc5hFkf_LAa_bKzszku57h0uI2kkBvTXDmFEruIDtLCL1xB-0U25AcPoV/pub?gid=0&single=true&output=csv";
    
    const response = await fetch(sheetUrl, {
      next: { revalidate: 3600 } // Revalidate once per hour
    });

    if (!response.ok) {
      throw new Error('Failed to fetch historical events from Google Sheet. Please ensure the sheet is published and the link is correct.');
    }

    const csvText = await response.text();
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();

    const events: HistoryEvent[] = csvText
      .split('\n')
      .slice(1) // Skip header row
      .map(row => {
        const [month, day, year, ...eventParts] = row.split(',');
        const eventText = eventParts.join(',').replace(/"/g, '').trim();
        return {
          month: parseInt(month, 10),
          day: parseInt(day, 10),
          year: parseInt(year, 10),
          event: eventText,
        };
      })
      .filter(e => e.month === currentMonth && e.day === currentDay && e.year && e.event);

    return { events, error: null };
  } catch (err: any) {
    console.error("Error fetching from Google Sheet:", err);
    return { events: [], error: err.message || 'An unexpected error occurred while fetching data.' };
  }
}


export default async function HistoryPage() {
  const { events, error } = await fetchHistoryEventsFromGoogleSheet();
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });


  return (
    <div className="w-full mx-auto p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-2">On This Day in History: {formattedDate}</h1>
        <p className="text-muted-foreground mb-6">
          Events that occurred on this day throughout history, from a public Google Sheet.
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
             {events.length === 0 && !error && (
                <p className="text-muted-foreground col-span-full text-center">
                    No historical events found for this day in the Google Sheet.
                </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

