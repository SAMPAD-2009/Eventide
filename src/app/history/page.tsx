
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { HistoryEventCard } from '@/components/HistoryEventCard';

interface HistoryEvent {
  year: number;
  description: string;
  picture: string;
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
    
    // Assumes CSV header: event_year,event_description,event_picture
    const headers = csvText.split('\n')[0].trim().split(',');
    const yearIndex = headers.indexOf('event_year');
    const descriptionIndex = headers.indexOf('event_description');
    const pictureIndex = headers.indexOf('event_picture');

    if (yearIndex === -1 || descriptionIndex === -1 || pictureIndex === -1) {
        throw new Error('CSV headers are incorrect. Expected "event_year", "event_description", "event_picture".');
    }

    const events: HistoryEvent[] = csvText
      .split('\n')
      .slice(1) // Skip header row
      .map(row => {
        // Basic CSV parsing, handles commas inside quoted strings
        const columns = row.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];
        const year = parseInt(columns[yearIndex]?.replace(/"/g, '').trim() || '0', 10);
        const description = columns[descriptionIndex]?.replace(/"/g, '').trim() || '';
        const picture = columns[pictureIndex]?.replace(/"/g, '').trim() || '';
        
        return {
          year,
          description,
          picture
        };
      })
      .filter(e => e.year && e.description); // Ensure essential data exists

    return { events, error: null };
  } catch (err: any) {
    console.error("Error fetching from Google Sheet:", err);
    return { events: [], error: err.message || 'An unexpected error occurred while fetching data.' };
  }
}


export default async function HistoryPage() {
  const { events, error } = await fetchHistoryEventsFromGoogleSheet();

  return (
    <div className="w-full mx-auto p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Moments in History</h1>
        <p className="text-muted-foreground mb-6">
          A collection of notable events from a public Google Sheet.
        </p>

        {error && (
            <Alert variant="destructive" className="max-w-2xl mx-auto">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

        {!error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event, index) => (
                <HistoryEventCard key={index} event={event} />
            ))}
             {events.length === 0 && !error && (
                <p className="text-muted-foreground col-span-full text-center">
                    No historical events found in the Google Sheet.
                </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
