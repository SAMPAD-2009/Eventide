
"use client";

import { useMemo } from 'react';
import { useTodos } from '@/context/TodoContext';
import { isFuture, isToday, parseISO, format, startOfTomorrow } from 'date-fns';
import { groupBy } from 'lodash';
import { TaskList } from '@/components/todo/TaskList';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function TodoCalendarPage() {
  const { todos, isLoading } = useTodos();

  const { upcomingTodos, completedTodos, anytimeTodos } = useMemo(() => {
    if (isLoading) return { upcomingTodos: {}, completedTodos: [], anytimeTodos: [] };

    const activeTodos = todos.filter(t => !t.completed);
    
    const upcoming = activeTodos.filter(t => t.due_date && (isToday(parseISO(t.due_date)) || isFuture(parseISO(t.due_date))));
    const groupedUpcoming = groupBy(upcoming, todo => format(parseISO(todo.due_date!), 'yyyy-MM-dd'));
    
    const completed = todos.filter(t => t.completed);
    const anytime = activeTodos.filter(t => !t.due_date);
    
    return { upcomingTodos: groupedUpcoming, completedTodos: completed, anytimeTodos: anytime };
  }, [todos, isLoading]);

  const sortedDates = useMemo(() => {
      return Object.keys(upcomingTodos).sort();
  }, [upcomingTodos]);


  if (isLoading) {
    return (
        <div className="p-4 md:p-8 space-y-8">
            <Skeleton className="h-10 w-48 mb-6" />
            <div className="space-y-4">
                <Skeleton className="h-48 w-full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <Skeleton className="h-64 w-full" />
                 <Skeleton className="h-64 w-full" />
            </div>
        </div>
    );
  }

  return (
    <div className="w-full mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Todo Calendar</h1>

      {/* Upcoming Todos Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold tracking-tight mb-4 border-b pb-2">Upcoming</h2>
        {sortedDates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sortedDates.map(dateStr => (
                     <Card key={dateStr} className="flex flex-col">
                        <CardHeader>
                            <CardTitle className="text-lg">
                                {format(parseISO(dateStr), 'EEEE, MMM d')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow">
                             <TaskList todos={upcomingTodos[dateStr]} />
                        </CardContent>
                    </Card>
                ))}
            </div>
        ) : (
             <Card className="flex items-center justify-center h-40 border-dashed">
                <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">No upcoming tasks with due dates.</p>
                </CardContent>
            </Card>
        )}
      </div>

      <Separator className="my-8" />
      
      {/* Bottom Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Completed Todos */}
        <div>
          <h2 className="text-2xl font-semibold tracking-tight mb-4 border-b pb-2">Completed</h2>
          <div className="max-h-96 overflow-y-auto pr-4">
            <TaskList todos={completedTodos} />
          </div>
        </div>

        {/* Anytime Todos */}
        <div>
          <h2 className="text-2xl font-semibold tracking-tight mb-4 border-b pb-2">Will Do Anytime</h2>
          <div className="max-h-96 overflow-y-auto pr-4">
             <TaskList todos={anytimeTodos} />
          </div>
        </div>
      </div>
    </div>
  );
}
