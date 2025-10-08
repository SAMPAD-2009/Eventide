
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, LocateFixed, Search } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { WeatherPageSkeleton } from '@/components/WeatherPageSkeleton';
import type { WeatherData } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { CurrentWeatherCard } from '@/components/weather/CurrentWeatherCard';
import { ForecastCard } from '@/components/weather/ForecastCard';
import { AirQualityCard } from '@/components/weather/AirQualityCard';
import { SunriseSunsetCard } from '@/components/weather/SunriseSunsetCard';
import { HighlightCard } from '@/components/weather/HighlightCard';
import { Thermometer, Eye, Wind, Droplets } from 'lucide-react';
import { HourlyForecastCard } from '@/components/weather/HourlyForecastCard';


export default function WeatherPage() {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [city, setCity] = useState('');
    const [query, setQuery] = useState('');
    const [tempUnit, setTempUnit] = useState<'c' | 'f'>('c');


    const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;

    const fetchWeather = (locationQuery: string) => {
        if (!apiKey || apiKey === "YOUR_API_KEY") {
            setError("Weather API key is not configured. Please add NEXT_PUBLIC_WEATHER_API_KEY to your environment variables.");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        
        fetch(`https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${locationQuery}&days=3&aqi=yes&alerts=no`)
            .then(res => {
                if (!res.ok) {
                    throw new Error('Failed to fetch weather data. Please check the city name and your network connection.');
                }
                return res.json();
            })
            .then(data => {
                if (data.error) {
                    throw new Error(data.error.message);
                }
                setWeather(data);
                setQuery(locationQuery);
            })
            .catch(err => {
                setError(err.message);
                console.error(err);
            })
            .finally(() => setLoading(false));
    };

    const getLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    fetchWeather(`${position.coords.latitude},${position.coords.longitude}`);
                },
                (err) => {
                    setError(`Could not get location: ${err.message}. Please enable location services or use the search bar.`);
                    setLoading(false);
                    // Fallback to a default location if geolocation fails
                    if (!weather) fetchWeather('London');
                }
            );
        } else {
            setError("Geolocation is not supported by this browser.");
            setLoading(false);
            // Fallback to a default location
            if (!weather) fetchWeather('London');
        }
    };
    
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (city) {
            fetchWeather(city);
        }
    }

    useEffect(() => {
        getLocation();
    }, []);

    const renderContent = () => {
        if (loading) {
            return <WeatherPageSkeleton />;
        }

        if (error && !weather) {
            return (
                <div className="w-full max-w-md mx-auto p-4 text-center">
                    <Alert variant="destructive">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                    <div className="text-center mt-4">
                        <Button onClick={getLocation}>Try Again</Button>
                    </div>
                </div>
            );
        }
        
        if (weather) {
            return (
                <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {/* Left Sidebar */}
                    <div className="lg:col-span-1 xl:col-span-1 space-y-6">
                        <CurrentWeatherCard weather={weather} tempUnit={tempUnit} />
                        <ForecastCard forecast={weather.forecast.forecastday.slice(1, 3)} tempUnit={tempUnit} />
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-2 xl:col-span-3 space-y-6">
                        <h2 className="text-xl font-bold text-foreground">Today's Highlights</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <AirQualityCard airQuality={weather.current.air_quality} />
                            <SunriseSunsetCard astro={weather.forecast.forecastday[0].astro} />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                             <HighlightCard title="Humidity" icon={<Droplets />} value={`${weather.current.humidity}%`} />
                            <HighlightCard title="Pressure" icon={<Wind />} value={`${Math.round(weather.current.pressure_mb)}hPa`} />
                            <HighlightCard title="Visibility" icon={<Eye />} value={`${weather.current.vis_km}km`} />
                            <HighlightCard 
                                title="Feels Like" 
                                icon={<Thermometer />} 
                                value={`${tempUnit === 'c' ? Math.round(weather.current.feelslike_c) : Math.round(weather.current.feelslike_f)}°${tempUnit}`} 
                            />
                        </div>
                        <HourlyForecastCard hourlyData={weather.forecast.forecastday[0].hour} timezone={weather.location.tz_id} tempUnit={tempUnit} />
                    </div>
                </div>
            );
        }

        return null;
    };

    return (
        <div className="p-4 md:p-6 lg:p-8 bg-background min-h-screen text-foreground">
            <header className="flex flex-wrap items-center justify-between gap-4 mb-8">
                 <div className="flex items-center gap-2">
                    <Button 
                        size="sm"
                        variant={tempUnit === 'c' ? 'default' : 'outline'}
                        onClick={() => setTempUnit('c')}
                        className="rounded-full"
                    >
                        °C
                    </Button>
                    <Button 
                        size="sm"
                        variant={tempUnit === 'f' ? 'default' : 'outline'}
                        onClick={() => setTempUnit('f')}
                        className="rounded-full"
                    >
                        °F
                    </Button>
                </div>
                <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-auto">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input 
                            placeholder="Search city..." 
                            className="pl-10 bg-card border-border"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                        />
                    </div>
                </form>
                 <Button onClick={getLocation} disabled={loading}>
                    <LocateFixed className="mr-2 h-4 w-4" />
                    Current Location
                </Button>
            </header>
            <main>
                {renderContent()}
            </main>
        </div>
    );
}
