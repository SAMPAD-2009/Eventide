
import React from 'react';
import { CloudSnow } from 'lucide-react';

export function Snowy() {
    const flakes = Array.from({ length: 30 });

    return (
        <div className="relative w-full h-full overflow-hidden">
             <CloudSnow
                className="absolute top-1/4 left-1/2 -translate-x-1/2 text-gray-300 dark:text-gray-400"
                size={100}
            />
            {flakes.map((_, i) => (
                <div
                    key={i}
                    className="absolute bg-white rounded-full animate-snow"
                    style={{
                        left: `${Math.random() * 100}%`,
                        width: `${2 + Math.random() * 4}px`,
                        height: `${2 + Math.random() * 4}px`,
                        animationDelay: `${Math.random() * 5}s`,
                        animationDuration: `${3 + Math.random() * 4}s`,
                    }}
                />
            ))}
        </div>
    );
}
