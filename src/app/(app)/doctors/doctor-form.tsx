// studio/src/app/doctors/doctor-form.tsx
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
import type { Doctor } from "./page"; // <--- Importa Doctor
import type { Specialty } from "./page"; // <--- Importa Specialty
import React from "react";
import { Switch } from "@/components/ui/switch";


// Esquema de validación para el formulario del Doctor (usando Zod)
const doctorFormSchema = z.object({
  Id: z.number().optional(), // Id es number y opcional para la edición
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
  Contrasena: z.string().min(6, "La contraseña debe tener al menos 6 caracteres.").optional(),
  Rol: z.literal("Medico"), // El rol es fijo como "Medico" para este formulario
  EspecialidadId: z.preprocess(
    (val) => {
      if (typeof val === 'string' && val.trim() === '') return null;
      const num = Number(val);
      return isNaN(num) ? null : num;
    },
    z.number().nullable().optional() // Puede ser número, null o undefined
  ),
  Estatus: z.boolean().default(true),
})
.superRefine((data, ctx) => {
  // Validación de Contraseña para nuevos médicos
  if (data.Id === undefined && (data.Contrasena === undefined || data.Contrasena.trim() === '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "La contraseña es requerida para nuevos médicos.",
      path: ["Contrasena"],
    });
  }

  // Validación de EspecialidadId para el rol "Medico"
  // Aunque el Rol ya es "Medico" en este esquema, es buena práctica para consistencia.
  if (data.EspecialidadId === null || data.EspecialidadId === undefined || data.EspecialidadId === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "La Especialidad ID es obligatoria y debe ser un número válido (no 0).",
      path: ["EspecialidadId"],
    });
  }

  // Validación de Cédula (si se hizo opcional en preprocess para permitir cadenas vacías)
  if (data.Cedula === undefined) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "La cédula es requerida.",
      path: ["Cedula"],
    });
  }
});

type DoctorFormValues = z.infer<typeof doctorFormSchema>;

interface DoctorFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  doctor?: Doctor | null; // Cambiado de 'user' a 'doctor'
  specialties: Specialty[]; // Lista de especialidades
  onSave: (doctor: DoctorFormValues) => Promise<void>; // Retorna una Promesa
  isLoading: boolean;
}

export function DoctorForm({ isOpen, onOpenChange, doctor, specialties, onSave, isLoading }: DoctorFormProps) {
  const { toast } = useToast();
  const form = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorFormSchema),
    defaultValues: {
      Id: doctor?.Id,
      Cedula: doctor?.Cedula,
      Nombre: doctor?.Nombre || "",
      Apellido: doctor?.Apellido || "",
      Email: doctor?.Email || "",
      Contrasena: "", // Siempre inicializa a cadena vacía
      Rol: "Medico", // Rol por defecto es "Medico"
      EspecialidadId: doctor?.EspecialidadId,
      Estatus: doctor?.Estatus ?? true,
    },
  });

  React.useEffect(() => {
    if (isOpen) { 
      form.reset({
        Id: doctor?.Id,
        Cedula: doctor?.Cedula,
        Nombre: doctor?.Nombre || "",
        Apellido: doctor?.Apellido || "",
        Email: doctor?.Email || "",
        Contrasena: "",
        Rol: "Medico", 
        EspecialidadId: doctor?.EspecialidadId,
        Estatus: doctor?.Estatus ?? true,
      });
    }
  }, [doctor, isOpen, form]);

  const onSubmit = async (data: DoctorFormValues) => {
    let dataToSend: DoctorFormValues = { ...data };
    dataToSend.Rol = "Medico"; // Asegurarse de que el rol es "Medico" al enviar

    if (data.Id && (!data.Contrasena || data.Contrasena.trim() === "")) {
      delete dataToSend.Contrasena;
    }
    
    // Aquí, la llamada a onSave ya es asíncrona y manejará la llamada a la API
    await onSave(dataToSend);
    // El onOpenChange y el toast se manejan en page.tsx después de que onSave se complete con éxito.
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{doctor ? "Editar Médico" : "Registrar Médico"}</DialogTitle>
          <DialogDescription>
            {doctor ? "Actualiza los detalles del médico." : "Completa el formulario para registrar un nuevo médico."}
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
                    <Input placeholder="Nombre del médico" {...field} disabled={isLoading} />
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
                    <Input placeholder="Apellido del médico" {...field} disabled={isLoading} />
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
                    <Input type="email" placeholder="medico@example.com" {...field} disabled={isLoading} />
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
                        <FormLabel>Contraseña {doctor ? "(dejar vacío para no cambiar)" : ""}</FormLabel>
                        <FormControl>
                            <Input type="password" placeholder={doctor ? "••••••••" : "Introduce contraseña"} {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            {/* Campo de Rol (no editable, siempre "Medico") */}
            <FormField
              control={form.control}
              name="Rol"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rol</FormLabel>
                  <FormControl>
                    <Input value="Médico" disabled /> {/* Muestra "Médico" pero está deshabilitado */}
                  </FormControl>
                  <FormDescription>El rol de médico no puede ser cambiado.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Campo de EspecialidadId */}
            <FormField
              control={form.control}
              name="EspecialidadId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Especialidad</FormLabel>
                  {/* Asegurarse de que el valor del Select sea un string para onChange,
                      pero internamente se mapeará a number/null para el formulario */}
                  <Select 
                    onValueChange={(value) => field.onChange(value === "" ? null : Number(value))} 
                    value={field.value === null || field.value === undefined ? "" : String(field.value)}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una especialidad" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {specialties.map((spec) => (
                        <SelectItem key={spec.Id} value={String(spec.Id)}>
                          {spec.Nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    La especialidad del médico es obligatoria.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Campo de Estatus */}
            <FormField
                control={form.control}
                name="Estatus"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <FormLabel className="text-base">Estatus Activo</FormLabel>
                            <FormDescription>
                                Define si el médico está activo en el sistema.
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
                {isLoading ? "Guardando..." : "Guardar Médico"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
