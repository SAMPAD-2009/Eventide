
"use client";

import { useState, useMemo } from 'react';
import { useTodos } from '@/context/TodoContext';
import { TodoSidebar } from '@/components/todo/TodoSidebar';
import { TaskList } from '@/components/todo/TaskList';
import { AddTodoForm } from '@/components/todo/AddTodoForm';
import { isToday, isFuture, parseISO } from 'date-fns';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function TodoPage() {
  const { projects, todos, isLoading } = useTodos();
  const [selectedSection, setSelectedSection] = useState('inbox'); // 'inbox', 'today', 'upcoming', or a project_id
  const [showAddForm, setShowAddForm] = useState(false);

  const filteredTodos = useMemo(() => {
    if (isLoading) return [];
    if (selectedSection === 'inbox') {
      const inboxProject = projects.find(p => p.name === 'Inbox');
      return todos.filter(t => t.project_id === inboxProject?.project_id && !t.completed);
    }
    if (selectedSection === 'today') {
      return todos.filter(t => t.due_date && isToday(parseISO(t.due_date)) && !t.completed);
    }
    if (selectedSection === 'upcoming') {
      return todos.filter(t => t.due_date && isFuture(parseISO(t.due_date)) && !t.completed);
    }
    // It's a project
    return todos.filter(t => t.project_id === selectedSection && !t.completed);
  }, [selectedSection, todos, projects, isLoading]);

  const completedTodos = useMemo(() => {
      if (['inbox', 'today', 'upcoming'].includes(selectedSection)) {
        return []; // Don't show completed in smart lists for now
      }
      return todos.filter(t => t.project_id === selectedSection && t.completed);
  }, [selectedSection, todos]);

  const currentProject = projects.find(p => p.project_id === selectedSection);
  const sectionTitle = 
      selectedSection === 'inbox' ? 'Inbox' :
      selectedSection === 'today' ? 'Today' :
      selectedSection === 'upcoming' ? 'Upcoming' :
      currentProject?.name || 'Tasks';

  const projectIdForNewTask = useMemo(() => {
    // If we are not in a specific project view, new tasks go to the Inbox.
    if (['inbox', 'today', 'upcoming'].includes(selectedSection)) return "inbox";
    // Otherwise, we're in a project, so use its ID.
    return selectedSection;
  }, [selectedSection]);


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
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-6">{sectionTitle}</h1>
        <div className="max-w-3xl mx-auto">
            <TaskList todos={filteredTodos} />
            
            { showAddForm ? (
                <AddTodoForm 
                  projectId={projectIdForNewTask} 
                  onCancel={() => setShowAddForm(false)} 
                  onAdded={() => setShowAddForm(false)}
                />
            ) : (
                <Button variant="ghost" className="w-full justify-start mt-2" onClick={() => setShowAddForm(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add task
                </Button>
            )}

            {completedTodos.length > 0 && (
                <div className="mt-12">
                    <h2 className="text-lg font-semibold mb-4">Completed</h2>
                    <TaskList todos={completedTodos} />
                </div>
            )}
        </div>
      </main>
    </div>
  );
}
