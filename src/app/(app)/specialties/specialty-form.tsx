"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { Specialty } from "./page";
import React from "react"; // Add React import

const specialtyFormSchema = z.object({
  id: z.string().optional(), // ID is optional for creation, required for update
  name: z.string().min(3, "Specialty name must be at least 3 characters."),
  description: z.string().optional(),
});

type SpecialtyFormValues = z.infer<typeof specialtyFormSchema>;

interface SpecialtyFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  specialty?: Specialty | null;
  onSave: (specialty: SpecialtyFormValues) => void;
}

export function SpecialtyForm({ isOpen, onOpenChange, specialty, onSave }: SpecialtyFormProps) {
  const { toast } = useToast();
  const form = useForm<SpecialtyFormValues>({
    resolver: zodResolver(specialtyFormSchema),
    defaultValues: specialty || {
      name: "",
      description: "",
    },
  });

  const onSubmit = (data: SpecialtyFormValues) => {
    // Pass the data to the parent component for API interaction
    onSave(data);
    // The toast and form reset will now be handled by the parent component after successful API call
  };

  // Effect to reset form when dialog opens or when a new specialty is selected for editing
  React.useEffect(() => {
    if (isOpen) {
      if (specialty) {
        form.reset(specialty);
      } else {
        form.reset({ name: "", description: "" });
      }
    }
  }, [specialty, form, isOpen]); // Added 'form' and 'isOpen' to dependencies

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{specialty ? "Edit Specialty" : "Register Specialty"}</DialogTitle>
          <DialogDescription>
            {specialty ? "Update the specialty details." : "Fill in the form to register a new medical specialty."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Specialty Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Cardiology" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Brief description of the specialty..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Specialty</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}