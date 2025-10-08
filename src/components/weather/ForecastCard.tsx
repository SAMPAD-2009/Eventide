
"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { WeatherData } from '@/lib/types';
import { format } from 'date-fns';

interface ForecastCardProps {
  forecast: WeatherData['daily'];
  tempUnit: 'c' | 'f';
}

export function ForecastCard({ forecast, tempUnit }: ForecastCardProps) {

  const nextTwoDays = forecast.time.slice(1, 3).map((date, index) => {
    const realIndex = index + 1;
    const maxTempC = forecast.temperature_2m_max[realIndex];
    const minTempC = forecast.temperature_2m_min[realIndex];

    return {
      date: date,
      maxtemp: Math.round(tempUnit === 'c' ? maxTempC : (maxTempC * 9 / 5) + 32),
      mintemp: Math.round(tempUnit === 'c' ? minTempC : (minTempC * 9 / 5) + 32),
    };
  });

  return (
    <Card className="bg-card text-card-foreground shadow-sm rounded-2xl p-6">
      <CardHeader className="p-0 pb-4">
        <CardTitle className="text-lg font-medium">Next 2 Days Forecast</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-4">
          {nextTwoDays.map((day, index) => {
            return (
              <div key={index} className="flex items-center justify-between">
                <p className="font-semibold text-sm w-[45%]">
                  {`mx-${day.maxtemp}°/mn-${day.mintemp}°`}
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
