
"use client";

import { useState } from "react";
import { Todo } from "@/lib/types";
import { useTodos } from "@/context/TodoContext";
import { Checkbox } from "../ui/checkbox";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Trash2, Edit } from "lucide-react";
import { AddTodoForm } from "./AddTodoForm";
import { format, parseISO, isToday, isPast } from 'date-fns';

export function TodoItem({ todo }: { todo: Todo }) {
  const { updateTodo, deleteTodo } = useTodos();
  const [isEditing, setIsEditing] = useState(false);

  const handleComplete = (checked: boolean) => {
    updateTodo(todo.todo_id, { completed: checked });
  };
  
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

  if (isEditing) {
    return <AddTodoForm existingTodo={todo} onCancel={() => setIsEditing(false)} />;
  }

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-transparent hover:border-border transition-colors group">
      <Checkbox
        id={`todo-${todo.todo_id}`}
        checked={todo.completed}
        onCheckedChange={handleComplete}
        className="mt-1"
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
        <div className="mt-1">
            <DueDate />
        </div>
      </div>
      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
        <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => deleteTodo(todo.todo_id)}>
          <Trash2 className="h-4 w-4 text-destructive/80" />
        </Button>
      </div>
    </div>
  );
}
