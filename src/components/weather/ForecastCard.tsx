
"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { WeatherData } from '@/lib/types';
import { format } from 'date-fns';

interface ForecastCardProps {
  forecast: WeatherData['daily'];
  tempUnit: 'c' | 'f';
}

export function ForecastCard({ forecast, tempUnit }: ForecastCardProps) {

  // We show next 2 days, so we slice from index 1 to 3
  const nextTwoDays = forecast.time.slice(1, 3).map((date, index) => ({
    date: date,
    maxtemp: forecast.temperature_2m_max[index + 1],
    mintemp: forecast.temperature_2m_min[index + 1],
  }));

  return (
    <Card className="bg-card text-card-foreground shadow-sm rounded-2xl p-6">
      <CardHeader className="p-0 pb-4">
        <CardTitle className="text-lg font-medium">Next 2 Days Forecast</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-4">
          {nextTwoDays.map((day, index) => {
            const displayMaxTemp = Math.round(day.maxtemp);
            const displayMinTemp = Math.round(day.mintemp);
            return (
              <div key={index} className="flex items-center justify-between">
                {/* No icon/text condition from this API */}
                <p className="font-semibold text-sm w-[45%]">
                  {`${displayMaxTemp}°/${displayMinTemp}°${tempUnit.toUpperCase()}`}
                </p>
                <p className="text-muted-foreground w-[25%] text-center">{format(new Date(day.date), 'd MMM')}</p>
                <p className="text-muted-foreground w-[30%] text-right">{format(new Date(day.date), 'EEEE')}</p>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  );
}
