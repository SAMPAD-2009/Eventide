
"use client";

import { useState } from 'react';
import { useLabels } from '@/context/LabelContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Edit } from 'lucide-react';
import { LabelDialog } from './LabelDialog';
import type { Label } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';
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

export function LabelSettings() {
  const { labels, deleteLabel, isLoading } = useLabels();
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingLabel, setEditingLabel] = useState<Label | null>(null);

  const handleAddNew = () => {
    setEditingLabel(null);
    setDialogOpen(true);
  };

  const handleEdit = (label: Label) => {
    setEditingLabel(label);
    setDialogOpen(true);
  };
  
  const renderSkeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-4">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-5 w-24" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      ))}
    </div>
  );


  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Manage Labels</CardTitle>
            <CardDescription>
              Create, edit, or delete your custom labels for events and tasks.
            </CardDescription>
          </div>
          <Button onClick={handleAddNew} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add New
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? renderSkeleton() : (
          <div className="space-y-2">
            {labels.map((label) => (
              <div key={label.label_id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4 font-medium">
                  <span
                    className="h-5 w-5 rounded-full"
                    style={{ backgroundColor: label.color }}
                  />
                  {label.name}
                </div>
                <div className="flex items-center">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(label)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete &quot;{label.name}&quot;?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This label will be removed from all associated events and tasks. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteLabel(label.label_id)}
                          className="bg-red-600 text-destructive-foreground hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
             {labels.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                    <p>No custom labels yet.</p>
                    <p>Click &quot;Add New&quot; to create your first one!</p>
                </div>
            )}
          </div>
        )}
      </CardContent>
      <LabelDialog
        isOpen={isDialogOpen}
        onOpenChange={setDialogOpen}
        label={editingLabel}
      />
    </Card>
  );
}
