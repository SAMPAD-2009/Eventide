
import React from 'react';
import { Sun } from 'lucide-react';

export function Sunny() {
    return (
        <div className="relative w-full h-full flex items-center justify-center">
            <Sun
                className="text-yellow-400 animate-spin-slow"
                size={120}
                style={{ animation: 'spin 20s linear infinite' }}
            />
        </div>
    );
}
