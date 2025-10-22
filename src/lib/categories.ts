
export const CATEGORIES = [
    { 
        name: 'Personal', 
        colorClass: 'bg-personal-tag text-personal-tag-foreground', 
        borderColorClass: 'border-personal-tag-foreground',
        cssVars: { bg: '--personal-tag-bg', fg: '--personal-tag-fg' }
    },
    { 
        name: 'Work', 
        colorClass: 'bg-work-tag text-work-tag-foreground', 
        borderColorClass: 'border-work-tag-foreground',
        cssVars: { bg: '--work-tag-bg', fg: '--work-tag-fg' }
    },
    { 
        name: 'Social', 
        colorClass: 'bg-social-tag text-social-tag-foreground',
        borderColorClass: 'border-social-tag-foreground',
        cssVars: { bg: '--social-tag-bg', fg: '--social-tag-fg' }
    },
    { 
        name: 'Health', 
        colorClass: 'bg-health-tag text-health-tag-foreground',
        borderColorClass: 'border-health-tag-foreground',
        cssVars: { bg: '--health-tag-bg', fg: '--health-tag-fg' }
    },
    { 
        name: 'Other', 
        colorClass: 'bg-other-tag text-other-tag-foreground',
        borderColorClass: 'border-other-tag-foreground',
        cssVars: { bg: '--other-tag-bg', fg: '--other-tag-fg' }
    },
];

export const getCategoryByName = (name: string) => {
    return CATEGORIES.find(category => category.name === name);
}
