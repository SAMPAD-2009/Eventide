
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns-tz';
import { parseISO } from 'date-fns';

interface HourlyForecastCardProps {
  hourlyData: {
    time: string[];
    temperature_2m: number[];
  };
  timezone: string;
  tempUnit: 'c' | 'f';
}

export function HourlyForecastCard({ hourlyData, timezone, tempUnit }: HourlyForecastCardProps) {
    
    const now = new Date();
    const currentHourIndex = hourlyData.time.findIndex(timeStr => parseISO(timeStr) > now);

    if (currentHourIndex === -1) return null; // No future hours available

    const relevantHours = hourlyData.time
        .slice(currentHourIndex)
        .map((time, index) => ({
            time,
            temp_c: hourlyData.temperature_2m[currentHourIndex + index]
        }))
        .filter((_, index) => index % 2 === 0)
        .slice(0, 8);


    return (
        <Card className="bg-card text-card-foreground shadow-sm rounded-2xl p-6">
            <CardHeader className="p-0 pb-4">
                <CardTitle className="text-base font-medium uppercase text-muted-foreground">Today at</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="flex justify-between overflow-x-auto gap-4">
                    {relevantHours.map((hour, index) => {
                        const displayTemp = Math.round(tempUnit === 'c' ? hour.temp_c : (hour.temp_c * 9/5) + 32);
                        return (
                            <div key={index} className="flex flex-col items-center justify-center gap-2 flex-shrink-0">
                                <p className="text-sm text-muted-foreground">
                                    {format(parseISO(hour.time), 'ha', { timeZone: timezone })}
                                </p>
                                <p className="font-bold text-lg">{displayTemp}°</p>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
