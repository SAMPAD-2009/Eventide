
"use client";

import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface DroppableDayProps {
    date: Date;
    isCurrentMonth: boolean;
    isToday: boolean;
    children: React.ReactNode;
}

export function DroppableDay({ date, isCurrentMonth, isToday, children }: DroppableDayProps) {
    const dateKey = format(date, 'yyyy-MM-dd');
    const { isOver, setNodeRef } = useDroppable({
        id: dateKey,
    });

    return (
        <div
            ref={setNodeRef}
            className={cn(
                "border-b border-r p-2 flex flex-col min-h-[120px] transition-colors duration-200",
                isCurrentMonth ? 'bg-background' : 'bg-muted/50',
                isToday && 'bg-blue-100 dark:bg-blue-900/30',
                isOver && 'bg-accent'
            )}
        >
            <span className={cn(
                "font-medium mb-2",
                isCurrentMonth ? 'text-foreground' : 'text-muted-foreground/50'
            )}>
                {format(date, 'd')}
            </span>
            <div className="flex-1 space-y-1">
                {children}
            </div>
        </div>
    );
}
