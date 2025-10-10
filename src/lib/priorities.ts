
import type { Priority } from './types';

export const PRIORITIES: { level: Priority; className: string; borderClassName: string }[] = [
    { 
        level: 'Very Important', 
        className: 'text-red-500',
        borderClassName: 'border-red-500/30 hover:border-red-500/60'
    },
    { 
        level: 'Important', 
        className: 'text-orange-500',
        borderClassName: 'border-orange-500/30 hover:border-orange-500/60'
    },
    { 
        level: 'Not Important', 
        className: 'text-blue-500',
        borderClassName: 'border-blue-500/30 hover:border-blue-500/60'
    },
    { 
        level: 'Casual', 
        className: 'text-muted-foreground',
        borderClassName: 'border-transparent'
    },
];

export const getPriorityInfo = (level: Priority) => {
    return PRIORITIES.find(p => p.level === level) || PRIORITIES[3]; // Default to Casual
};
