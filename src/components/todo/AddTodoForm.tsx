
"use client";

import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTodos } from "@/context/TodoContext";
import { useLabels } from "@/context/LabelContext";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { CalendarIcon, Flag, MoreHorizontal, Inbox, FolderPlus, Folder, Tag, PlusCircle, Sparkles, Loader2 } from "lucide-react";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { useState, useEffect, useMemo } from "react";
import { AddProjectDialog } from "./AddProjectDialog";
import { Card } from "../ui/card";
import { LabelDialog } from "../settings/LabelDialog";
import { summarize } from "@/ai/flows/summarize-flow";
import { useToast } from "@/hooks/use-toast";

const todoFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  due_date: z.date().optional(),
  priority: z.string().default('Casual'),
  project_id: z.string(),
  label_id: z.string().optional(),
  collab_id: z.string().optional().nullable(),
});

type TodoFormValues = z.infer<typeof todoFormSchema>;

interface AddTodoFormProps {
  projectId: string;
  existingTodo?: Todo;
  onCancel?: () => void;
  onAdded?: () => void;
  onUpdated?: () => void;
  collabId?: string | null;
}

export function AddTodoForm({ projectId, existingTodo, onCancel, onAdded, onUpdated, collabId = null }: AddTodoFormProps) {
  const { addTodo, updateTodo, projects: allProjects } = useTodos();
  const { labels, getLabelById } = useLabels();
  const [isAddProjectDialogOpen, setAddProjectDialogOpen] = useState(false);
  const [isDateDialogOpen, setDateDialogOpen] = useState(false);
  const [isLabelDialogOpen, setLabelDialogOpen] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const { toast } = useToast();

  const projects = useMemo(() => {
    return allProjects.filter(p => collabId ? p.collab_id === collabId : !p.collab_id)
  }, [allProjects, collabId]);

  const form = useForm<TodoFormValues>({
    resolver: zodResolver(todoFormSchema),
    defaultValues: {
      title: "",
      description: "",
      due_date: undefined,
      priority: 'Casual',
      project_id: projectId,
      label_id: undefined,
      collab_id: collabId,
    },
  });

  useEffect(() => {
    form.reset({
      title: existingTodo?.title || "",
      description: existingTodo?.description || "",
      due_date: existingTodo?.due_date ? new Date(existingTodo.due_date) : undefined,
      priority: existingTodo?.priority || 'Casual',
      project_id: existingTodo?.project_id || projectId,
      label_id: existingTodo?.label_id || undefined,
      collab_id: existingTodo?.collab_id || collabId,
    })
  }, [existingTodo, projectId, collabId, form]);
  
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
            label_id: form.getValues('label_id'),
            collab_id: form.getValues('collab_id'),
        });
        if(onAdded) {
           onAdded();
        } else {
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
  
  const currentLabelId = form.watch('label_id');
  const selectedLabel = currentLabelId ? getLabelById(currentLabelId) : null;

  const getProjectName = () => {
    if (currentProjectId === inboxProject?.project_id) return 'Inbox';
    return currentProject?.name;
  }
  
  const priorityValue = form.watch('priority') as Priority;
  const priorityInfo = getPriorityInfo(priorityValue);
  
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        form.handleSubmit(onSubmit)();
    }
  };

  const handleSummarize = async () => {
    const description = form.getValues('description');
    if (!description || description.trim().length < 20) {
      toast({
        variant: 'destructive',
        title: 'Not enough text',
        description: 'Please provide more details to generate a summary.',
      });
      return;
    }
    setIsSummarizing(true);
    try {
      const summary = await summarize(description);
      form.setValue('description', summary, { shouldDirty: true });
    } catch (e) {
      console.error(e);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to generate summary.' });
    } finally {
      setIsSummarizing(false);
    }
  };


  return (
    <>
      <AddProjectDialog isOpen={isAddProjectDialogOpen} onOpenChange={setAddProjectDialogOpen} collabId={collabId} />
      <LabelDialog isOpen={isLabelDialogOpen} onOpenChange={setLabelDialogOpen} label={null} />
       <Card className={cn(isEditing ? "" : "p-4 border border-border")}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <div className="space-y-1 px-2">
                <Input 
                    placeholder="Task name"
                    {...form.register("title")}
                    className="border-none text-base font-medium focus-visible:ring-0 p-0"
                    autoFocus
                    onKeyDown={handleKeyDown}
                />
                 <div className="relative">
                    <Input
                        placeholder="Description"
                        {...form.register("description")}
                        className="border-none text-sm text-muted-foreground focus-visible:ring-0 resize-none h-auto p-0 pr-10"
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-1/2 -translate-y-1/2 h-7 w-7"
                        onClick={handleSummarize}
                        disabled={isSummarizing}
                    >
                       {isSummarizing ? (
                         <Loader2 className="h-4 w-4 animate-spin" />
                       ) : (
                         <Sparkles className="h-4 w-4 text-yellow-500" />
                       )}
                    </Button>
                </div>
            </div>
            
            <div className="flex items-center gap-1 pt-2 flex-wrap">
                <Dialog open={isDateDialogOpen} onOpenChange={setDateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button type="button" variant="outline" size="sm" className={cn("text-sm h-8", !form.watch('due_date') && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {form.watch('due_date') ? format(form.watch('due_date')!, 'MMM d') : "Due date"}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="w-auto p-0">
                          <DialogHeader className="p-4 pb-0">
                            <DialogTitle className="sr-only">Set due date</DialogTitle>
                            <DialogDescription className="sr-only">Select a due date for your task.</DialogDescription>
                          </DialogHeader>
                        <div className="p-2 space-y-1">
                            <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => setDate(new Date())}><span className="mr-2">🗓️</span> Today</Button>
                            <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => setDate(addDays(new Date(), 1))}><span className="mr-2">🌅</span> Tomorrow</Button>
                            <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => setDate(endOfWeek(new Date()))}><span className="mr-2">🎉</span> This weekend</Button>
                        </div>
                        <Calendar
                            mode="single"
                            selected={form.watch('due_date')}
                            onSelect={(date) => setDate(date)}
                            initialFocus
                            className="border-t"
                        />
                    </DialogContent>
                </Dialog>
            
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8">
                            <Flag className={cn("mr-2 h-4 w-4", priorityInfo.className)} />
                            Priority
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

                <Popover>
                    <PopoverTrigger asChild>
                        <Button type="button" variant="outline" size="sm" className="h-8">
                            <Tag className="mr-2 h-4 w-4" />
                            {selectedLabel ? selectedLabel.name : "Label"}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-60 p-0">
                        <Command>
                            <CommandInput placeholder="Search labels..." />
                            <CommandList>
                                <CommandEmpty>No labels found.</CommandEmpty>
                                <CommandGroup>
                                    {labels.map(label => (
                                        <CommandItem
                                            key={label.label_id}
                                            onSelect={() => form.setValue('label_id', label.label_id)}
                                        >
                                            <div className="flex items-center">
                                                <span className="h-2 w-2 rounded-full mr-2" style={{ backgroundColor: label.color }} />
                                                {label.name}
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                                <CommandSeparator />
                                <CommandGroup>
                                    <CommandItem onSelect={() => setLabelDialogOpen(true)}>
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Create new label
                                    </CommandItem>
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>

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
