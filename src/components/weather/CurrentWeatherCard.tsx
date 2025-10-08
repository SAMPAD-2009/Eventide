
"use client"

import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { WeatherData } from '@/lib/types';
import { format } from 'date-fns';
import { Calendar, MapPin, Thermometer } from 'lucide-react';
import { Separator } from '../ui/separator';

interface CurrentWeatherCardProps {
  weather: WeatherData;
  tempUnit: 'c' | 'f';
}

// OpenMeteo doesn't give a condition string, so we'll have to simplify the background logic.
// We can expand this later if we add more data like cloud cover or precipitation.
const getBackgroundImage = (temp: number, unit: 'c' | 'f') => {
    const tempInC = unit === 'f' ? (temp - 32) * 5/9 : temp;
    if (tempInC > 25) {
        return 'https://i.ibb.co/mrCFXPkD/sunny.jpg'; // Sunny
    }
    if (tempInC < 10) {
        return 'https://i.ibb.co/9mgLNXpP/rainy.jpg'; // Rainy/cool
    }
    return 'https://i.ibb.co/3Yy2PTqd/cloudy.jpg'; // Default to cloudy/mild
}

export function CurrentWeatherCard({ weather, tempUnit }: CurrentWeatherCardProps) {
  const { current, location, daily } = weather;
  const displayTemp = Math.round(current.temperature_2m);
  
  const backgroundImage = getBackgroundImage(displayTemp, tempUnit);

  const todayForecast = daily;
  const maxTemp = Math.round(todayForecast.temperature_2m_max[0]);
  const minTemp = Math.round(todayForecast.temperature_2m_min[0]);

  return (
    <Card 
      className="shadow-sm rounded-2xl p-6 relative overflow-hidden text-white bg-cover bg-center"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
        <div className="absolute inset-0 bg-black/40 z-0"></div>
        <div className="relative z-10">
            <CardHeader className="p-0 pb-4">
                <p className="text-lg font-medium">Now</p>
            </CardHeader>
            <CardContent className="p-0 flex items-center justify-between">
                <div className="flex items-center">
                    <h2 className="text-6xl font-bold">{displayTemp}°</h2>
                    <span className="text-4xl font-medium -translate-y-2">{tempUnit}</span>
                </div>
                {/* Icons are not provided by Open-Meteo */}
            </CardContent>
             <CardDescription className="text-base mt-2 text-white/90 capitalize">
                {weather.timezone.split('/')[1].replace('_', ' ')}
             </CardDescription>
             <div className="flex items-center gap-2 mt-2 text-white/80 text-sm">
                <Thermometer className="h-4 w-4" />
                <span>Max: {maxTemp}° / Min: {minTemp}°</span>
            </div>
            <Separator className="my-6 bg-white/20" />
            <CardFooter className="p-0 flex flex-col items-start gap-3">
                 <div className="flex items-center gap-2 text-white/80">
                    <Calendar className="h-5 w-5" />
                    <span>{format(new Date(), "EEEE, d MMM")}</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                    <MapPin className="h-5 w-5" />
                    <span>{location.name}, {location.country}</span>
                </div>
            </CardFooter>
        </div>
    </Card>
  );
}
