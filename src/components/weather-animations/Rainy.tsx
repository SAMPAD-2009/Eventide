
import React from 'react';
import { CloudRain } from 'lucide-react';

export function Rainy() {
    const drops = Array.from({ length: 30 });

    return (
        <div className="relative w-full h-full overflow-hidden">
            <CloudRain
                className="absolute top-1/4 left-1/2 -translate-x-1/2 text-gray-400 dark:text-gray-500"
                size={100}
            />
            {drops.map((_, i) => (
                <div
                    key={i}
                    className="absolute bg-blue-400 w-0.5 h-4 rounded-full animate-rain"
                    style={{
                        left: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 2}s`,
                        animationDuration: `${0.5 + Math.random() * 0.5}s`
                    }}
                />
            ))}
        </div>
    );
}
