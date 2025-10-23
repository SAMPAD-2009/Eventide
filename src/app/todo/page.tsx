
"use client";

import { useState, useMemo, lazy, Suspense } from 'react';
import { useTodos } from '@/context/TodoContext';
import { TodoSidebar } from '@/components/todo/TodoSidebar';
import { TaskList } from '@/components/todo/TaskList';
import { isToday } from 'date-fns';
import { parseISO } from 'date-fns/fp';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TodoBottomNav } from '@/components/todo/TodoBottomNav';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const AddTodoForm = lazy(() => import('@/components/todo/AddTodoForm').then(module => ({ default: module.AddTodoForm })));


function AddTodoFormSkeleton() {
    return (
        <div className="p-4 border rounded-lg space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex items-center gap-2 pt-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-20" />
            </div>
        </div>
    )
}

export default function TodoPage() {
  const { projects, todos, isLoading } = useTodos();
  const [selectedSection, setSelectedSection] = useState('inbox'); // 'inbox', 'today', or a project_id
  const [isCreateFormOpen, setCreateFormOpen] = useState(false);
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);

  const personalProjects = useMemo(() => projects.filter(p => !p.collab_id), [projects]);

  const filteredTodos = useMemo(() => {
    if (isLoading) return [];
    if (selectedSection === 'inbox') {
      const inboxProject = projects.find(p => p.name === 'Inbox');
      return todos.filter(t => t.project_id === inboxProject?.project_id && !t.completed);
    }
    if (selectedSection === 'today') {
      return todos.filter(t => t.due_date && isToday(parseISO(t.due_date)) && !t.completed);
    }
    // It's a project
    return todos.filter(t => t.project_id === selectedSection && !t.completed);
  }, [selectedSection, todos, projects, isLoading]);

  const completedTodos = useMemo(() => {
      const inboxProject = projects.find(p => p.name === 'Inbox');
      if (selectedSection === 'inbox') {
        return todos.filter(t => t.project_id === inboxProject?.project_id && t.completed);
      }
      if (['today'].includes(selectedSection)) {
        return []; // Don't show completed in smart lists for now
      }
      // It's a project (and not inbox)
      if(inboxProject?.project_id !== selectedSection) {
        return todos.filter(t => t.project_id === selectedSection && t.completed);
      }
      return [];

  }, [selectedSection, todos, projects]);

  const currentProject = projects.find(p => p.project_id === selectedSection);
  const sectionTitle = 
      selectedSection === 'inbox' ? 'Inbox' :
      selectedSection === 'today' ? 'Today' :
      currentProject?.name || 'Tasks';

  const projectIdForNewTask = useMemo(() => {
    const inboxProject = personalProjects.find(p => p.name === 'Inbox');
    if (['today'].includes(selectedSection)) {
        return inboxProject?.project_id || 'Inbox'; 
    }
    if (selectedSection === 'inbox') {
        return inboxProject?.project_id || 'Inbox';
    }
    return selectedSection;
  }, [selectedSection, personalProjects]);
  

  const handleSetEditing = (todoId: string | null) => {
    setEditingTodoId(todoId);
  }

  if (isLoading && projects.length === 0) {
    return (
        <div className="flex h-[calc(100vh-4rem)]">
            <Skeleton className="w-64 hidden md:block border-r" />
            <div className="flex-1 p-8">
                <Skeleton className="h-10 w-48 mb-6" />
                <div className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <TodoSidebar selectedSection={selectedSection} onSelectSection={setSelectedSection} />
      <main className="flex-1 p-4 md:p-8 overflow-y-auto pb-24 md:pb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-6">{sectionTitle}</h1>
        <div className="max-w-3xl mx-auto">
            <Collapsible open={isCreateFormOpen} onOpenChange={setCreateFormOpen} className="mb-4">
                {!isCreateFormOpen && (
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" className="w-full justify-start mt-2 group">
                            <Plus className="mr-2 h-4 w-4 text-primary group-hover:bg-primary/20 rounded-full p-0.5" /> 
                            Add task
                        </Button>
                    </CollapsibleTrigger>
                )}
                <CollapsibleContent>
                    <div className="mt-2">
                        <Suspense fallback={<AddTodoFormSkeleton />}>
                            <AddTodoForm
                                projectId={projectIdForNewTask}
                                onCancel={() => setCreateFormOpen(false)}
                                onAdded={() => { /* setCreateFormOpen(false) maybe? */ }}
                            />
                        </Suspense>
                    </div>
                </CollapsibleContent>
            </Collapsible>

            <TaskList
                todos={filteredTodos}
                editingTodoId={editingTodoId}
                onSetEditing={handleSetEditing}
                isReadOnly={true}
            />

            {completedTodos.length > 0 && (
                <div className="mt-12">
                    <h2 className="text-lg font-semibold mb-4">Completed</h2>
                    <TaskList 
                        todos={completedTodos}
                        editingTodoId={editingTodoId}
                        onSetEditing={handleSetEditing}
                        isReadOnly={true}
                    />
                </div>
            )}
        </div>
      </main>
      <TodoBottomNav selectedSection={selectedSection} onSelectSection={setSelectedSection} />
    </div>
  );
}
