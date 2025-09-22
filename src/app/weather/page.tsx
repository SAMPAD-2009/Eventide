
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { WeatherCard } from '@/components/WeatherCard';
import { WeatherPageSkeleton } from '@/components/WeatherPageSkeleton';
import type { WeatherData } from '@/lib/types';

export default function WeatherPage() {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;

    const fetchWeather = (lat: number, lon: number) => {
        setLoading(true);
        // Use the forecast endpoint to get current, daily, and hourly weather
        fetch(`https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${lat},${lon}&days=5&aqi=no&alerts=no`)
            .then(res => {
                if (!res.ok) {
                    throw new Error('Failed to fetch weather data. Please check your API key and network connection.');
                }
                return res.json();
            })
            .then(data => {
                if (data.error) {
                    throw new Error(data.error.message);
                }
                setWeather(data);
                setError(null);
            })
            .catch(err => {
                setError(err.message);
                console.error(err);
            })
            .finally(() => setLoading(false));
    };

    const getLocation = () => {
        setLoading(true);
        setError(null);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    fetchWeather(position.coords.latitude, position.coords.longitude);
                },
                (err) => {
                    setError(`Could not get location: ${err.message}. Please enable location services.`);
                    setLoading(false);
                }
            );
        } else {
            setError("Geolocation is not supported by this browser.");
            setLoading(false);
        }
    };

    useEffect(() => {
        getLocation();
    }, []);

    const renderContent = () => {
        if (loading) {
            return <WeatherPageSkeleton />;
        }

        if (error) {
            return (
                <div className="w-full max-w-md mx-auto p-4">
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
            return <WeatherCard weather={weather} onRefresh={getLocation} />;
        }

        return null;
    };

    return (
        <div className="w-full min-h-[calc(100vh-8rem)] p-2 md:p-4 lg:p-8">
            {renderContent()}
        </div>
    );
}
