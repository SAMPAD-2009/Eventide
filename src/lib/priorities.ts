
import type { Priority } from './types';

export const PRIORITIES: { level: Priority; className: string; borderClassName: string; checkboxClassName: string }[] = [
    { 
        level: 'Very Important', 
        className: 'text-red-500',
        borderClassName: 'border-red-500/30 hover:border-red-500/60',
        checkboxClassName: 'border-red-500 data-[state=checked]:bg-red-500 data-[state=checked]:text-white',
    },
    { 
        level: 'Important', 
        className: 'text-yellow-500',
        borderClassName: 'border-yellow-500/30 hover:border-yellow-500/60',
        checkboxClassName: 'border-yellow-500 data-[state=checked]:bg-yellow-500 data-[state=checked]:text-white',
    },
    { 
        level: 'Not Important', 
        className: 'text-sky-500',
        borderClassName: 'border-sky-500/30 hover:border-sky-500/60',
        checkboxClassName: 'border-sky-500 data-[state=checked]:bg-sky-500 data-[state=checked]:text-white',
    },
    { 
        level: 'Casual', 
        className: 'text-muted-foreground',
        borderClassName: 'border-transparent',
        checkboxClassName: 'border-primary data-[state=checked]:bg-primary',
    },
];

export const getPriorityInfo = (level: Priority) => {
    return PRIORITIES.find(p => p.level === level) || PRIORITIES[3]; // Default to Casual
};
