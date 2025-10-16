
'use client';

import { useTodos } from '@/context/TodoContext';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, CheckCircle, Circle, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getPriorityInfo } from '@/lib/priorities';
import { cn } from '@/lib/utils';
import type { Todo } from '@/lib/types';

export default function FocusPage() {
  const { taskId } = useParams();
  const { getTodoById, updateTodo, isLoading: isTodosLoading } = useTodos();
  const router = useRouter();
  const [todo, setTodo] = useState<Todo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isTodosLoading && taskId) {
      const foundTodo = getTodoById(taskId as string);
      if (foundTodo) {
        setTodo(foundTodo);
      }
      setIsLoading(false);
    }
  }, [taskId, getTodoById, isTodosLoading]);

  const handleToggleComplete = () => {
    if (todo) {
      const newCompletedStatus = !todo.completed;
      updateTodo(todo.todo_id, { completed: newCompletedStatus });
      setTodo({ ...todo, completed: newCompletedStatus });
    }
  };

  if (isLoading) {
    return <FocusPageSkeleton />;
  }

  if (!todo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-8">
        <h2 className="text-2xl font-semibold mb-4">Task Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The task you're looking for doesn't exist or has been deleted.
        </p>
        <Button onClick={() => router.push('/todo')}>
          <ArrowLeft className="mr-2" />
          Back to Tasks
        </Button>
      </div>
    );
  }

  const priorityInfo = getPriorityInfo(todo.priority);

  const backgroundColors: { [key: string]: string } = {
      'Very Important': 'from-red-500/10 via-background to-background',
      'Important': 'from-yellow-500/10 via-background to-background',
      'Not Important': 'from-sky-500/10 via-background to-background',
      'Casual': 'from-muted/20 via-background to-background',
  }

  return (
    <div className={cn("min-h-screen flex flex-col justify-between p-4 md:p-8 transition-colors bg-gradient-to-br", backgroundColors[todo.priority])}>
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/10 rounded-full filter blur-3xl animate-move-cloud opacity-30"></div>
        <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-accent/10 rounded-full filter blur-3xl animate-move-cloud animation-delay-5000 opacity-30"></div>
      </div>
      
      <header className="w-full">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2" />
          Back
        </Button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="max-w-2xl w-full">
          <div className="flex items-center justify-center gap-2 mb-4">
             <Flag className={cn("h-5 w-5", priorityInfo.className)} />
             <span className={cn("font-semibold", priorityInfo.className)}>
                {todo.priority}
             </span>
          </div>
          <h1
            className={cn(
              'text-3xl md:text-5xl font-bold break-words transition-all',
              todo.completed && 'line-through text-muted-foreground'
            )}
          >
            {todo.title}
          </h1>
          {todo.description && (
            <p className="mt-4 text-lg md:text-xl text-muted-foreground">
              {todo.description}
            </p>
          )}
        </div>
      </main>

      <footer className="w-full flex justify-center">
        <Button
          onClick={handleToggleComplete}
          variant="outline"
          size="lg"
          className={cn(
            "bg-background/50 backdrop-blur-sm transition-all hover:scale-105",
            todo.completed && "border-green-500/50 bg-green-500/10 text-green-500"
          )}
        >
          {todo.completed ? (
            <>
              <CheckCircle className="mr-2 text-green-500" />
              Mark as Incomplete
            </>
          ) : (
            <>
              <Circle className="mr-2" />
              Mark as Complete
            </>
          )}
        </Button>
      </footer>
    </div>
  );
}

function FocusPageSkeleton() {
    return (
         <div className="min-h-screen flex flex-col justify-between p-4 md:p-8">
            <header className="w-full">
                 <Skeleton className="h-10 w-24" />
            </header>
            <main className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="max-w-2xl w-full space-y-4">
                    <Skeleton className="h-6 w-32 mx-auto" />
                    <Skeleton className="h-12 w-3/4 mx-auto" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-5/6" />
                </div>
            </main>
             <footer className="w-full flex justify-center">
                <Skeleton className="h-12 w-48" />
             </footer>
        </div>
    )
}
