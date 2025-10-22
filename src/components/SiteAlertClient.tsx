
"use client";

import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Megaphone } from 'lucide-react';
import type { SiteAlertData } from './SiteAlert';

interface SiteAlertClientProps {
  alerts: SiteAlertData[];
}

export function SiteAlertClient({ alerts }: SiteAlertClientProps) {
  const { toast } = useToast();

  useEffect(() => {
    // The data is now passed as a prop from the server component
    if (alerts && alerts.length > 0) {
      alerts.forEach((alert, index) => {
        // Adding a small delay to each toast so they don't all appear at once
        setTimeout(() => {
          toast({
            title: (
              <div className="flex items-center gap-2">
                <Megaphone className="h-4 w-4" />
                <span className="font-bold">{alert.Name}</span>
              </div>
            ),
            description: alert.Description,
            duration: 15000,
          });
        }, index * 500);
      });
    }
  }, [alerts, toast]);

  return null; // This component doesn't render anything itself
}
