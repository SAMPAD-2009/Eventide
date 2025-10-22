
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from 'zod';
import { useLabels } from "@/context/LabelContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { Label } from "@/lib/types";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

const labelSchema = z.object({
  name: z.string().min(1, "Label name is required"),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color"),
});

type LabelFormValues = z.infer<typeof labelSchema>;

interface LabelDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  label: Label | null;
}

export function LabelDialog({ isOpen, onOpenChange, label }: LabelDialogProps) {
  const { addLabel, updateLabel, isLoading } = useLabels();
  
  const form = useForm<LabelFormValues>({
    resolver: zodResolver(labelSchema),
    defaultValues: { name: "", color: "#808080" },
  });

  useEffect(() => {
    if (label) {
      form.reset({ name: label.name, color: label.color });
    } else {
      form.reset({ name: "", color: "#808080" });
    }
  }, [label, form]);


  const onSubmit = async (values: LabelFormValues) => {
    if (label) {
      await updateLabel(label.label_id, values);
    } else {
      await addLabel(values);
    }
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{label ? 'Edit Label' : 'Add New Label'}</DialogTitle>
          <DialogDescription>
            {label ? 'Update the name and color of your label.' : 'Create a new label with a custom name and color.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Label name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., Urgent Project" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                        <Input type="color" {...field} className="p-1 h-10 w-14" />
                        <Input {...field} placeholder="#RRGGBB" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {label ? 'Save Changes' : 'Add Label'}
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
