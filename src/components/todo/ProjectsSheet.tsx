
"use client";

import { useTodos } from "@/context/TodoContext";
import { Folder, Plus, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { AddProjectDialog } from "./AddProjectDialog";
import { ScrollArea } from "../ui/scroll-area";


interface ProjectsSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedSection: string;
  onSelectSection: (section: string) => void;
}

export function ProjectsSheet({ isOpen, onOpenChange, selectedSection, onSelectSection }: ProjectsSheetProps) {
  const { projects, deleteProject } = useTodos();
  const [isAddProjectDialogOpen, setAddProjectDialogOpen] = useState(false);

  const handleSelectProject = (projectId: string) => {
    onSelectSection(projectId);
    onOpenChange(false);
  }

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="w-[80vw]">
          <SheetHeader>
            <SheetTitle>Projects</SheetTitle>
            <SheetDescription>Select a project to view its tasks.</SheetDescription>
          </SheetHeader>
          <div className="py-4">
            <Button
                variant="outline"
                className="w-full justify-start mb-4"
                onClick={() => { onOpenChange(false); setAddProjectDialogOpen(true); }}
            >
                <Plus className="mr-2 h-4 w-4" />
                Add project
            </Button>
            <ScrollArea className="h-[calc(100vh-12rem)]">
                <div className="space-y-1">
                    {projects.filter(p => p.name !== 'Inbox').map(project => (
                        <div key={project.project_id} className="flex items-center group -ml-2">
                            <Button
                                variant={selectedSection === project.project_id ? "secondary" : "ghost"}
                                className="w-full justify-start flex-1"
                                onClick={() => handleSelectProject(project.project_id)}
                            >
                                <Folder className="mr-2 h-4 w-4 text-muted-foreground" />
                                <span className="truncate">{project.name}</span>
                            </Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-9 w-9 opacity-0 group-hover:opacity-100">
                                        <Trash2 className="h-4 w-4 text-destructive/70" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Delete &quot;{project.name}&quot;?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will permanently delete the project and all its tasks. This action cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() => deleteProject(project.project_id)}
                                            className="bg-red-600 text-destructive-foreground hover:bg-red-700"
                                        >
                                            Delete
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    ))}
                </div>
            </ScrollArea>
          </div>
        </SheetContent>
      </Sheet>
      <AddProjectDialog isOpen={isAddProjectDialogOpen} onOpenChange={setAddProjectDialogOpen} />
    </>
  );
}
