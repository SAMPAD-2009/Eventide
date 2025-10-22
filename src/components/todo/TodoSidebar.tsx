
"use client";

import { useTodos } from "@/context/TodoContext";
import { cn } from "@/lib/utils";
import { Folder, Inbox, Calendar, ChevronRight, Plus, Trash2, LayoutGrid } from "lucide-react";
import { Button } from "../ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState, useMemo } from "react";
import { AddProjectDialog } from "./AddProjectDialog";
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
} from "@/components/ui/alert-dialog"
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface TodoSidebarProps {
  selectedSection: string;
  onSelectSection: (section: string) => void;
  collabId?: string | null;
}

export function TodoSidebar({ selectedSection, onSelectSection, collabId = null }: TodoSidebarProps) {
  const { projects: allProjects, deleteProject } = useTodos();
  const [isProjectsOpen, setProjectsOpen] = useState(true);
  const [isAddProjectDialogOpen, setAddProjectDialogOpen] = useState(false);
  const pathname = usePathname();

  const projects = useMemo(() => {
    return allProjects.filter(p => collabId ? p.collab_id === collabId : !p.collab_id)
  }, [allProjects, collabId]);

  const mainSections = [
    { id: "inbox", name: "Inbox", icon: Inbox },
    { id: "today", name: "Today", icon: Calendar },
  ];

  return (
    <>
      <aside className="w-64 flex-shrink-0 border-r bg-background/50 p-4 hidden md:block">
        <nav className="space-y-2">
          {!collabId && mainSections.map((section) => (
            <Button
              key={section.id}
              variant={selectedSection === section.id && pathname === '/todo' ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => onSelectSection(section.id)}
            >
              <section.icon className="mr-2 h-4 w-4" />
              {section.name}
            </Button>
          ))}
           {!collabId && (
            <Button asChild variant={pathname === '/todo-calendar' ? 'secondary' : 'ghost'} className="w-full justify-start">
              <Link href="/todo-calendar">
                  <LayoutGrid className="mr-2 h-4 w-4" />
                  Upcoming
              </Link>
            </Button>
           )}
          <Collapsible open={isProjectsOpen} onOpenChange={setProjectsOpen}>
            <div className="flex items-center justify-between">
              <CollapsibleTrigger asChild>
                 <Button variant="ghost" size="sm" className="w-full justify-start px-2">
                    <ChevronRight className={cn("mr-2 h-4 w-4 transition-transform", isProjectsOpen && "rotate-90")} />
                    <span className="font-semibold">Projects</span>
                 </Button>
              </CollapsibleTrigger>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setAddProjectDialogOpen(true)}>
                  <Plus className="h-4 w-4"/>
              </Button>
            </div>
            <CollapsibleContent className="space-y-1 pl-4 mt-1">
                {projects.filter(p => collabId ? true : p.name !== 'Inbox').map(project => (
                    <div key={project.project_id} className="flex items-center group">
                        <Button
                            variant={selectedSection === project.project_id ? "secondary" : "ghost"}
                            className="w-full justify-start flex-1"
                            onClick={() => onSelectSection(project.project_id)}
                        >
                            <Folder className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span className="truncate">{project.name}</span>
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100">
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
            </CollapsibleContent>
          </Collapsible>
        </nav>
      </aside>
      <AddProjectDialog isOpen={isAddProjectDialogOpen} onOpenChange={setAddProjectDialogOpen} collabId={collabId} />
    </>
  );
}
