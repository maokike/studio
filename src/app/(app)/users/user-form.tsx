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
  FormDescription,
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
import { useToast } from "@/hooks/use-toast";
import type { User } from "./page";
import React from "react";
import { Switch } from "@/components/ui/switch";

const userFormSchema = z.object({
  Id: z.number().optional(),
  Cedula: z.preprocess(
    (val) => {
      if (typeof val === 'string' && val.trim() === '') return undefined;
      const num = Number(val);
      return isNaN(num) ? undefined : num;
    },
    z.number().min(1, "Cédula debe ser un número válido.").optional()
  ),
  Nombre: z.string().min(2, "Nombre debe tener al menos 2 caracteres."),
  Apellido: z.string().min(2, "Apellido debe tener al menos 2 caracteres."),
  Email: z.string().email("Dirección de correo electrónico inválida.").min(1, "El email es requerido."),
  // Modificación clave: Validación condicional para contraseña
  Contrasena: z.union([
    z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
    z.literal('')
  ]).optional().transform(val => val === '' ? undefined : val),
  Rol: z.enum(["Paciente", "Medico", "Admin"], {
    required_error: "El rol es obligatorio.",
  }),
  EspecialidadId: z.preprocess(
    (val) => {
      if (typeof val === 'string' && val.trim() === '') return null;
      const num = Number(val);
      return isNaN(num) ? null : num;
    },
    z.number().nullable().optional()
  ),
  Estatus: z.boolean().default(true),
})
.superRefine((data, ctx) => {
  // Validación de contraseña solo para nuevos usuarios
  if (data.Id === undefined && (data.Contrasena === undefined || data.Contrasena.trim() === '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "La contraseña es requerida para nuevos usuarios.",
      path: ["Contrasena"],
    });
  }

  if (data.Rol === "Medico") {
    if (data.EspecialidadId === null || data.EspecialidadId === undefined || data.EspecialidadId === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Para el rol 'Médico', la Especialidad ID es obligatoria y debe ser un número válido (no 0).",
        path: ["EspecialidadId"],
      });
    }
  }

  if (data.Cedula === undefined) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "La cédula es requerida.",
      path: ["Cedula"],
    });
  }
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  user?: User | null;
  onSave: (user: UserFormValues) => Promise<void>;
  isLoading: boolean;
}

export function UserForm({ isOpen, onOpenChange, user, onSave, isLoading }: UserFormProps) {
  const { toast } = useToast();
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
        Id: user?.Id,
        Cedula: user?.Cedula,
        Nombre: user?.Nombre || "",
        Apellido: user?.Apellido || "",
        Email: user?.Email || "",
        Contrasena: "",
        Rol: user?.Rol || "Paciente",
        EspecialidadId: user?.EspecialidadId,
        Estatus: user?.Estatus ?? true,
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      form.reset({
        Id: user?.Id,
        Cedula: user?.Cedula,
        Nombre: user?.Nombre || "",
        Apellido: user?.Apellido || "",
        Email: user?.Email || "",
        Contrasena: "",
        Rol: user?.Rol || "Paciente",
        EspecialidadId: user?.EspecialidadId,
        Estatus: user?.Estatus ?? true,
      });
    }
  }, [user, isOpen, form]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{user ? "Editar Usuario" : "Crear Usuario"}</DialogTitle>
          <DialogDescription>
            {user ? "Actualiza los detalles del usuario." : "Completa el formulario para crear un nuevo usuario."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSave)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="Cedula"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cédula</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Ej: 123456789"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value === '' ? undefined : Number(value));
                      }}
                      value={field.value === undefined ? '' : field.value}
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
                    <Input placeholder="Tu nombre" {...field} disabled={isLoading} />
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
                    <Input placeholder="Tu apellido" {...field} disabled={isLoading} />
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
                    <Input type="email" placeholder="john.doe@example.com" {...field} disabled={isLoading} />
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
                          Contraseña {user ? "(opcional)" : "*"}
                        </FormLabel>
                        <FormControl>
                            <Input 
                                type="password" 
                                placeholder={user ? "Dejar vacío para no cambiar" : "Mínimo 6 caracteres"} 
                                {...field} 
                                disabled={isLoading} 
                            />
                        </FormControl>
                        <FormDescription>
                            {user 
                              ? "Deje vacío para mantener la contraseña actual" 
                              : "Requerida para nuevos usuarios"}
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
              control={form.control}
              name="Rol"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rol</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un rol" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Paciente">Paciente</SelectItem>
                      <SelectItem value="Medico">Médico</SelectItem>
                      <SelectItem value="Admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {form.watch("Rol") === "Medico" && (
                <FormField
                    control={form.control}
                    name="EspecialidadId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>ID Especialidad</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="ID de especialidad"
                                    type="number"
                                    {...field}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        field.onChange(value === '' ? null : Number(value));
                                    }}
                                    value={field.value === null ? "" : field.value}
                                    disabled={isLoading}
                                />
                            </FormControl>
                            <FormDescription>
                                Requerido para el rol de Médico.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            )}
            <FormField
                control={form.control}
                name="Estatus"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <FormLabel className="text-base">Estatus Activo</FormLabel>
                            <FormDescription>
                                Define si el usuario está activo en el sistema.
                            </FormDescription>
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
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Guardando..." : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}