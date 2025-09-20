
import React from 'react';
import { Cloud } from 'lucide-react';

export function Cloudy() {
    return (
        <div className="relative w-full h-full">
            <Cloud
                className="absolute top-1/4 left-1/4 text-white opacity-80 animate-move-cloud"
                size={80}
                style={{ animationDuration: '25s' }}
            />
            <Cloud
                className="absolute top-1/2 right-1/4 text-white opacity-60 animate-move-cloud"
                size={60}
                style={{ animationDuration: '30s', animationDelay: '-5s' }}
            />
            <Cloud
                className="absolute bottom-1/4 left-1/2 text-white opacity-70 animate-move-cloud"
                size={70}
                style={{ animationDuration: '20s', animationDelay: '-10s' }}
            />
        </div>
    );
}
