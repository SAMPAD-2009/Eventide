import { supabase } from '@/lib/supabase';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Megaphone } from 'lucide-react';

interface SiteAlertData {
  name: string;
  description: string;
}

async function getAlerts(): Promise<SiteAlertData[] | null> {
  try {
    // a 'select *' is okay for a low-row-count table like alerts.
    const { data, error } = await supabase.from('alerts').select('*');

    if (error) {
      console.error('Error fetching alerts from Supabase:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('An unexpected error occurred fetching alerts:', err);
    return null;
  }
}

export async function SiteAlert() {
  const alerts = await getAlerts();

  if (!alerts || alerts.length === 0) {
    return null;
  }

  return (
    <div className="w-full p-2 bg-background">
        <div className="max-w-7xl mx-auto">
             {alerts.map((alert, index) => (
                <Alert key={index} className="border-primary/50 text-primary-foreground bg-primary/90 [&>svg]:text-primary-foreground">
                    <Megaphone className="h-4 w-4" />
                    <AlertTitle className="font-bold">{alert.name}</AlertTitle>
                    <AlertDescription>{alert.description}</AlertDescription>
                </Alert>
            ))}
        </div>
    </div>
  );
}
