
"use client";

import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface DroppableDayProps {
    date: Date;
    isCurrentMonth: boolean;
    isToday: boolean;
    children: React.ReactNode;
    onDoubleClick: (date: Date) => void;
    onClick: (date: Date) => void;
}

export function DroppableDay({ date, isCurrentMonth, isToday, children, onDoubleClick, onClick }: DroppableDayProps) {
    const dateKey = format(date, 'yyyy-MM-dd');
    const { isOver, setNodeRef } = useDroppable({
        id: dateKey,
    });

    return (
        <div
            ref={setNodeRef}
            onDoubleClick={() => onDoubleClick(date)}
            className={cn(
                "border-b border-r p-1 flex flex-col min-h-[80px] sm:min-h-[120px] transition-colors duration-200",
                isCurrentMonth ? 'bg-background' : 'bg-muted/50',
                isToday && 'bg-blue-100 dark:bg-blue-900/30',
                isOver && 'bg-accent'
            )}
        >
            <span
              className={cn(
                  "font-medium text-xs sm:text-sm text-center w-6 h-6 flex items-center justify-center rounded-full cursor-pointer hover:bg-accent transition-colors self-end sm:self-center",
                  isToday && "bg-primary text-primary-foreground",
                  isCurrentMonth ? 'text-foreground' : 'text-muted-foreground/50'
              )}
              onClick={(e) => {
                e.stopPropagation(); // prevent double click from firing
                onClick(date)
              }}
            >
                {format(date, 'd')}
            </span>
            <div className="flex-1 space-y-1">
                {children}
            </div>
        </div>
    );
}
