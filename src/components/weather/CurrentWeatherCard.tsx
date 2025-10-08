
"use client"

import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { WeatherData } from '@/lib/types';
import { format } from 'date-fns';
import { Calendar, MapPin } from 'lucide-react';
import { Separator } from '../ui/separator';

interface CurrentWeatherCardProps {
  weather: WeatherData;
}

export function CurrentWeatherCard({ weather }: CurrentWeatherCardProps) {
  const { current, location } = weather;

  return (
    <Card className="bg-card text-card-foreground shadow-sm rounded-2xl p-6">
        <CardHeader className="p-0 pb-4">
            <p className="text-lg font-medium">Now</p>
        </CardHeader>
        <CardContent className="p-0 flex items-center justify-between">
            <div className="flex items-center">
                <h2 className="text-6xl font-bold">{Math.round(current.temp_c)}°</h2>
                <span className="text-4xl font-medium -translate-y-2">c</span>
            </div>
            {current.condition.icon &&
                <Image 
                    src={`https:${current.condition.icon}`} 
                    alt={current.condition.text} 
                    width={80} 
                    height={80}
                />
            }
        </CardContent>
        <CardDescription className="text-base mt-2">{current.condition.text}</CardDescription>
        <Separator className="my-6" />
        <CardFooter className="p-0 flex flex-col items-start gap-3">
             <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-5 w-5" />
                <span>{format(new Date(), "EEEE, d MMM")}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-5 w-5" />
                <span>{location.name}, {location.country}</span>
            </div>
        </CardFooter>
    </Card>
  );
}
