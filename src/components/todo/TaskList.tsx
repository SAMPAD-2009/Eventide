
"use client";

import { Todo } from "@/lib/types";
import { TodoItem } from "./TodoItem";
import { AnimatePresence, motion } from "framer-motion";
import { Card, CardContent } from "../ui/card";

interface TaskListProps {
  todos: Todo[];
}

export function TaskList({ todos }: TaskListProps) {

  if (todos.length === 0) {
    return (
        <Card className="flex items-center justify-center h-48 border-dashed">
            <CardContent className="p-6 text-center">
                <p className="text-lg font-medium text-muted-foreground">All clear!</p>
                <p className="text-sm text-muted-foreground">Looks like there are no tasks here.</p>
            </CardContent>
        </Card>
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
            <TodoItem todo={todo} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
