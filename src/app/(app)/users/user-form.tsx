// studio/src/app/users/user-form.tsx
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
  FormDescription, // <-- ¡CRÍTICO: AÑADIR ESTA IMPORTACIÓN!
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

// Esquema de validación para el formulario (usando Zod) - ¡TODAS LAS PROPIEDADES EN PASCALCASE!
const userFormSchema = z.object({
  Id: z.number().optional(), // Id es number y opcional para la edición
  Cedula: z.preprocess(
    (val) => {
      if (typeof val === 'string' && val.trim() === '') return undefined;
      return Number(val);
    },
    z.number().min(1, "Cédula debe ser un número válido.").or(z.literal(undefined))
  ),
  Nombre: z.string().min(2, "Nombre debe tener al menos 2 caracteres."),
  Apellido: z.string().min(2, "Apellido debe tener al menos 2 caracteres."),
  Email: z.string().email("Dirección de correo electrónico inválida."),
  Contrasena: z.string().optional().refine((val, ctx) => {
    if (!ctx.parent.Id && (!val || val.trim().length === 0)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "La contraseña es requerida para nuevos usuarios.",
            path: ["Contrasena"],
        });
        return false;
    }
    if (val && val.trim().length > 0 && val.trim().length < 6) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "La contraseña debe tener al menos 6 caracteres.",
            path: ["Contrasena"],
        });
        return false;
    }
    return true;
  }, { message: "Contraseña inválida" }),
  Rol: z.enum(["Paciente", "Medico", "Admin"], {
    required_error: "El rol es obligatorio.",
  }),
  EspecialidadId: z.preprocess(
    (val) => {
        if (typeof val === 'string' && val.trim() === '') return null;
        return Number(val);
    },
    z.number().nullable().optional().refine((val, ctx) => {
        const rol = (ctx.parent as UserFormValues).Rol;
        if (rol === "Medico" && (val === null || val === undefined || val === 0)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Para el rol 'Medico', la Especialidad ID es obligatoria y no puede ser 0 o vacía.",
                path: ["EspecialidadId"],
            });
            return false;
        }
        return true;
    }, { message: "Especialidad ID inválida para el rol Médico" })
  ),
  Estatus: z.boolean().default(true),
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
    if (user) {
      form.reset({
        Id: user.Id,
        Cedula: user.Cedula,
        Nombre: user.Nombre,
        Apellido: user.Apellido,
        Email: user.Email,
        Contrasena: "",
        Rol: user.Rol,
        EspecialidadId: user.EspecialidadId,
        Estatus: user.Estatus,
      });
    } else {
      form.reset({
        Id: undefined,
        Cedula: undefined,
        Nombre: "",
        Apellido: "",
        Email: "",
        Contrasena: "",
        Rol: "Paciente",
        EspecialidadId: undefined,
        Estatus: true,
      });
    }
  }, [user, isOpen, form.reset]);

  const onSubmit = async (data: UserFormValues) => {
    if (data.Rol === "Medico" && (data.EspecialidadId === null || data.EspecialidadId === undefined || data.EspecialidadId === 0)) {
        toast({
            variant: "destructive",
            title: "Error de validación",
            description: "Para el rol 'Medico', la Especialidad ID es obligatoria y no puede ser 0 o vacía.",
        });
        return;
    }

    if (data.Id && (!data.Contrasena || data.Contrasena.trim() === "")) {
        const { Contrasena, ...dataWithoutContrasena } = data;
        await onSave(dataWithoutContrasena);
    } else {
        await onSave(data);
    }

    onOpenChange(false);
  };


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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            {/* Campo de Cédula */}
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
                      onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                      value={field.value === undefined ? '' : field.value}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Campo de Nombre */}
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
            {/* Campo de Apellido */}
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
            {/* Campo de Email */}
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
            {/* Campo de Contraseña */}
            <FormField
                control={form.control}
                name="Contrasena"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Contraseña {user ? "(dejar vacío para no cambiar)" : ""}</FormLabel>
                        <FormControl>
                            <Input type="password" placeholder={user ? "••••••••" : "Introduce contraseña"} {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            {/* Campo de Rol */}
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
            {/* Campo de EspecialidadId (Solo para médicos) */}
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
            {/* Campo de Estatus */}
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