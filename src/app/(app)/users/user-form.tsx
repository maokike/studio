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

// Esquema de validación para el formulario (usando Zod) - ¡TODAS LAS PROPIEDADES EN PASCALCASE!
const userFormSchema = z.object({
  Id: z.number().optional(), // Id es number y opcional para la edición
  Cedula: z.preprocess(
    (val) => {
      // Si el valor es una cadena vacía o solo espacios, devuélvelo como undefined para que optional lo maneje.
      // Si es un número o puede convertirse, hazlo.
      if (typeof val === 'string' && val.trim() === '') return undefined;
      const num = Number(val);
      return isNaN(num) ? undefined : num; // Si no es un número válido, también undefined
    },
    z.number().min(1, "Cédula debe ser un número válido.").optional() // Ahora Cedula puede ser un número o undefined
  ),
  Nombre: z.string().min(2, "Nombre debe tener al menos 2 caracteres."),
  Apellido: z.string().min(2, "Apellido debe tener al menos 2 caracteres."),
  Email: z.string().email("Dirección de correo electrónico inválida.").min(1, "El email es requerido."),
  // Simplificamos Contrasena. La validación condicional se mueve a superRefine.
  // min(6) se aplicará si se proporciona una cadena. optional() permite undefined.
  Contrasena: z.string().min(6, "La contraseña debe tener al menos 6 caracteres.").optional(),
  Rol: z.enum(["Paciente", "Medico", "Admin"], {
    required_error: "El rol es obligatorio.",
  }),
  EspecialidadId: z.preprocess(
    (val) => {
      // Preprocesa para convertir cadenas vacías a null, y otros valores a número.
      // Si el valor es una cadena vacía o solo espacios, se convierte a null.
      if (typeof val === 'string' && val.trim() === '') return null;
      // Intenta convertir a número. Si no es un número válido, deja null.
      const num = Number(val);
      return isNaN(num) ? null : num;
    },
    z.number().nullable().optional() // Ahora puede ser número, null o undefined
  ),
  Estatus: z.boolean().default(true),
})
.superRefine((data, ctx) => {
  // === Validación de Contrasena (Condicional para nuevos usuarios) ===
  // Si NO hay Id (es un nuevo usuario) y la contraseña no está definida o está vacía (solo espacios)
  if (data.Id === undefined && (data.Contrasena === undefined || data.Contrasena.trim() === '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "La contraseña es requerida para nuevos usuarios.",
      path: ["Contrasena"],
    });
  }

  // === Validación de EspecialidadId (Condicional para médicos) ===
  if (data.Rol === "Medico") {
    // Si el rol es 'Medico', EspecialidadId debe ser un número válido (no null, no undefined, no 0).
    // El preprocess ya asegura que si es string vacío, es null.
    // Aquí verificamos si es null o undefined, o 0 (si 0 es inválido para tu lógica).
    if (data.EspecialidadId === null || data.EspecialidadId === undefined || data.EspecialidadId === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Para el rol 'Médico', la Especialidad ID es obligatoria y debe ser un número válido (no 0).",
        path: ["EspecialidadId"],
      });
    }
  }

  // === Validación de Cédula (Si es necesaria una validación condicional más allá de .min(1)) ===
  // Por ejemplo, si debe ser requerido en todos los casos, pero en el preprocess permitiste undefined para cadena vacía.
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
    // Usamos 'user' para los valores iniciales. Si 'user' es null/undefined, se usarán los defaults de Zod o vacíos.
    defaultValues: {
        Id: user?.Id,
        Cedula: user?.Cedula,
        Nombre: user?.Nombre || "",
        Apellido: user?.Apellido || "",
        Email: user?.Email || "",
        Contrasena: "", // Siempre inicializa a cadena vacía para que el input sea controlado
        Rol: user?.Rol || "Paciente",
        EspecialidadId: user?.EspecialidadId,
        Estatus: user?.Estatus ?? true,
    },
  });

  // Este useEffect se encargará de resetear el formulario cuando se abra o el usuario cambie
  React.useEffect(() => {
    if (isOpen) { // Solo resetea si el diálogo se abre (o si el usuario cambia mientras está abierto)
      form.reset({
        Id: user?.Id,
        Cedula: user?.Cedula,
        Nombre: user?.Nombre || "",
        Apellido: user?.Apellido || "",
        Email: user?.Email || "",
        Contrasena: "", // Siempre limpia la contraseña al abrir o editar
        Rol: user?.Rol || "Paciente",
        EspecialidadId: user?.EspecialidadId,
        Estatus: user?.Estatus ?? true,
      });
    }
  }, [user, isOpen, form]); // Añadimos 'form' a las dependencias. 'form.reset' no es necesario si usas el objeto 'form'.

  const onSubmit = async (data: UserFormValues) => {
    let dataToSend: UserFormValues = { ...data };
  
    // Si es edición y la contraseña está vacía, no la envíes
    if (data.Id && (!data.Contrasena || data.Contrasena.trim() === "")) {
      delete dataToSend.Contrasena;
    }
  
    try {
      if (data.Id) {
        // EDITAR usuario (PUT)
        await fetch(`/api/Usuario/${data.Id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dataToSend),
        });
      } else {
        // CREAR usuario (POST)
        await fetch("/api/Usuario", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dataToSend),
        });
      }
      toast({ title: "Usuario guardado correctamente." });
      onOpenChange(false);
    } catch (error) {
      toast({ title: "Error al guardar usuario.", variant: "destructive" });
    }
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
                      onChange={(e) => {
                        const value = e.target.value;
                        // Convertir a número. Si está vacío, undefined.
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
                                        // Si la cadena está vacía, pasa null. De lo contrario, convierte a número.
                                        field.onChange(value === '' ? null : Number(value));
                                    }}
                                    // Si el valor es null, mostrar cadena vacía en el input
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