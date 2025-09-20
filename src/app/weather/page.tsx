
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { WeatherCard } from '@/components/WeatherCard';

interface WeatherData {
    location: {
        name: string;
        region: string;
    };
    current: {
        temp_c: number;
        temp_f: number;
        condition: {
            text: string;
            icon: string;
        };
        wind_mph: number;
        humidity: number;
    };
}

export default function WeatherPage() {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCelsius, setIsCelsius] = useState(true);

    const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;

    const fetchWeather = (lat: number, lon: number) => {
        setLoading(true);
        fetch(`https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${lat},${lon}`)
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
            return (
                <div className="flex flex-col items-center justify-center text-center p-8">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                    <p className="text-muted-foreground">Fetching weather for your location...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="p-4">
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
            return <WeatherCard weather={weather} isCelsius={isCelsius} onToggleTemperature={() => setIsCelsius(!isCelsius)} />;
        }

        return null;
    };


    return (
        <div className="w-full mx-auto p-4 md:p-8">
            <div className="max-w-md mx-auto">
                 <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold tracking-tight">Current Weather</h1>
                    <p className="text-muted-foreground">Live weather conditions for your location.</p>
                </div>
                <Card className="overflow-hidden">
                   {renderContent()}
                </Card>
            </div>
        </div>
    );
}
