"use client";
import React from 'react';
import { useEffect, useState, useCallback } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";

const doctorFormSchema = z.object({
  Id: z.number().optional(),
  Cedula: z.number().min(1, "Cédula requerida"),
  Nombre: z.string().min(2, "Nombre muy corto"),
  Apellido: z.string().min(2, "Apellido muy corto"),
  Email: z.string().email("Email inválido"),
  Contrasena: z.string().min(6, "Mínimo 6 caracteres").or(z.literal('')).optional(),
  Rol: z.literal("Medico"),
  EspecialidadId: z.number().min(1, "Seleccione una especialidad"),
  Estatus: z.boolean(),
})
.superRefine((data, ctx) => {
  // Solo requerir contraseña para nuevos médicos
  if (!data.Id && (!data.Contrasena || data.Contrasena.trim() === '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "La contraseña es requerida para nuevos médicos",
      path: ["Contrasena"],
    });
  }
});

type DoctorFormValues = z.infer<typeof doctorFormSchema>;

interface DoctorFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  doctor?: Doctor | null;
  specialties: Specialty[];
  onSave: (doctor: DoctorFormValues) => Promise<void>;
  isLoading: boolean;
}

export function DoctorForm({
  isOpen,
  onOpenChange,
  doctor,
  specialties,
  onSave,
  isLoading,
}: DoctorFormProps) {
  const form = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorFormSchema),
    defaultValues: {
      Id: undefined,
      Cedula: undefined,
      Nombre: "",
      Apellido: "",
      Email: "",
      Contrasena: "",
      Rol: "Medico",
      EspecialidadId: undefined,
      Estatus: true,
    },
  });

  React.useEffect(() => {
    if (doctor) {
      form.reset({
        ...doctor,
        Contrasena: "",
      });
    } else {
      form.reset({
        Id: undefined,
        Cedula: undefined,
        Nombre: "",
        Apellido: "",
        Email: "",
        Contrasena: "",
        Rol: "Medico",
        EspecialidadId: undefined,
        Estatus: true,
      });
    }
  }, [doctor, isOpen, form]);

  const onSubmit = async (data: DoctorFormValues) => {
    await onSave(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {doctor ? "Editar Médico" : "Registrar Médico"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="Cedula"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cédula</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="Nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="Apellido"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Apellido</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="Email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="Contrasena"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Contraseña{doctor ? " (dejar vacío para no cambiar)" : ""}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={doctor ? "••••••••" : "••••••"}
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="EspecialidadId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Especialidad</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value?.toString()}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione una especialidad" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {specialties.map((spec) => (
                        <SelectItem
                          key={spec.Id}
                          value={spec.Id.toString()}
                        >
                          {spec.Nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="Estatus"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <FormLabel>Estatus</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      {field.value ? "Activo" : "Inactivo"}
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {doctor ? "Actualizar" : "Registrar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}