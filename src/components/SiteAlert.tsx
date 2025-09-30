
"use client";

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Megaphone } from 'lucide-react';

interface SiteAlertData {
  name: string;
  description: string;
}

async function getAlerts(): Promise<SiteAlertData[] | null> {
  try {
    const { data, error } = await supabase.from('alerts').select('name, description');
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

export function SiteAlert() {
  const { toast } = useToast();

  useEffect(() => {
    const fetchAndShowAlerts = async () => {
      const alerts = await getAlerts();
      if (alerts && alerts.length > 0) {
        alerts.forEach(alert => {
          toast({
            title: (
              <div className="flex items-center gap-2">
                <Megaphone className="h-4 w-4" />
                <span className="font-bold">{alert.name}</span>
              </div>
            ),
            description: alert.description,
            duration: 15000, 
          });
        });
      }
    };

    fetchAndShowAlerts();
  }, [toast]);

  return null;
}
