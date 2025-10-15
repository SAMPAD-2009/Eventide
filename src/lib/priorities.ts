
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
        className: 'text-orange-500',
        borderClassName: 'border-orange-500/30 hover:border-orange-500/60',
        checkboxClassName: 'border-orange-500 data-[state=checked]:bg-orange-500 data-[state=checked]:text-white',
    },
    { 
        level: 'Not Important', 
        className: 'text-blue-500',
        borderClassName: 'border-blue-500/30 hover:border-blue-500/60',
        checkboxClassName: 'border-blue-500 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white',
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
