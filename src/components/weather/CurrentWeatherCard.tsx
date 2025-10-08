
"use client"

import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { WeatherData } from '@/lib/types';
import { format } from 'date-fns';
import { Calendar, MapPin, Thermometer } from 'lucide-react';
import { Separator } from '../ui/separator';
import { cn } from '@/lib/utils';

interface CurrentWeatherCardProps {
  weather: WeatherData;
  tempUnit: 'c' | 'f';
}

const getBackgroundImage = (condition: string) => {
    const lowerCaseCondition = condition.toLowerCase();
    if (lowerCaseCondition.includes('rain')) {
        return 'https://i.ibb.co/9mgLNXpP/rainy.jpg';
    }
    if (lowerCaseCondition.includes('sun') || lowerCaseCondition.includes('clear')) {
        return 'https://i.ibb.co/mrCFXPkD/sunny.jpg';
    }
    if (lowerCaseCondition.includes('cloud') || lowerCaseCondition.includes('overcast') || lowerCaseCondition.includes('mist')) {
        return 'https://i.ibb.co/3Yy2PTqd/cloudy.jpg';
    }
    return 'https://i.ibb.co/3Yy2PTqd/cloudy.jpg'; // Default to cloudy
}

export function CurrentWeatherCard({ weather, tempUnit }: CurrentWeatherCardProps) {
  const { current, location, forecast } = weather;
  const backgroundImage = getBackgroundImage(current.condition.text);

  const displayTemp = tempUnit === 'c' ? Math.round(current.temp_c) : Math.round(current.temp_f);

  const todayForecast = forecast.forecastday[0].day;
  const maxTemp = tempUnit === 'c' ? Math.round(todayForecast.maxtemp_c) : Math.round(todayForecast.maxtemp_f);
  const minTemp = tempUnit === 'c' ? Math.round(todayForecast.mintemp_c) : Math.round(todayForecast.mintemp_f);

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
                {current.condition.icon &&
                    <Image 
                        src={`https:${current.condition.icon}`} 
                        alt={current.condition.text} 
                        width={80} 
                        height={80}
                        className="drop-shadow-lg"
                    />
                }
            </CardContent>
            <CardDescription className="text-base mt-2 text-white/90">{current.condition.text}</CardDescription>
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
