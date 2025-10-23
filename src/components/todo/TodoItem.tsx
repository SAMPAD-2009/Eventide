
"use client";

import { memo, lazy, Suspense } from 'react';
import { Todo } from "@/lib/types";
import { useTodos } from "@/context/TodoContext";
import { useLabels } from "@/context/LabelContext";
import { Checkbox } from "../ui/checkbox";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Trash2, Edit, Flag, Tag, Focus, Users } from "lucide-react";
import { format, parseISO, isToday, isPast } from 'date-fns';
import { getPriorityInfo } from "@/lib/priorities";
import { Badge } from "../ui/badge";
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Skeleton } from '../ui/skeleton';

const AddTodoForm = lazy(() => import("./AddTodoForm").then(module => ({ default: module.AddTodoForm })));


function EditFormSkeleton() {
    return (
        <div className="p-4 border rounded-lg space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex items-center gap-2 pt-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-20" />
            </div>
             <div className="flex justify-end gap-2 pt-2 border-t mt-4">
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-24" />
            </div>
        </div>
    )
}

interface TodoItemProps {
  todo: Todo;
  isEditing: boolean;
  onSetEditing: (todoId: string | null) => void;
  isReadOnly?: boolean;
}

function TodoItemComponent({ todo, isEditing, onSetEditing, isReadOnly = false }: TodoItemProps) {
  const { updateTodo, deleteTodo } = useTodos();
  const { getLabelById } = useLabels();
  const isCollabTodo = !!todo.collab_id;

  const handleComplete = (checked: boolean) => {
    updateTodo(todo.todo_id, { completed: checked });
  };
  
  const label = todo.label_id ? getLabelById(todo.label_id) : null;
  
  const DueDate = () => {
    if (!todo.due_date) return null;
    const date = parseISO(todo.due_date);
    const isDueToday = isToday(date);
    const isOverdue = isPast(date) && !isDueToday;

    return (
        <span className={cn("text-xs font-medium", 
            isDueToday ? "text-green-600 dark:text-green-400" : "",
            isOverdue ? "text-red-600 dark:text-red-400" : "text-muted-foreground"
        )}>
            {format(date, 'MMM d')}
        </span>
    );
  }
  
  const priorityInfo = getPriorityInfo(todo.priority);
  
  if (isEditing) {
    return (
      <Suspense fallback={<EditFormSkeleton />}>
        <AddTodoForm
          projectId={todo.project_id}
          existingTodo={todo}
          onCancel={() => onSetEditing(null)}
          onUpdated={() => onSetEditing(null)}
          collabId={todo.collab_id}
        />
      </Suspense>
    )
  }

  return (
    <motion.div 
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg border border-transparent hover:border-border transition-colors group",
        priorityInfo.borderClassName,
      )}
      whileHover={{ scale: 1.01 }}
    >
      <Checkbox
        id={`todo-${todo.todo_id}`}
        checked={todo.completed}
        onCheckedChange={handleComplete}
        className={cn("mt-1", priorityInfo.checkboxClassName)}
        disabled={isReadOnly}
      />
      <div className="flex-1">
        <label
          htmlFor={`todo-${todo.todo_id}`}
          className={cn(
            "font-medium leading-tight cursor-pointer",
            todo.completed && "line-through text-muted-foreground"
          )}
        >
          {todo.title}
        </label>
        {todo.description && (
          <p className="text-sm text-muted-foreground">{todo.description}</p>
        )}
        <div className="mt-1 flex items-center gap-3 flex-wrap">
            <DueDate />
            {isCollabTodo && todo.collaborations ? (
               <Button asChild variant="link" className="p-0 h-auto text-muted-foreground text-xs">
                    <Link href={`/collab/${todo.collab_id}`}>
                         <Users className="mr-1 h-3 w-3" />
                         <span className="font-semibold">{todo.collaborations.name}</span>
                    </Link>
                </Button>
            ) : null}
            {todo.priority !== 'Casual' && (
                <Flag className={cn("h-3 w-3", priorityInfo.className)} />
            )}
            {label && (
                <Badge
                    variant="outline"
                    className="text-xs"
                    style={{
                        borderColor: label.color,
                        color: label.color,
                    }}
                >
                    {label.name}
                </Badge>
            )}
        </div>
      </div>
      <div className="opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
        <Button asChild variant="ghost" size="icon">
          <Link href={`/focus/${todo.todo_id}`}>
            <Focus className="h-4 w-4" />
          </Link>
        </Button>
        {!isReadOnly && (
          <>
            {!todo.completed && (
                <Button variant="ghost" size="icon" onClick={() => onSetEditing(todo.todo_id)}>
                    <Edit className="h-4 w-4" />
                </Button>
            )}
            <Button variant="ghost" size="icon" onClick={() => deleteTodo(todo.todo_id)}>
                <Trash2 className="h-4 w-4 text-destructive/80" />
            </Button>
          </>
        )}
      </div>
    </motion.div>
  );
}
export const TodoItem = memo(TodoItemComponent);
