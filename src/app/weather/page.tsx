
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { LocateFixed, Search } from 'lucide-react';
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
    const [tempUnit, setTempUnit] = useState<'c' | 'f'>('c');

    const fetchWeatherData = async (latitude: number, longitude: number) => {
        try {
            const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset&hourly=temperature_2m,visibility&current=temperature_2m,relative_humidity_2m,apparent_temperature,surface_pressure&temperature_unit=celsius&wind_speed_unit=ms&precipitation_unit=inch&timezone=auto`);
            if (!weatherResponse.ok) throw new Error("Failed to fetch weather forecast.");
            const weatherData = await weatherResponse.json();

            const airQualityResponse = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=nitrogen_dioxide,sulphur_dioxide,ozone,pm2_5,european_aqi`);
            if (!airQualityResponse.ok) throw new Error("Failed to fetch air quality data.");
            const airQualityData = await airQualityResponse.json();

            const locationResponse = await fetch(`https://geocode.maps.co/reverse?lat=${latitude}&lon=${longitude}&api_key=${process.env.NEXT_PUBLIC_GEOCODE_API_KEY}`);
            if (!locationResponse.ok) throw new Error("Failed to fetch location name.");
            const locationData = await locationResponse.json();

            return { 
                ...weatherData, 
                air_quality: airQualityData.current,
                location: {
                    name: locationData.address?.city || locationData.address?.town || 'Unknown Location',
                    country: locationData.address?.country || ''
                }
            };
        } catch (err: any) {
            let errorMessage = err.message;
            if (err.message.includes('Unexpected token')) {
                errorMessage = "An API error occurred. This might be due to an invalid API key or network issue.";
            }
            throw new Error(errorMessage);
        }
    }

    const fetchWeatherForCoords = (lat: number, lon: number) => {
        setLoading(true);
        setError(null);
        fetchWeatherData(lat, lon)
            .then(data => {
                setWeather(data);
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
                    fetchWeatherForCoords(position.coords.latitude, position.coords.longitude);
                },
                (err) => {
                    setError(`Could not get location: ${err.message}. Please enable location services or search for a city.`);
                    fetchWeatherForCoords(51.5074, -0.1278);
                }
            );
        } else {
             setError("Geolocation is not supported by this browser.");
             fetchWeatherForCoords(51.5074, -0.1278);
        }
    };
    
    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!city) return;
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`https://geocode.maps.co/search?q=${city}&api_key=${process.env.NEXT_PUBLIC_GEOCODE_API_KEY}`);
            if (!response.ok) {
                 const errorText = await response.text();
                 throw new Error(`Geocoding API error: ${response.status} ${errorText}`);
            }
            const data = await response.json();
            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                fetchWeatherForCoords(parseFloat(lat), parseFloat(lon));
            } else {
                throw new Error("Could not find location. Please try another city name.");
            }
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
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
                        <ForecastCard forecast={weather.daily} tempUnit={tempUnit} />
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-2 xl:col-span-3 space-y-6">
                        <h2 className="text-xl font-bold text-foreground">Today's Highlights</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <AirQualityCard airQuality={weather.air_quality} />
                            <SunriseSunsetCard astro={weather.daily} />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                             <HighlightCard title="Humidity" icon={<Droplets />} value={`${weather.current.relative_humidity_2m}%`} />
                            <HighlightCard title="Pressure" icon={<Wind />} value={`${Math.round(weather.current.surface_pressure)}hPa`} />
                            <HighlightCard title="Visibility" icon={<Eye />} value={`${(weather.hourly.visibility[0] / 1000).toFixed(1)} km`} />
                            <HighlightCard 
                                title="Feels Like" 
                                icon={<Thermometer />} 
                                value={`${Math.round(tempUnit === 'c' ? weather.current.apparent_temperature : (weather.current.apparent_temperature * 9/5) + 32)}°`} 
                            />
                        </div>
                        <HourlyForecastCard hourlyData={weather.hourly} timezone={weather.timezone} tempUnit={tempUnit} />
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
