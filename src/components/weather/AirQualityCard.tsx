
"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AirQualityData } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Wind } from 'lucide-react';

interface AirQualityCardProps {
  airQuality: AirQualityData;
}

const getAqiStatus = (index: number) => {
    if (index <= 2) return { text: 'Good', className: 'bg-green-500/20 text-green-500 border-green-500/50' };
    if (index <= 4) return { text: 'Moderate', className: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50' };
    return { text: 'Poor', className: 'bg-red-500/20 text-red-500 border-red-500/50' };
}

export function AirQualityCard({ airQuality }: AirQualityCardProps) {
  if (!airQuality) return null;

  const aqiStatus = getAqiStatus(airQuality['gb-defra-index']);

  return (
    <Card className="bg-card text-card-foreground shadow-sm rounded-2xl p-6">
      <CardHeader className="p-0 pb-4 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-medium text-muted-foreground">Air Quality Index</CardTitle>
        <Badge variant="outline" className={aqiStatus.className}>{aqiStatus.text}</Badge>
      </CardHeader>
      <CardContent className="p-0 flex items-center gap-6">
        <Wind className="h-10 w-10 text-muted-foreground" />
        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2">
            <div className="text-center">
                <p className="text-sm text-muted-foreground">PM2.5</p>
                <p className="text-xl font-bold">{airQuality.pm2_5.toFixed(2)}</p>
            </div>
            <div className="text-center">
                <p className="text-sm text-muted-foreground">SO2</p>
                <p className="text-xl font-bold">{airQuality.so2.toFixed(2)}</p>
            </div>
            <div className="text-center">
                <p className="text-sm text-muted-foreground">NO2</p>
                <p className="text-xl font-bold">{airQuality.no2.toFixed(2)}</p>
            </div>
            <div className="text-center">
                <p className="text-sm text-muted-foreground">O3</p>
                <p className="text-xl font-bold">{airQuality.o3.toFixed(2)}</p>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
