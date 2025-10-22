
"use client";

import { Todo } from "@/lib/types";
import { TodoItem } from "./TodoItem";
import { AnimatePresence, motion } from "framer-motion";
import Image from 'next/image';

interface TaskListProps {
  todos: Todo[];
  editingTodoId?: string | null;
  onSetEditing?: (todoId: string | null) => void;
  isReadOnly?: boolean;
}

export function TaskList({ todos, editingTodoId, onSetEditing, isReadOnly = false }: TaskListProps) {

  if (todos.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center text-center p-8 gap-4 mt-8">
            <Image
                src="/todo-not-min.png"
                alt="All tasks clear"
                data-ai-hint="illustration tasks done"
                width={300}
                height={300}
                className="max-w-[200px] md:max-w-[300px] rounded-lg"
            />
            <h3 className="text-xl md:text-2xl font-semibold text-muted-foreground mt-4">All clear!</h3>
            <p className="text-muted-foreground">Looks like there are no tasks here.</p>
        </div>
    );
  }

  return (
    <div className="space-y-2">
      <AnimatePresence>
        {todos.map((todo) => (
          <motion.div
            key={todo.todo_id}
            layout
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
          >
            <TodoItem 
                todo={todo}
                isEditing={editingTodoId === todo.todo_id}
                onSetEditing={onSetEditing!}
                isReadOnly={isReadOnly && !!todo.collab_id}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
