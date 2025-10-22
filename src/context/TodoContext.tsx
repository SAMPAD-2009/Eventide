
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { Todo, Project } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from './AuthContext';

type TodoCreationData = Omit<Todo, 'todo_id' | 'user_email' | 'created_at' | 'completed' | 'completed_at'>;
type ProjectCreationData = Omit<Project, 'project_id' | 'user_email' | 'created_at'>;


interface TodoContextType {
  projects: Project[];
  todos: Todo[];
  getTodoById: (todoId: string) => Todo | undefined;
  addProject: (projectData: ProjectCreationData) => Promise<Project | void>;
  deleteProject: (projectId: string) => Promise<void>;
  addTodo: (todoData: TodoCreationData) => Promise<void>;
  updateTodo: (todoId: string, todoData: Partial<Omit<Todo, 'todo_id' | 'user_email' | 'created_at'>>) => Promise<void>;
  deleteTodo: (todoId: string) => Promise<void>;
  isLoading: boolean;
}

const TodoContext = createContext<TodoContextType | undefined>(undefined);

export const TodoProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  
  const addProject = useCallback(async (projectData: ProjectCreationData): Promise<Project | void> => {
    if (!user?.email) return;

    try {
        const response = await fetch('/api/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...projectData, user_email: user.email }),
        });
        if (!response.ok) throw new Error('Failed to create project');
        const newProject = await response.json();
        setProjects(prev => [...prev, newProject]);
        if (projectData.name !== 'Inbox' && projectData.name !== 'Collabed') {
          toast({ title: "Project Created", description: `'${newProject.name}' has been added.` });
        }
        return newProject;
    } catch (e: any) {
        toast({ variant: 'destructive', title: "Error", description: e.message });
    }
  }, [user?.email, toast]);

  const fetchData = useCallback(async (userEmail: string) => {
    setIsLoading(true);
    try {
        const projectsRes = await fetch(`/api/projects?user_email=${encodeURIComponent(userEmail)}`);
        if (!projectsRes.ok) throw new Error('Failed to fetch projects');
        let projectsData = await projectsRes.json();
        
        const inboxExists = projectsData.some((p: Project) => p.name === 'Inbox' && !p.collab_id);
        if (!inboxExists) {
            const newInbox = await addProject({ name: 'Inbox' });
            if (newInbox) {
                projectsData.push(newInbox);
            }
        }
        
        setProjects(projectsData);

        const todosRes = await fetch(`/api/todos?user_email=${encodeURIComponent(userEmail)}`);
        if (!todosRes.ok) throw new Error('Failed to fetch todos');
        const todosData = await todosRes.json();
        setTodos(todosData);

    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Error",
            description: `Could not fetch your projects and tasks: ${error.message}`,
        });
        setProjects([]);
        setTodos([]);
    } finally {
        setIsLoading(false);
    }
  }, [toast, addProject]);


  useEffect(() => {
    if (user?.email) {
        fetchData(user.email);
    } else {
      setProjects([]);
      setTodos([]);
      setIsLoading(false);
    }
  }, [user, fetchData]);

  
  const getTodoById = useCallback((todoId: string) => {
    return todos.find(t => t.todo_id === todoId);
  }, [todos]);

  const deleteProject = async (projectId: string) => {
    const originalProjects = [...projects];
    const originalTodos = [...todos];

    setProjects(prev => prev.filter(p => p.project_id !== projectId));
    setTodos(prev => prev.filter(t => t.project_id !== projectId));

    try {
        const response = await fetch(`/api/projects/${projectId}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete project');
        toast({ title: "Project Deleted" });
    } catch (e: any) {
        setProjects(originalProjects);
        setTodos(originalTodos);
        toast({ variant: 'destructive', title: "Error", description: e.message });
    }
  };

  const addTodo = async (todoData: TodoCreationData) => {
    if (!user?.email) return;

    let finalProjectId = todoData.project_id;
    let finalProjectName = todoData.project_id; // Can be name or ID initially

    if (todoData.collab_id) {
        let collabProject = projects.find(p => p.collab_id === todoData.collab_id && p.name === 'Collabed');
        if (!collabProject) {
            const newCollabProject = await addProject({ name: 'Collabed', collab_id: todoData.collab_id });
            if (newCollabProject) {
                collabProject = newCollabProject;
            }
        }
        finalProjectId = collabProject?.project_id;
    } else if (!finalProjectId || finalProjectId === 'Inbox') {
        finalProjectId = projects.find(p => p.name === 'Inbox' && !p.collab_id)?.project_id;
    } else {
        const projectExistsById = projects.some(p => p.project_id === finalProjectId);
        if (!projectExistsById) {
          const projectExistsByName = projects.find(p => p.name.toLowerCase() === (finalProjectName || '').toLowerCase() && p.collab_id === todoData.collab_id);
          if (projectExistsByName) {
            finalProjectId = projectExistsByName.project_id;
          } else {
            const newProject = await addProject({ name: finalProjectName!, collab_id: todoData.collab_id });
            if (newProject) {
                finalProjectId = newProject.project_id;
            } else {
                toast({ variant: 'destructive', title: "Error", description: `Could not find or create project '${finalProjectName}'.` });
                return;
            }
          }
        }
    }

    try {
        const response = await fetch('/api/todos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...todoData, project_id: finalProjectId, user_email: user.email }),
        });
        if (!response.ok) throw new Error('Failed to create task');
        const newTodo = await response.json();
        setTodos(prev => [newTodo, ...prev]);
    } catch (e: any) {
        toast({ variant: 'destructive', title: "Error", description: e.message });
    }
  };

  const updateTodo = async (todoId: string, todoData: Partial<Omit<Todo, 'todo_id' | 'user_email' | 'created_at'>>) => {
    
    const originalTodos = [...todos];
    
    setTodos(prev => prev.map(t => t.todo_id === todoId ? { ...t, ...todoData } : t));

    try {
        const payload: Partial<Todo & { completed_at?: string | null }> = { ...todoData };
        if (payload.completed === true) {
            payload.completed_at = new Date().toISOString();
        } else if (payload.completed === false) {
            payload.completed_at = null;
        }

        const response = await fetch(`/api/todos/${todoId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error('Failed to update task');

        const updatedTodo = await response.json();

        setTodos(prev => prev.map(t => t.todo_id === todoId ? updatedTodo : t));

    } catch (e: any) {
        setTodos(originalTodos);
        toast({ variant: 'destructive', title: "Error", description: e.message });
    }
  };

  const deleteTodo = async (todoId: string) => {
    const originalTodos = [...todos];
    setTodos(prev => prev.filter(t => t.todo_id !== todoId));
    try {
        const response = await fetch(`/api/todos/${todoId}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete task');
    } catch (e: any) {
        setTodos(originalTodos);
        toast({ variant: 'destructive', title: "Error", description: e.message });
    }
  };

  const contextValue = {
    projects,
    todos,
    getTodoById,
    addProject,
    deleteProject,
    addTodo,
    updateTodo,
    deleteTodo,
    isLoading,
  };

  return <TodoContext.Provider value={contextValue}>{children}</TodoContext.Provider>;
};

export const useTodos = () => {
  const context = useContext(TodoContext);
  if (context === undefined) {
    throw new Error('useTodos must be used within a TodoProvider');
  }
  return context;
};
