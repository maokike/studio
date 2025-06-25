"use client";

import { useState, useEffect, useMemo } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  MoreHorizontal,
  PlusCircle,
  Edit,
  XCircle,
  Download,
} from "lucide-react";
import { AppointmentForm } from "./appointment-form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { User } from "../users/page";
import type { Doctors } from "../doctors/page";
import { format } from "date-fns";
import jsPDF from "jspdf";
import "jspdf-autotable";

export interface Appointment {
  id: number;
  PacienteId: number;
  MedicoId: number;
  EspecialidadId: number;
  Fecha: string;
  Hora: string;
  Estado: "Pendiente" | "Confirmada" | "Cancelada" | "Terminada";
  pacienteName?: string;
  medicoName?: string;
  especialidadName?: string;
}

const API_BASE_URL = "https://localhost:44314/api";

export default function AppointmentManagementPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Pick<User, "id" | "name">[]>([]);
  const [doctors, setDoctors] = useState<
    Pick<Doctors, "id" | "name"> & { specialtyId: number }[]
  >([]);
  const [specialties, setSpecialties] = useState<
    { id: string; name: string }[]
  >([]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] =
    useState<Appointment | null>(null);

  const [filterDoctor, setFilterDoctor] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDate, setFilterDate] = useState<string>("");

  const { toast } = useToast();

  const fetchAppointments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/Cita`);
      if (!response.ok) throw new Error("Failed to fetch appointments");
      const data: Appointment[] = await response.json();
      setAppointments(data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast({
        title: "Error",
        description: "Failed to load appointments",
        variant: "destructive",
      });
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/Usuario`);
      if (!response.ok) throw new Error("Failed to fetch patients");
      const data = await response.json();
      const pacientes = data
        .filter((u: any) => u.Rol === "Paciente")
        .map((u: any) => ({
          id: u.Id,
          name: `${u.Nombre} ${u.Apellido}`,
        }));
      setPatients(pacientes);
    } catch (error) {
      console.error("Error fetching patients:", error);
      toast({
        title: "Error",
        description: "Failed to load patients",
        variant: "destructive",
      });
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/Medico`);
      if (!response.ok) throw new Error("Failed to fetch doctors");
      const data = await response.json();
      
      const medicos = data.map((u: any) => ({
        id: u.Id,
        name: `${u.Nombre} ${u.Apellido}`,
        specialtyId: u.EspecialidadId,
      }));
      
      setDoctors(medicos);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      toast({
        title: "Error",
        description: "Failed to load doctors",
        variant: "destructive",
      });
    }
  };

  const fetchSpecialties = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/Especialidad`);
      if (!response.ok) throw new Error("Failed to fetch specialties");
      const data = await response.json();
      const specialties = data.map((s: any) => ({
        id: String(s.Id),
        name: s.Nombre,
      }));
      setSpecialties(specialties);
    } catch (error) {
      console.error("Error fetching specialties:", error);
      toast({
        title: "Error",
        description: "Failed to load specialties",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchPatients();
    fetchDoctors();
    fetchSpecialties();
  }, []);

  const getStatusBadgeVariant = (status: Appointment["Estado"]) => {
    switch (status) {
      case "Pendiente":
        return "default";
      case "Confirmada":
        return "secondary";
      case "Terminada":
        return "outline";
      case "Cancelada":
        return "destructive";
      default:
        return "outline";
    }
  };

  const handleSaveAppointment = async (appointmentData: any) => {
    try {
      const payload = {
        ...appointmentData,
        Fecha: format(appointmentData.Fecha, "yyyy-MM-dd") + "T00:00:00",
        Hora: appointmentData.Hora + ":00",
      };

      const { id, ...createPayload } = payload;

      let response;
      if (id) {
        response = await fetch(`${API_BASE_URL}/Cita/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch(`${API_BASE_URL}/Cita`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(createPayload),
        });
      }

      if (!response.ok) throw new Error(response.statusText);

      toast({
        title: "Éxito",
        description: `Cita ${id ? "actualizada" : "creada"} correctamente`,
      });

      fetchAppointments();
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error saving appointment:", error);
      toast({
        title: "Error",
        description: `Failed to save: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        variant: "destructive",
      });
    }
  };

  const confirmCancelAppointment = async () => {
    if (!appointmentToCancel) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/Cita/${appointmentToCancel.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...appointmentToCancel,
            Estado: "Cancelada",
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to cancel appointment");

      toast({ title: "Cita cancelada" });
      fetchAppointments();
    } catch (error) {
      console.error("Cancellation error:", error);
      toast({
        title: "Error",
        description: "No se pudo cancelar la cita",
        variant: "destructive",
      });
    } finally {
      setIsCancelDialogOpen(false);
      setAppointmentToCancel(null);
    }
  };

  const filteredAppointments = useMemo(() => {
    return appointments
      .map((apt) => {
        const pacienteId = apt.PacienteId || apt.pacienteId;
        const medicoId = apt.MedicoId || apt.medicoId;
        
        const patient = patients.find(p => p.id === pacienteId);
        const doctor = doctors.find(d => d.id === medicoId);
        const specialty = doctor 
          ? specialties.find(s => s.id === String(doctor.specialtyId))
          : null;

        return {
          ...apt,
          pacienteName: patient?.name || "Desconocido",
          medicoName: doctor?.name || "Desconocido",
          especialidadName: specialty?.name || "Desconocida",
        };
      })
      .filter((apt) => {
        const doctorMatch =
          filterDoctor === "all" || 
          (apt.MedicoId || apt.medicoId) === Number(filterDoctor);
          
        const statusMatch =
          filterStatus === "all" || 
          apt.Estado === filterStatus;
          
        const dateMatch = 
          filterDate === "" || 
          new Date(apt.Fecha).toISOString().split('T')[0] === filterDate;
          
        return doctorMatch && statusMatch && dateMatch;
      });
  }, [appointments, patients, doctors, specialties, filterDoctor, filterStatus, filterDate]);

  const handleCreateAppointment = () => {
    setSelectedAppointment(null);
    setIsFormOpen(true);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsFormOpen(true);
  };

  const handleCancelAppointment = (appointment: Appointment) => {
    setAppointmentToCancel(appointment);
    setIsCancelDialogOpen(true);
  };

  const handleExport = () => {
    if (filteredAppointments.length === 0) {
      toast({
        title: "Sin datos",
        description: "No hay citas para exportar",
        variant: "destructive",
      });
      return;
    }

    try {
      const doc = new jsPDF();
      
      // Título
      doc.setFontSize(18);
      doc.text("Reporte de Citas Médicas", 14, 16);
      
      // Información de filtros
      doc.setFontSize(10);
      doc.text(`Médico: ${filterDoctor === "all" ? "Todos" : doctors.find(d => d.id === Number(filterDoctor))?.name || filterDoctor}`, 14, 24);
      doc.text(`Estado: ${filterStatus === "all" ? "Todos" : filterStatus}`, 14, 30);
      doc.text(`Fecha: ${filterDate || "Todas"}`, 14, 36);
      
      // Datos de la tabla
      const headers = [["Paciente", "Médico", "Especialidad", "Fecha", "Hora", "Estado"]];
      const data = filteredAppointments.map(apt => [
        apt.pacienteName || "Desconocido",
        apt.medicoName || "Desconocido",
        apt.especialidadName || "Desconocida",
        new Date(apt.Fecha).toLocaleDateString(),
        apt.Hora.substring(0, 5),
        apt.Estado
      ]);
      
      // Generar tabla
      (doc as any).autoTable({
        head: headers,
        body: data,
        startY: 40,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [41, 128, 185] },
        theme: "grid"
      });
      
      // Guardar PDF
      const fechaReporte = new Date().toISOString().slice(0, 10);
      doc.save(`citas_medicas_${fechaReporte}.pdf`);
      
      toast({
        title: "Exportación exitosa",
        description: "Las citas se exportaron a PDF correctamente",
      });
    } catch (error) {
      console.error("Error en exportación:", error);
      toast({
        title: "Error en exportación",
        description: "Falló la generación del PDF",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <PageHeader
        title="Gestión de Citas"
        description="Ver, programar y gestionar todas las citas médicas."
      >
        <Button onClick={handleCreateAppointment}>
          <PlusCircle className="mr-2 h-4 w-4" /> Crear Cita
        </Button>
      </PageHeader>

      <div className="mb-6 p-4 border rounded-lg bg-card shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <label
              htmlFor="filter-doctor"
              className="block text-sm font-medium text-muted-foreground mb-1"
            >
              Filtrar por Médico
            </label>
            <Select value={filterDoctor} onValueChange={setFilterDoctor}>
              <SelectTrigger id="filter-doctor">
                <SelectValue placeholder="Todos los médicos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los médicos</SelectItem>
                {doctors.map((d) => (
                  <SelectItem key={d.id} value={String(d.id)}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label
              htmlFor="filter-status"
              className="block text-sm font-medium text-muted-foreground mb-1"
            >
              Filtrar por Estado
            </label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger id="filter-status">
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="Pendiente">Pendiente</SelectItem>
                <SelectItem value="Confirmada">Confirmada</SelectItem>
                <SelectItem value="Terminada">Terminada</SelectItem>
                <SelectItem value="Cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label
              htmlFor="filter-date"
              className="block text-sm font-medium text-muted-foreground mb-1"
            >
              Filtrar por Fecha
            </label>
            <Input
              id="filter-date"
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>
          <Button onClick={handleExport} variant="outline">
            <Download className="mr-2 h-4 w-4" /> Exportar a PDF
          </Button>
        </div>
      </div>

      <div className="rounded-lg border shadow-sm overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Paciente</TableHead>
              <TableHead>Médico</TableHead>
              <TableHead>Especialidad</TableHead>
              <TableHead>Fecha & Hora</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((apt) => (
                <TableRow key={apt.id}>
                  <TableCell>{apt.pacienteName}</TableCell>
                  <TableCell>{apt.medicoName}</TableCell>
                  <TableCell>{apt.especialidadName}</TableCell>
                  <TableCell>
                    {new Date(apt.Fecha).toLocaleDateString()} -{" "}
                    {apt.Hora.substring(0, 5)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(apt.Estado)}>
                      {apt.Estado}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menú</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => handleEditAppointment(apt)}
                          disabled={
                            apt.Estado === "Terminada" ||
                            apt.Estado === "Cancelada"
                          }
                        >
                          <Edit className="mr-2 h-4 w-4" /> Modificar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleCancelAppointment(apt)}
                          disabled={
                            apt.Estado === "Terminada" ||
                            apt.Estado === "Cancelada"
                          }
                          className="text-destructive focus:text-destructive focus:bg-destructive/10"
                        >
                          <XCircle className="mr-2 h-4 w-4" /> Cancelar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground py-8"
                >
                  No se encontraron citas con los filtros actuales.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AppointmentForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        appointment={selectedAppointment}
        patients={patients}
        doctors={doctors}
        specialties={specialties}
        onSave={handleSaveAppointment}
      />

      <AlertDialog
        open={isCancelDialogOpen}
        onOpenChange={setIsCancelDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Estás seguro de cancelar esta cita?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción marcará la cita de{" "}
              {appointmentToCancel?.pacienteName} con{" "}
              {appointmentToCancel?.medicoName} el{" "}
              {appointmentToCancel
                ? new Date(appointmentToCancel.Fecha).toLocaleDateString()
                : ""}{" "}
              como cancelada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Mantener cita</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancelAppointment}
              className="bg-destructive hover:bg-destructive/90"
            >
              Confirmar cancelación
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}