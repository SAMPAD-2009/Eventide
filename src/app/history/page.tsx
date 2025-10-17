
import { Suspense } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { HistoryEventCard } from '@/components/HistoryEventCard';
import { createClient } from '@/lib/supabase/server';
import { HistoryEventCardSkeleton } from '@/components/HistoryEventCardSkeleton';

export const dynamic = 'force-dynamic';

interface HistoryEvent {
  year: number;
  description: string;
  picture: string;
}

async function fetchHistoryEventsFromSupabase(): Promise<{ events: HistoryEvent[]; error: string | null }> {
  const supabase = createClient();
  try {
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

async function HistoricalEvents() {
  const { events, error } = await fetchHistoryEventsFromSupabase();

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto my-8">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (events.length === 0) {
    return (
      <p className="text-muted-foreground col-span-full text-center mt-8">
        No historical events found.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event, index) => (
        <HistoryEventCard key={index} event={event} />
      ))}
    </div>
  );
}

function HistorySkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
                <HistoryEventCardSkeleton key={index} />
            ))}
        </div>
    );
}

export default function HistoryPage() {
  return (
    <div className="w-full mx-auto p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Moments in History</h1>
        <p className="text-muted-foreground mb-6">
          A collection of notable events from Brittanica
        </p>

        <Suspense fallback={<HistorySkeleton />}>
            <HistoricalEvents />
        </Suspense>
      </div>
    </div>
  );
}
