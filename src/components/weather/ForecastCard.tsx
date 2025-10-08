
"use client"

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ForecastDay } from '@/lib/types';
import { format } from 'date-fns';

interface ForecastCardProps {
  forecast: ForecastDay[];
}

export function ForecastCard({ forecast }: ForecastCardProps) {

  return (
    <Card className="bg-card text-card-foreground shadow-sm rounded-2xl p-6">
      <CardHeader className="p-0 pb-4">
        <CardTitle className="text-lg font-medium">Next 2 Days</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-4">
          {forecast.map((day) => (
            <div key={day.date_epoch} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <p className="font-semibold w-8">{Math.round(day.day.maxtemp_c)}°</p>
                <Image 
                  src={`https:${day.day.condition.icon}`} 
                  alt={day.day.condition.text}
                  width={32}
                  height={32}
                />
              </div>
              <p className="text-muted-foreground">{format(new Date(day.date), 'd MMM')}</p>
              <p className="text-muted-foreground w-20 text-right">{format(new Date(day.date), 'EEEE')}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
