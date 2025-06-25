"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar } from "@/components/ui/calendar";
import { format, addHours } from "date-fns";
import { es } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

const API_BASE_URL = "https://localhost:44314/api";

const formSchema = z.object({
  id: z.number().optional(),
  PacienteId: z.number().min(1, "Paciente es requerido"),
  MedicoId: z.number().min(1, "Médico es requerido"),
  EspecialidadId: z.number().optional(),
  Fecha: z.date({
    required_error: "Fecha es requerida",
  }),
  Hora: z.string().min(1, "Hora es requerida"),
  Estado: z.enum(["Pendiente", "Confirmada", "Cancelada", "Terminada"]),
});

export function AppointmentForm({
  isOpen,
  onOpenChange,
  appointment,
  patients,
  doctors,
  specialties,
  onSave,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: any;
  patients: any[];
  doctors: any[];
  specialties: any[];
  onSave: (data: any) => void;
}) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [occupiedSlots, setOccupiedSlots] = useState<string[]>([]);
  const [availableHours, setAvailableHours] = useState<string[]>([]);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: appointment || {
      PacienteId: 0,
      MedicoId: 0,
      EspecialidadId: 0,
      Fecha: new Date(),
      Hora: "",
      Estado: "Pendiente",
    },
  });

  // Resetear formulario cuando cambia la cita o se abre/cierra
  useEffect(() => {
    if (isOpen) {
      form.reset(appointment || {
        PacienteId: 0,
        MedicoId: 0,
        EspecialidadId: 0,
        Fecha: new Date(),
        Hora: "",
        Estado: "Pendiente",
      });
    }
  }, [isOpen, appointment, form]);

  // Obtener especialidad del médico seleccionado
  const selectedDoctor = doctors.find(
    d => d.id === form.watch("MedicoId")
  );
  
  const selectedSpecialty = specialties.find(
    s => s.id === String(selectedDoctor?.specialtyId)
  )?.name || "Desconocida";

  // Generar horas disponibles
  const generateAvailableHours = () => {
    const hours = [];
    for (let h = 8; h <= 17; h++) {
      for (let m = 0; m < 60; m += 30) {
        const hour = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        hours.push(hour);
      }
    }
    return hours.filter(hour => !occupiedSlots.includes(hour));
  };

  // Cargar horarios ocupados cuando cambia el médico o la fecha
  useEffect(() => {
    const medicoId = form.watch("MedicoId");
    const fecha = form.watch("Fecha");
    
    if (medicoId && fecha) {
      const fetchOccupiedSlots = async () => {
        try {
          const fechaStr = format(fecha, "yyyy-MM-dd");
          const response = await fetch(
            `${API_BASE_URL}/Cita/Medico/${medicoId}?fecha=${fechaStr}`
          );
          
          if (!response.ok) throw new Error("Error al cargar disponibilidad");
          
          const citas = await response.json();
          const slots = citas
            .filter((c: any) => c.Estado !== "Cancelada")
            .map((c: any) => c.Hora.substring(0, 5));
          
          setOccupiedSlots(slots);
        } catch (error) {
          console.error("Error cargando horarios ocupados:", error);
          toast({
            title: "Error",
            description: "No se pudo verificar disponibilidad",
            variant: "destructive",
          });
        }
      };
      
      fetchOccupiedSlots();
    }
  }, [form.watch("MedicoId"), form.watch("Fecha"), toast]);

  // Actualizar horas disponibles
  useEffect(() => {
    setAvailableHours(generateAvailableHours());
  }, [occupiedSlots]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    
    try {
      // Asegurar que la especialidad se tome del médico
      const finalData = {
        ...data,
        EspecialidadId: selectedDoctor?.specialtyId || 0
      };

      await onSave(finalData);
      onOpenChange(false);
    } catch (error) {
      console.error("Error guardando cita:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar la cita",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {appointment ? "Editar Cita Médica" : "Nueva Cita Médica"}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Campo Paciente */}
            <FormField
              control={form.control}
              name="PacienteId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Paciente</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value?.toString()}
                    disabled={!!appointment} // Solo lectura en modo edición
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar paciente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem
                          key={patient.id}
                          value={patient.id.toString()}
                        >
                          {patient.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo Médico */}
            <FormField
              control={form.control}
              name="MedicoId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Médico</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(Number(value));
                      // Resetear hora al cambiar médico
                      form.setValue("Hora", "");
                    }}
                    value={field.value?.toString()}
                    disabled={!!appointment} // Solo lectura en modo edición
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar médico" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {doctors.map((doctor) => (
                        <SelectItem
                          key={doctor.id}
                          value={doctor.id.toString()}
                        >
                          {doctor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo Especialidad (solo lectura) */}
            <FormItem>
              <FormLabel>Especialidad</FormLabel>
              <Input
                value={selectedSpecialty}
                readOnly
              />
            </FormItem>

            {/* Campo Fecha */}
            <FormField
              control={form.control}
              name="Fecha"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Fecha</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: es })
                          ) : (
                            <span>Seleccionar fecha</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        locale={es}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo Hora */}
            <FormField
              control={form.control}
              name="Hora"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hora</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!form.watch("MedicoId") || !form.watch("Fecha")}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar hora" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableHours.length > 0 ? (
                        availableHours.map((hour) => (
                          <SelectItem key={hour} value={hour}>
                            {hour}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="" disabled>
                          No hay horas disponibles
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo Estado (solo en edición) */}
            {appointment && (
              <FormField
                control={form.control}
                name="Estado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={
                        appointment?.Estado === "Terminada" || 
                        appointment?.Estado === "Cancelada"
                      }
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Pendiente">Pendiente</SelectItem>
                        <SelectItem value="Confirmada">Confirmada</SelectItem>
                        <SelectItem 
                          value="Terminada"
                          disabled={appointment?.Estado !== "Terminada"}
                        >
                          Terminada
                        </SelectItem>
                        <SelectItem 
                          value="Cancelada"
                          disabled={appointment?.Estado !== "Cancelada"}
                        >
                          Cancelada
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Guardando..." : "Guardar Cita"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}