
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { Label } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from './AuthContext';

type LabelCreationData = Omit<Label, 'label_id' | 'user_email' | 'created_at'>;

interface LabelContextType {
  labels: Label[];
  addLabel: (labelData: LabelCreationData) => Promise<Label | undefined>;
  updateLabel: (labelId: string, labelData: Partial<LabelCreationData>) => Promise<void>;
  deleteLabel: (labelId: string) => Promise<void>;
  getLabelById: (labelId: string) => Label | undefined;
  isLoading: boolean;
}

const LabelContext = createContext<LabelContextType | undefined>(undefined);

export const LabelProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [labels, setLabels] = useState<Label[]>([]);

  const fetchLabels = useCallback(async (userEmail: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/labels?user_email=${encodeURIComponent(userEmail)}`);
      if (!response.ok) throw new Error('Failed to fetch labels');
      const data = await response.json();
      setLabels(data);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Could not fetch your labels: ${error.message}`,
      });
      setLabels([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (user?.email) {
      fetchLabels(user.email);
    } else {
      setLabels([]);
      setIsLoading(false);
    }
  }, [user, fetchLabels]);

  const addLabel = async (labelData: LabelCreationData) => {
    if (!user?.email) return;

    try {
      const response = await fetch('/api/labels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...labelData, user_email: user.email }),
      });
      if (!response.ok) throw new Error('Failed to create label');
      const newLabel = await response.json();
      setLabels(prev => [...prev, newLabel]);
      toast({ title: "Label Created", description: `'${newLabel.name}' has been added.` });
      return newLabel;
    } catch (e: any) {
      toast({ variant: 'destructive', title: "Error", description: e.message });
    }
  };

  const updateLabel = async (labelId: string, labelData: Partial<LabelCreationData>) => {
    const originalLabels = [...labels];
    setLabels(prev => prev.map(l => l.label_id === labelId ? { ...l, ...labelData } as Label : l));

    try {
      const response = await fetch(`/api/labels/${labelId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(labelData),
      });
      if (!response.ok) throw new Error('Failed to update label');
      toast({ title: "Label Updated" });
    } catch (e: any) {
      setLabels(originalLabels);
      toast({ variant: 'destructive', title: "Error", description: e.message });
    }
  };

  const deleteLabel = async (labelId: string) => {
    const originalLabels = [...labels];
    setLabels(prev => prev.filter(l => l.label_id !== labelId));

    try {
      const response = await fetch(`/api/labels/${labelId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete label');
      toast({ title: "Label Deleted" });
    } catch (e: any) {
      setLabels(originalLabels);
      toast({ variant: 'destructive', title: "Error", description: e.message });
    }
  };
  
  const getLabelById = (labelId: string) => {
    return labels.find(l => l.label_id === labelId);
  }

  const contextValue = {
    labels,
    addLabel,
    updateLabel,
    deleteLabel,
    getLabelById,
    isLoading,
  };

  return <LabelContext.Provider value={contextValue}>{children}</LabelContext.Provider>;
};

export const useLabels = () => {
  const context = useContext(LabelContext);
  if (context === undefined) {
    throw new Error('useLabels must be used within a LabelProvider');
  }
  return context;
};
