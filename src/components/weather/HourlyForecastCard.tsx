
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { HourData } from '@/lib/types';
import { format } from 'date-fns-tz';
import Image from 'next/image';

interface HourlyForecastCardProps {
  hourlyData: HourData[];
  timezone: string;
}

export function HourlyForecastCard({ hourlyData, timezone }: HourlyForecastCardProps) {
    
    // Filter to get a forecast for roughly every 3 hours starting from the current time
    const now = new Date();
    const relevantHours = hourlyData.filter(hour => new Date(hour.time) > now)
                                   .filter((_, index) => index % 3 === 0)
                                   .slice(0, 8);

    return (
        <Card className="bg-card text-card-foreground shadow-sm rounded-2xl p-6">
            <CardHeader className="p-0 pb-4">
                <CardTitle className="text-base font-medium uppercase text-muted-foreground">Today at</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="flex justify-between overflow-x-auto gap-4">
                    {relevantHours.map(hour => (
                        <div key={hour.time_epoch} className="flex flex-col items-center justify-center gap-2 flex-shrink-0">
                            <p className="text-sm text-muted-foreground">
                                {format(new Date(hour.time), 'ha', { timeZone: timezone })}
                            </p>
                            <Image
                                src={`https:${hour.condition.icon}`}
                                alt={hour.condition.text}
                                width={48}
                                height={48}
                            />
                            <p className="font-bold text-lg">{Math.round(hour.temp_c)}°</p>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
