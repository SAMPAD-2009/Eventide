
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Thermometer, Wind, Droplets } from 'lucide-react';
import { Sunny } from './weather-animations/Sunny';
import { Cloudy } from './weather-animations/Cloudy';
import { Rainy } from './weather-animations/Rainy';
import { Snowy } from './weather-animations/Snowy';

interface WeatherData {
    location: { name: string; region: string; };
    current: {
        temp_c: number; temp_f: number;
        condition: { text: string; icon: string; };
        wind_mph: number; humidity: number;
    };
}

interface WeatherCardProps {
  weather: WeatherData;
  isCelsius: boolean;
  onToggleTemperature: () => void;
}

const WeatherAnimation = ({ condition }: { condition: string }) => {
    const lowerCaseCondition = condition.toLowerCase();

    if (lowerCaseCondition.includes('sun') || lowerCaseCondition.includes('clear')) {
        return <Sunny />;
    }
    if (lowerCaseCondition.includes('cloud') || lowerCaseCondition.includes('overcast')) {
        return <Cloudy />;
    }
    if (lowerCaseCondition.includes('rain') || lowerCaseCondition.includes('drizzle')) {
        return <Rainy />;
    }
    if (lowerCaseCondition.includes('snow') || lowerCaseCondition.includes('sleet') || lowerCaseCondition.includes('blizzard')) {
        return <Snowy />;
    }
    // Default fallback
    return <Cloudy />;
};


export function WeatherCard({ weather, isCelsius, onToggleTemperature }: WeatherCardProps) {
    const { location, current } = weather;

    return (
        <>
            <div className="relative h-48 w-full overflow-hidden flex items-center justify-center bg-blue-300 dark:bg-blue-900">
                <WeatherAnimation condition={current.condition.text} />
            </div>
            <CardHeader className="text-center">
                <CardTitle className="text-2xl">{location.name}, {location.region}</CardTitle>
                <CardDescription className="text-lg">{current.condition.text}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="text-center">
                    <span className="text-6xl font-bold">
                        {isCelsius ? `${Math.round(current.temp_c)}` : `${Math.round(current.temp_f)}`}
                    </span>
                    <Button variant="ghost" size="sm" onClick={onToggleTemperature} className="align-top">
                        °{isCelsius ? 'C' : 'F'}
                    </Button>
                </div>
                <div className="flex justify-around text-center">
                    <div className="flex flex-col items-center">
                        <Wind className="h-6 w-6 text-muted-foreground" />
                        <span className="font-semibold">{current.wind_mph} mph</span>
                        <span className="text-xs text-muted-foreground">Wind</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <Droplets className="h-6 w-6 text-muted-foreground" />
                        <span className="font-semibold">{current.humidity}%</span>
                        <span className="text-xs text-muted-foreground">Humidity</span>
                    </div>
                </div>
            </CardContent>
        </>
    );
}
