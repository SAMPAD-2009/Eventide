
"use client";

import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTodos } from "@/context/TodoContext";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { CalendarIcon, Flag, MoreHorizontal, Inbox, FolderPlus, Folder } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { format, addDays, startOfWeek, endOfWeek } from "date-fns";
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
import { ScrollArea } from "../ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";


const todoFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  due_date: z.date().optional(),
  priority: z.string().default('Casual'),
  project_id: z.string(),
});

type TodoFormValues = z.infer<typeof todoFormSchema>;

interface AddTodoFormProps {
  projectId: string; // Can be a project_id or "inbox"
  existingTodo?: Todo;
  onCancel?: () => void;
  onAdded?: () => void;
  onUpdated?: () => void;
}

export function AddTodoForm({ projectId, existingTodo, onCancel, onAdded, onUpdated }: AddTodoFormProps) {
  const { addTodo, updateTodo, projects } = useTodos();
  const [isAddProjectDialogOpen, setAddProjectDialogOpen] = useState(false);
  const [isDateSelectorOpen, setDateSelectorOpen] = useState(false);

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
        // Reset only title and description for continuous adding
        form.reset({
            ...form.getValues(),
            title: "",
            description: "",
        });
        onAdded?.();
    }
  };
  
  const setDate = (date: Date | undefined) => {
    form.setValue('due_date', date, { shouldDirty: true });
    setDateSelectorOpen(false);
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
      <div className="flex flex-col lg:flex-row lg:items-start lg:gap-4">
        <Collapsible open={isDateSelectorOpen} onOpenChange={setDateSelectorOpen} className="flex-1">
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-1 space-y-3">
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
                
                <div className="flex flex-wrap items-center gap-1">
                    <CollapsibleTrigger asChild>
                    <Button variant="outline" size="sm" className={cn("text-sm", !form.watch('due_date') && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {form.watch('due_date') ? format(form.watch('due_date')!, 'MMM d') : "Due date"}
                    </Button>
                    </CollapsibleTrigger>
                
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                                <Flag className={cn("mr-2 h-4 w-4", priorityInfo.className)} />
                                {priorityValue}
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
                            <Button variant="outline" size="icon" className="h-9 w-9">
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
                    
                    <Button variant="ghost" size="sm" disabled className="ml-auto">
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
                    <Button type="submit" size="default" disabled={!form.formState.isDirty && isEditing}>
                        {isEditing ? "Save changes" : "Add task"}
                    </Button>
                </div>
                {form.formState.errors.title && <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>}
            </form>
             <CollapsibleContent className="w-full lg:hidden">
                <div className="p-2 border rounded-md mt-2">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Button variant="ghost" size="sm" className="flex-1" onClick={() => setDate(new Date())}>Today</Button>
                        <Button variant="ghost" size="sm" className="flex-1" onClick={() => setDate(addDays(new Date(), 1))}>Tomorrow</Button>
                        <Button variant="ghost" size="sm" className="flex-1" onClick={() => setDate(endOfWeek(new Date()))}>This weekend</Button>
                    </div>
                    <Calendar
                        mode="single"
                        selected={form.watch('due_date')}
                        onSelect={(date) => setDate(date)}
                        initialFocus
                        className="p-0 w-full"
                    />
                </div>
            </CollapsibleContent>
        </Collapsible>

        <div className="hidden lg:block w-full max-w-xs mt-2 lg:mt-0">
            {isDateSelectorOpen && (
                <div className="p-2 border rounded-md">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Button variant="ghost" size="sm" className="flex-1" onClick={() => setDate(new Date())}>Today</Button>
                        <Button variant="ghost" size="sm" className="flex-1" onClick={() => setDate(addDays(new Date(), 1))}>Tomorrow</Button>
                        <Button variant="ghost" size="sm" className="flex-1" onClick={() => setDate(endOfWeek(new Date()))}>This weekend</Button>
                    </div>
                    <Calendar
                        mode="single"
                        selected={form.watch('due_date')}
                        onSelect={(date) => setDate(date)}
                        initialFocus
                        className="p-0 w-full"
                    />
                </div>
            )}
        </div>
      </div>
    </>
  );
}
