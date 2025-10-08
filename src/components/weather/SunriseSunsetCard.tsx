
"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AstroData } from '@/lib/types';
import { Sunrise, Sunset } from 'lucide-react';

interface SunriseSunsetCardProps {
  astro: AstroData;
}

export function SunriseSunsetCard({ astro }: SunriseSunsetCardProps) {
  if (!astro) return null;

  return (
    <Card className="bg-card text-card-foreground shadow-sm rounded-2xl p-6">
      <CardHeader className="p-0 pb-4">
        <CardTitle className="text-base font-medium text-muted-foreground">Sunrise & Sunset</CardTitle>
      </CardHeader>
      <CardContent className="p-0 space-y-4">
        <div className="flex items-center gap-4">
            <Sunrise className="h-10 w-10 text-yellow-400" />
            <div>
                <p className="text-sm text-muted-foreground">Sunrise</p>
                <p className="text-2xl font-bold">{astro.sunrise}</p>
            </div>
        </div>
         <div className="flex items-center gap-4">
            <Sunset className="h-10 w-10 text-orange-400" />
            <div>
                <p className="text-sm text-muted-foreground">Sunset</p>
                <p className="text-2xl font-bold">{astro.sunset}</p>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
