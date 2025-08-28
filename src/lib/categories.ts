
export const CATEGORIES = [
    { name: 'Personal', colorClass: 'bg-personal-tag text-personal-tag-foreground' },
    { name: 'Work', colorClass: 'bg-work-tag text-work-tag-foreground' },
    { name: 'Social', colorClass: 'bg-social-tag text-social-tag-foreground' },
    { name: 'Health', colorClass: 'bg-health-tag text-health-tag-foreground' },
    { name: 'Other', colorClass: 'bg-other-tag text-other-tag-foreground' },
];

export const getCategoryByName = (name: string) => {
    return CATEGORIES.find(category => category.name === name);
}
