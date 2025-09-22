
"use client";

import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wind, Droplets, Compass, Gauge, Eye, Navigation, LocateFixed } from 'lucide-react';
import { Sunny } from './weather-animations/Sunny';
import { Cloudy } from './weather-animations/Cloudy';
import { Rainy } from './weather-animations/Rainy';
import { Snowy } from './weather-animations/Snowy';
import { Progress } from './ui/progress';
import Image from 'next/image';
import type { WeatherData, ForecastDay } from '@/lib/types';

interface WeatherCardProps {
  weather: WeatherData;
  onRefresh: () => void;
}

const WeatherAnimation = ({ condition }: { condition: string }) => {
    const lowerCaseCondition = condition.toLowerCase();
    if (lowerCaseCondition.includes('sun') || lowerCaseCondition.includes('clear')) return <Sunny />;
    if (lowerCaseCondition.includes('cloud') || lowerCaseCondition.includes('overcast')) return <Cloudy />;
    if (lowerCaseCondition.includes('rain') || lowerCaseCondition.includes('drizzle')) return <Rainy />;
    if (lowerCaseCondition.includes('snow') || lowerCaseCondition.includes('sleet') || lowerCaseCondition.includes('blizzard')) return <Snowy />;
    return <Cloudy />; // Default fallback
};

const getBackgroundImage = (condition: string): string => {
    const lowerCaseCondition = condition.toLowerCase();
    if (lowerCaseCondition.includes('sun') || lowerCaseCondition.includes('clear')) {
        return 'https://i.ibb.co/mrCFXPkD/sunny.jpg';
    }
    if (lowerCaseCondition.includes('rain') || lowerCaseCondition.includes('drizzle')) {
        return 'https://i.ibb.co/9mgLNXpP/rainy.jpg';
    }
    // Default to cloudy for cloud, overcast, snow, etc.
    return 'https://i.ibb.co/3Yy2PTqd/cloudy.jpg';
};


const WeatherSidebar = ({ weather, isCelsius, onRefresh }: { weather: WeatherData; isCelsius: boolean, onRefresh: () => void }) => {
    const bgImage = getBackgroundImage(weather.current.condition.text);
    return (
      <aside 
        className="relative w-full lg:w-1/3 xl:w-1/4 text-white flex flex-col items-center justify-between p-6 text-center bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="absolute inset-0 bg-black/30 -z-10" />
        <div className="w-full flex justify-between items-center z-10">
          <Button variant="secondary" size="sm">Search for places</Button>
          <Button variant="ghost" size="icon" className="rounded-full bg-white/20 hover:bg-white/30" onClick={onRefresh}>
            <LocateFixed className="h-5 w-5" />
          </Button>
        </div>
        <div className="relative h-48 w-full my-8 flex items-center justify-center">
            <WeatherAnimation condition={weather.current.condition.text} />
        </div>
        <div className="flex-grow flex flex-col justify-center text-center z-10">
          <h1 className="text-7xl font-bold">
            {Math.round(isCelsius ? weather.current.temp_c : weather.current.temp_f)}
            <span className="text-4xl text-white/80 align-top">°{isCelsius ? 'C' : 'F'}</span>
          </h1>
          <p className="text-2xl font-semibold text-white/90 mt-4">{weather.current.condition.text}</p>
        </div>
        <div className="mt-auto z-10">
          <p className="text-white/80">Today • {format(new Date(), 'E, d MMM')}</p>
          <p className="text-white/80 mt-2">{weather.location.name}, {weather.location.region}</p>
        </div>
      </aside>
    );
};


const Forecast = ({ forecast, isCelsius }: { forecast: ForecastDay[], isCelsius: boolean }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
    {forecast.slice(1, 6).map((day) => (
      <Card key={day.date} className="p-4 flex flex-col items-center text-center">
        <p className="font-semibold text-muted-foreground">{format(parseISO(day.date), 'E, d MMM')}</p>
        <Image src={`https:${day.day.condition.icon}`} alt={day.day.condition.text} width={64} height={64} className="my-2"/>
        <div className="flex gap-2 text-sm">
          <span>{Math.round(isCelsius ? day.day.maxtemp_c : day.day.maxtemp_f)}°</span>
          <span className="text-muted-foreground">{Math.round(isCelsius ? day.day.mintemp_c : day.day.mintemp_f)}°</span>
        </div>
      </Card>
    ))}
  </div>
);

const WeatherHighlights = ({ weather, isCelsius }: { weather: WeatherData, isCelsius: boolean }) => {
    const { current, forecast } = weather;
    const todayForecast = forecast.forecastday[0].day;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
                <h3 className="text-muted-foreground mb-2">Wind Status</h3>
                <p className="text-5xl font-bold">{Math.round(current.wind_mph)}<span className="text-xl">mph</span></p>
                <div className="flex items-center gap-2 mt-2">
                    <div className="p-1 bg-muted rounded-full">
                       <Navigation className="h-4 w-4" style={{ transform: `rotate(${current.wind_degree}deg)` }} />
                    </div>
                    <span>{current.wind_dir}</span>
                </div>
            </Card>
            <Card className="p-6">
                <h3 className="text-muted-foreground mb-2">Humidity</h3>
                <p className="text-5xl font-bold">{current.humidity}<span className="text-xl">%</span></p>
                <Progress value={current.humidity} className="mt-4" />
            </Card>
            <Card className="p-6">
                <h3 className="text-muted-foreground mb-2">Visibility</h3>
                <p className="text-5xl font-bold">{current.vis_miles}<span className="text-xl"> miles</span></p>
            </Card>
            <Card className="p-6">
                <h3 className="text-muted-foreground mb-2">Air Pressure</h3>
                <p className="text-5xl font-bold">{Math.round(current.pressure_mb)}<span className="text-xl"> mb</span></p>
            </Card>
        </div>
    )
};


export function WeatherCard({ weather, onRefresh }: WeatherCardProps) {
    const [isCelsius, setIsCelsius] = useState(true);

    if (!weather || !weather.current) {
        return null;
    }

    return (
        <div className="flex flex-col lg:flex-row bg-background rounded-lg shadow-lg overflow-hidden w-full min-h-[calc(100vh-8rem)]">
            <WeatherSidebar weather={weather} isCelsius={isCelsius} onRefresh={onRefresh} />
            
            <main className="w-full lg:w-2/3 xl:w-3/4 p-6 md:p-10 overflow-y-auto">
                <div className="flex justify-end gap-2 mb-8">
                    <Button
                        onClick={() => setIsCelsius(true)}
                        variant={isCelsius ? 'default' : 'secondary'}
                        className="rounded-full font-bold"
                    >
                        °C
                    </Button>
                    <Button
                        onClick={() => setIsCelsius(false)}
                        variant={!isCelsius ? 'default' : 'secondary'}
                        className="rounded-full font-bold"
                    >
                        °F
                    </Button>
                </div>

                <div className="mb-10">
                    <Forecast forecast={weather.forecast.forecastday} isCelsius={isCelsius} />
                </div>
                
                <div>
                    <h2 className="text-2xl font-bold mb-6">Today's Highlights</h2>
                    <WeatherHighlights weather={weather} isCelsius={isCelsius} />
                </div>
            </main>
        </div>
    );
}
