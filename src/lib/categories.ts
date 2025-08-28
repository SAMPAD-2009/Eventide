
export const CATEGORIES = [
    { name: 'Personal', colorClass: 'bg-blue-500 hover:bg-blue-600 text-blue-50' },
    { name: 'Work', colorClass: 'bg-green-500 hover:bg-green-600 text-green-50' },
    { name: 'Social', colorClass: 'bg-purple-500 hover:bg-purple-600 text-purple-50' },
    { name: 'Health', colorClass: 'bg-red-500 hover:bg-red-600 text-red-50' },
    { name: 'Other', colorClass: 'bg-gray-500 hover:bg-gray-600 text-gray-50' },
];

export const getCategoryByName = (name: string) => {
    return CATEGORIES.find(category => category.name === name);
}
