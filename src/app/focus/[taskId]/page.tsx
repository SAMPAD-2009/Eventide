
'use client';

import { useTodos } from '@/context/TodoContext';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, CheckCircle, Circle, Flag, Plus, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getPriorityInfo } from '@/lib/priorities';
import { cn } from '@/lib/utils';
import type { Todo, Subtask, MemberRole, CollaborationMember } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabase/client';

function SubtaskList({ todo, onUpdate, canEdit }: { todo: Todo; onUpdate: (subtasks: Subtask[]) => void; canEdit: boolean }) {
  const [newSubtaskName, setNewSubtaskName] = useState('');
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [editingSubtaskName, setEditingSubtaskName] = useState('');

  const subtasks = todo.subtasks || [];

  const handleAddSubtask = () => {
    if (!canEdit || !newSubtaskName.trim()) return;
    const newSubtask: Subtask = {
      id: crypto.randomUUID(),
      name: newSubtaskName.trim(),
      completed: false,
    };
    onUpdate([...subtasks, newSubtask]);
    setNewSubtaskName('');
  };

  const handleDeleteSubtask = (id: string) => {
    if (!canEdit) return;
    onUpdate(subtasks.filter(st => st.id !== id));
  };
  
  const handleToggleSubtask = (id: string) => {
    if (!canEdit) return;
    onUpdate(subtasks.map(st => st.id === id ? { ...st, completed: !st.completed } : st));
  };

  const handleStartEditing = (subtask: Subtask) => {
    if (!canEdit) return;
    setEditingSubtaskId(subtask.id);
    setEditingSubtaskName(subtask.name);
  };

  const handleSaveEdit = (id: string) => {
    if (editingSubtaskName.trim()) {
      onUpdate(subtasks.map(st => st.id === id ? { ...st, name: editingSubtaskName.trim() } : st));
    }
    setEditingSubtaskId(null);
    setEditingSubtaskName('');
  };

  return (
    <Card className="bg-black/20 backdrop-blur-sm border-white/20 mt-8">
      <CardContent className="p-4 md:p-6 text-left">
        <h3 className="font-semibold mb-4 text-white">Sub-tasks</h3>
        <div className="space-y-3">
          <AnimatePresence>
          {subtasks.map(subtask => (
            <motion.div 
              key={subtask.id}
              layout
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
              className="flex items-center gap-3"
            >
              <Checkbox
                id={`subtask-${subtask.id}`}
                checked={subtask.completed}
                onCheckedChange={() => handleToggleSubtask(subtask.id)}
                className="border-white/50 data-[state=checked]:bg-white data-[state=checked]:text-black"
                disabled={!canEdit}
              />
              {editingSubtaskId === subtask.id ? (
                 <Input 
                    value={editingSubtaskName}
                    onChange={(e) => setEditingSubtaskName(e.target.value)}
                    onBlur={() => handleSaveEdit(subtask.id)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(subtask.id)}
                    autoFocus
                    className="flex-1 bg-transparent border-b border-white/50 focus-visible:ring-0 rounded-none"
                    disabled={!canEdit}
                 />
              ) : (
                <label
                  htmlFor={`subtask-${subtask.id}`}
                  className={cn("flex-1", canEdit ? 'cursor-pointer' : 'cursor-default', subtask.completed && "line-through text-white/50")}
                  onDoubleClick={() => handleStartEditing(subtask)}
                >
                  {subtask.name}
                </label>
              )}
              {canEdit && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleStartEditing(subtask)}
                    className="h-7 w-7 text-white/50 hover:text-blue-400 hover:bg-blue-400/10"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteSubtask(subtask.id)}
                    className="h-7 w-7 text-white/50 hover:text-red-400 hover:bg-red-400/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </motion.div>
          ))}
          </AnimatePresence>
        </div>
        {canEdit && (
          <div className="flex items-center gap-2 mt-4">
            <Input
              placeholder="Add new sub-task..."
              value={newSubtaskName}
              onChange={(e) => setNewSubtaskName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
              className="bg-transparent border-b border-white/50 focus-visible:ring-0 rounded-none placeholder:text-white/40"
            />
            <Button variant="ghost" size="icon" onClick={handleAddSubtask}>
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


export default function FocusPage() {
  const { taskId } = useParams();
  const { user } = useAuth();
  const { getTodoById, updateTodo, isLoading: isTodosLoading } = useTodos();
  const router = useRouter();
  const supabase = createClient();
  const [todo, setTodo] = useState<Todo | null>(null);
  const [canEdit, setCanEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTodoAndPermissions = async () => {
      if (!isTodosLoading && taskId) {
        const foundTodo = getTodoById(taskId as string);
        setTodo(foundTodo);
        
        if (foundTodo?.collab_id && user?.email) {
            const { data: memberData, error } = await supabase
                .from('collaboration_members')
                .select('role')
                .eq('collab_id', foundTodo.collab_id)
                .eq('user_email', user.email)
                .single();
            
            if (error) {
                console.error("Error fetching member role:", error);
                setCanEdit(false);
            } else {
                setCanEdit(memberData?.role === 'editor' || memberData?.role === 'owner');
            }

        } else if (!foundTodo?.collab_id) {
            // It's a personal todo
            setCanEdit(true);
        } else {
            setCanEdit(false);
        }
        
        setIsLoading(false);
      }
    };
    
    fetchTodoAndPermissions();
  }, [taskId, getTodoById, isTodosLoading, user?.email, supabase]);

  const handleToggleComplete = () => {
    if (todo && canEdit) {
      const newCompletedStatus = !todo.completed;
      updateTodo(todo.todo_id, { completed: newCompletedStatus });
      setTodo({ ...todo, completed: newCompletedStatus });
    }
  };

  const handleSubtaskUpdate = (subtasks: Subtask[]) => {
      if (todo && canEdit) {
          updateTodo(todo.todo_id, { subtasks });
      }
  }

  if (isLoading || isTodosLoading) {
    return <FocusPageSkeleton />;
  }

  if (!todo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-8">
        <h2 className="text-2xl font-semibold mb-4">Task Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The task you're looking for doesn't exist or has been deleted.
        </p>
        <Button onClick={() => router.push('/todo')}>
          <ArrowLeft className="mr-2" />
          Back to Tasks
        </Button>
      </div>
    );
  }

  const priorityInfo = getPriorityInfo(todo.priority);

  return (
    <div 
      className="min-h-screen flex flex-col justify-between p-4 md:p-8 transition-colors bg-cover bg-center text-white"
      style={{ backgroundImage: "url(/focusbg.jpg)" }}
    >
      <div className="absolute inset-0 bg-black/60 -z-10"></div>
      
      <header className="w-full">
        <Button variant="ghost" onClick={() => router.back()} className="text-white hover:text-white hover:bg-white/10" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
          <ArrowLeft className="mr-2" />
          Back
        </Button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="max-w-2xl w-full">
          <div className="flex items-center justify-center gap-2 mb-4" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
             <Flag className={cn("h-5 w-5", priorityInfo.className)} />
             <span className={cn("font-semibold", priorityInfo.className)}>
                {todo.priority}
             </span>
          </div>
          <h1
            className={cn(
              'text-3xl md:text-5xl font-bold break-words transition-all',
              todo.completed && 'line-through text-white/50'
            )}
            style={{ textShadow: '0 2px 6px rgba(0,0,0,0.7)' }}
          >
            {todo.title}
          </h1>
          {todo.description && (
            <p className="mt-4 text-lg md:text-xl text-white/80" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>
              {todo.description}
            </p>
          )}

          <SubtaskList todo={todo} onUpdate={handleSubtaskUpdate} canEdit={canEdit} />
        </div>
      </main>

      <footer className="w-full flex justify-center pt-8">
        <Button
          onClick={handleToggleComplete}
          variant="outline"
          size="lg"
          className={cn(
            "bg-black/20 backdrop-blur-sm transition-all hover:scale-105 border-white/20 hover:bg-white/10 text-white",
            todo.completed && "border-green-400/50 bg-green-500/20 text-green-300"
          )}
          disabled={!canEdit}
        >
          {todo.completed ? (
            <>
              <CheckCircle className="mr-2 text-green-400" />
              Mark as Incomplete
            </>
          ) : (
            <>
              <Circle className="mr-2" />
              Mark as Complete
            </>
          )}
        </Button>
      </footer>
    </div>
  );
}

function FocusPageSkeleton() {
    return (
         <div className="min-h-screen flex flex-col justify-between p-4 md:p-8">
            <header className="w-full">
                 <Skeleton className="h-10 w-24" />
            </header>
            <main className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="max-w-2xl w-full space-y-4">
                    <Skeleton className="h-6 w-32 mx-auto" />
                    <Skeleton className="h-12 w-3/4 mx-auto" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-5/6" />
                </div>
            </main>
             <footer className="w-full flex justify-center">
                <Skeleton className="h-12 w-48" />
             </footer>
        </div>
    )
}
