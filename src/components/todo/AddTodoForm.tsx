
"use client";

import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTodos } from "@/context/TodoContext";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { CalendarIcon, Flag, MoreHorizontal, Inbox, FolderPlus, Folder } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { format, addDays, endOfWeek } from "date-fns";
import { cn } from "@/lib/utils";
import { Todo, Priority } from "@/lib/types";
import { PRIORITIES, getPriorityInfo } from "@/lib/priorities";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { AddProjectDialog } from "./AddProjectDialog";
import { Card } from "../ui/card";


const todoFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  due_date: z.date().optional(),
  priority: z.string().default('Casual'),
  project_id: z.string(),
});

type TodoFormValues = z.infer<typeof todoFormSchema>;

interface AddTodoFormProps {
  projectId: string;
  existingTodo?: Todo;
  onCancel?: () => void;
  onAdded?: () => void;
  onUpdated?: () => void;
}

export function AddTodoForm({ projectId, existingTodo, onCancel, onAdded, onUpdated }: AddTodoFormProps) {
  const { addTodo, updateTodo, projects } = useTodos();
  const [isAddProjectDialogOpen, setAddProjectDialogOpen] = useState(false);
  const [isDateDialogOpen, setDateDialogOpen] = useState(false);

  const form = useForm<TodoFormValues>({
    resolver: zodResolver(todoFormSchema),
    defaultValues: {
      title: "",
      description: "",
      due_date: undefined,
      priority: 'Casual',
      project_id: projectId,
    },
  });

  useEffect(() => {
    form.reset({
      title: existingTodo?.title || "",
      description: existingTodo?.description || "",
      due_date: existingTodo?.due_date ? new Date(existingTodo.due_date) : undefined,
      priority: existingTodo?.priority || 'Casual',
      project_id: existingTodo?.project_id || projectId,
    })
  }, [existingTodo, projectId, form]);
  
  const isEditing = !!existingTodo;

  const onSubmit = async (values: TodoFormValues) => {
    const data = {
        ...values,
        due_date: values.due_date ? format(values.due_date, 'yyyy-MM-dd') : undefined,
        priority: values.priority as Priority,
    };
    
    if (isEditing) {
        await updateTodo(existingTodo.todo_id, data);
        onUpdated?.();
    } else {
        await addTodo(data);
        form.reset({ 
            title: "",
            description: "",
            due_date: form.getValues('due_date'),
            priority: form.getValues('priority'),
            project_id: form.getValues('project_id'),
        });
        if(onAdded) {
           onAdded();
        } else {
           // This keeps the form open for continuous adding
           form.setFocus('title'); 
        }
    }
  };
  
  const setDate = (date: Date | undefined) => {
    form.setValue('due_date', date, { shouldDirty: true });
    setDateDialogOpen(false);
  }

  const currentProjectId = form.watch('project_id');
  const currentProject = projects.find(p => p.project_id === currentProjectId);
  const inboxProject = projects.find(p => p.name === 'Inbox');

  const getProjectName = () => {
    if (currentProjectId === inboxProject?.project_id) return 'Inbox';
    return currentProject?.name;
  }
  
  const priorityValue = form.watch('priority') as Priority;
  const priorityInfo = getPriorityInfo(priorityValue);


  return (
    <>
      <AddProjectDialog isOpen={isAddProjectDialogOpen} onOpenChange={setAddProjectDialogOpen} />
       <Card className={cn(isEditing ? "" : "p-4 border border-border")}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <div className="space-y-1 pl-4">
                <Input 
                    placeholder="Task name"
                    {...form.register("title")}
                    className="border-none text-base font-medium focus-visible:ring-0 px-0"
                    autoFocus
                />
                <Input
                    placeholder="Description"
                    {...form.register("description")}
                    className="border-none text-sm text-muted-foreground focus-visible:ring-0 resize-none px-0 h-auto py-0"
                />
            </div>
            
            <div className="flex items-center gap-1 pt-2">
                <Dialog open={isDateDialogOpen} onOpenChange={setDateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button type="button" variant="outline" size="sm" className={cn("text-sm h-8", !form.watch('due_date') && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {form.watch('due_date') ? format(form.watch('due_date')!, 'MMM d') : "Due date"}
                        </Button>
                    </DialogTrigger>
                        <DialogContent className="w-auto p-0">
                          <DialogHeader className="sr-only">
                            <DialogTitle>Set due date</DialogTitle>
                            <DialogDescription>Select a due date for your task.</DialogDescription>
                          </DialogHeader>
                        <div className="p-2 space-y-1">
                            <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => setDate(new Date())}>Today</Button>
                            <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => setDate(addDays(new Date(), 1))}>Tomorrow</Button>
                            <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => setDate(endOfWeek(new Date()))}>This weekend</Button>
                        </div>
                        <Calendar
                            mode="single"
                            selected={form.watch('due_date')}
                            onSelect={(date) => setDate(date)}
                            initialFocus
                            className="p-0 border-t"
                        />
                    </DialogContent>
                </Dialog>
            
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8">
                            <Flag className={cn("mr-2 h-4 w-4", priorityInfo.className)} />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuLabel>Set Priority</DropdownMenuLabel>
                        <DropdownMenuRadioGroup value={priorityValue} onValueChange={(value) => form.setValue('priority', value, { shouldDirty: true })}>
                            {PRIORITIES.map(p => (
                            <DropdownMenuRadioItem key={p.level} value={p.level}>
                                <Flag className={cn("mr-2 h-4 w-4", p.className)} />
                                {p.level}
                            </DropdownMenuRadioItem>
                            ))}
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuLabel>Project</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => setAddProjectDialogOpen(true)}>
                            <FolderPlus className="mr-2 h-4 w-4" />
                            Create new project
                        </DropdownMenuItem>
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                                <Folder className="mr-2 h-4 w-4" />
                                Move to project
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                                <DropdownMenuRadioGroup value={currentProjectId} onValueChange={(value) => form.setValue('project_id', value)}>
                                    {projects.map(p => (
                                    <DropdownMenuRadioItem key={p.project_id} value={p.project_id}>
                                        {p.name}
                                    </DropdownMenuRadioItem>
                                    ))}
                                </DropdownMenuRadioGroup>
                            </DropdownMenuSubContent>
                        </DropdownMenuSub>
                    </DropdownMenuContent>
                </DropdownMenu>

                <div className="flex-grow"></div>
                
                <Button variant="ghost" size="sm" disabled className="ml-auto h-8">
                    {getProjectName() === 'Inbox' ? <Inbox className="mr-2 h-4 w-4"/> : <Folder className="mr-2 h-4 w-4"/>}
                    {getProjectName()}
                </Button>
            </div>
            
            <div className="flex justify-end gap-2 pt-2 border-t mt-4">
                {onCancel && (
                    <Button type="button" variant="ghost" onClick={onCancel}>
                        Cancel
                    </Button>
                )}
                <Button type="submit" size="default" disabled={isEditing && !form.formState.isDirty}>
                    {isEditing ? "Save changes" : "Add task"}
                </Button>
            </div>
            {form.formState.errors.title && <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>}
        </form>
      </Card>
    </>
  );
}
