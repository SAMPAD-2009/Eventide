
import { createClient } from '@/lib/supabase/server';
import { SiteAlertClient } from './SiteAlertClient';

export interface SiteAlertData {
  Name: string;
  Description: string;
}

// This is now a Server Component
async function getAlerts(): Promise<SiteAlertData[] | null> {
  const supabase = createClient();
  try {
    const { data, error } = await supabase.from('alerts').select('Name, Description');
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

  return <SiteAlertClient alerts={alerts} />;
}
