
export const CATEGORIES = [
    { name: 'Personal', colorClass: 'bg-blue-900 text-blue-100' },
    { name: 'Work', colorClass: 'bg-green-900 text-green-100' },
    { name: 'Social', colorClass: 'bg-purple-900 text-purple-100' },
    { name: 'Health', colorClass: 'bg-red-900 text-red-100' },
    { name: 'Other', colorClass: 'bg-gray-700 text-gray-100' },
];

export const getCategoryByName = (name: string) => {
    return CATEGORIES.find(category => category.name === name);
}
