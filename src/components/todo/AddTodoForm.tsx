
"use client";

import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTodos } from "@/context/TodoContext";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Todo } from "@/lib/types";

const todoFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  due_date: z.date().optional(),
});

type TodoFormValues = z.infer<typeof todoFormSchema>;

interface AddTodoFormProps {
  projectId: string; // Can be a project_id or "inbox"
  existingTodo?: Todo;
  onCancel?: () => void;
  onAdded?: () => void;
}

export function AddTodoForm({ projectId, existingTodo, onCancel, onAdded }: AddTodoFormProps) {
  const { addTodo, updateTodo } = useTodos();
  const form = useForm<TodoFormValues>({
    resolver: zodResolver(todoFormSchema),
    defaultValues: {
      title: existingTodo?.title || "",
      description: existingTodo?.description || "",
      due_date: existingTodo?.due_date ? new Date(existingTodo.due_date) : undefined,
    },
  });
  
  const isEditing = !!existingTodo;

  const onSubmit = async (values: TodoFormValues) => {
    const data = {
        ...values,
        due_date: values.due_date ? format(values.due_date, 'yyyy-MM-dd') : undefined,
    };
    
    if (isEditing) {
        await updateTodo(existingTodo.todo_id, data);
        onCancel?.();
    } else {
        await addTodo({ ...data, project_id: projectId });
        form.reset({ title: "", description: "", due_date: undefined });
        onAdded?.();
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="p-3 border rounded-lg space-y-3">
        <Input 
            placeholder="Task name"
            {...form.register("title")}
            className="border-none text-base font-medium focus-visible:ring-0 !px-0"
            autoFocus
        />
        <Textarea 
            placeholder="Description"
            {...form.register("description")}
            className="border-none focus-visible:ring-0 resize-none !px-0"
            rows={2}
        />
        <div className="flex justify-between items-center">
            <Popover>
                <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className={cn(!form.watch('due_date') && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.watch('due_date') ? format(form.watch('due_date')!, 'MMM d') : "Due date"}
                </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                <Calendar
                    mode="single"
                    selected={form.watch('due_date')}
                    onSelect={(date) => form.setValue('due_date', date)}
                    initialFocus
                />
                </PopoverContent>
            </Popover>

             <div className="flex gap-2">
                {onCancel && (
                    <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
                      Cancel
                    </Button>
                )}
                <Button type="submit" size="sm" disabled={!form.formState.isDirty && !isEditing}>
                  {isEditing ? "Save" : "Add task"}
                </Button>
            </div>
        </div>
        {form.formState.errors.title && <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>}
    </form>
  );
}
