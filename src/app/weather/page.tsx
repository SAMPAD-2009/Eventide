
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


    const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;

    const fetchWeather = (locationQuery: string) => {
        if (!apiKey || apiKey === "YOUR_API_KEY") {
            setError("Weather API key is not configured. Please add NEXT_PUBLIC_WEATHER_API_KEY to your environment variables.");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        
        fetch(`https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${locationQuery}&days=5&aqi=yes&alerts=no`)
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
                        <CurrentWeatherCard weather={weather} />
                        <ForecastCard forecast={weather.forecast.forecastday.slice(1)} />
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
                            <HighlightCard title="Feels Like" icon={<Thermometer />} value={`${Math.round(weather.current.feelslike_c)}°c`} />
                        </div>
                        <HourlyForecastCard hourlyData={weather.forecast.forecastday[0].hour} timezone={weather.location.tz_id} />
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
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16 4C9.37258 4 4 9.37258 4 16C4 22.6274 9.37258 28 16 28C22.6274 28 28 22.6274 28 16C28 9.37258 22.6274 4 16 4Z" fill="url(#paint0_linear_134_4)"/>
                        <path d="M21 13C21 12.4696 20.7893 11.9609 20.4142 11.5858C20.0391 11.2107 19.5304 11 19 11H14.26C14.004 9.941 13.065 9.167 12 9.05V9C12 8.46957 11.7893 7.96086 11.4142 7.58579C11.0391 7.21071 10.5304 7 10 7C9.46957 7 8.96086 7.21071 8.58579 7.58579C8.21071 7.96086 8 8.46957 8 9V9.05C6.935 9.167 5.996 9.941 5.74 11H5C4.46957 11 3.96086 11.2107 3.58579 11.5858C3.21071 11.9609 3 12.4696 3 13C3 13.5304 3.21071 14.0391 3.58579 14.4142C3.96086 14.7893 4.46957 15 5 15H5.74C5.996 16.059 6.935 16.833 8 16.95V17C8 17.5304 8.21071 18.0391 8.58579 18.4142C8.96086 18.7893 9.46957 19 10 19C10.5304 19 11.0391 18.7893 11.4142 18.4142C11.7893 18.0391 12 17.5304 12 17V16.95C13.065 16.833 14.004 16.059 14.26 15H19C19.5304 15 20.0391 14.7893 20.4142 14.4142C20.7893 14.0391 21 13.5304 21 13Z" fill="white" fillOpacity="0.8"/>
                        <defs>
                        <linearGradient id="paint0_linear_134_4" x1="16" y1="4" x2="16" y2="28" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#4F4F4F"/>
                        <stop offset="1" stopColor="#333333"/>
                        </linearGradient>
                        </defs>
                    </svg>
                    <span className="text-xl font-bold">weatherio</span>
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
