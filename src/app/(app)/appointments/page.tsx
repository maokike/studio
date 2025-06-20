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

export interface Appointment {
  id: int;
  PacienteId: int;
  MedicoId: int;
  EspecialidadId: int;
  Fecha: DateTime;
  Hora: TimeSpan;
  Estado: "Pendiente" | "Confirmada" | "Cancelada" | "Terminada";
}

const API_BASE_URL = "https://localhost:44314/api";

export default function AppointmentManagementPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Pick<User, "id" | "name">[]>([]);
  const [doctors, setDoctors] = useState<
    Pick<Doctor, "id" | "name" | "specialtyName">[]
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
      setPatients(data);
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
      setDoctors(data);
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
      setSpecialties(data);
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
        title: "Success",
        description: `Appointment ${id ? "updated" : "created"} successfully`,
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

      toast({ title: "Appointment Cancelled" });
      fetchAppointments();
    } catch (error) {
      console.error("Cancellation error:", error);
      toast({
        title: "Error",
        description: "Failed to cancel appointment",
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
        // Asegúrate de que los IDs sean números
        const pacienteIdNum = Number(apt.PacienteId ?? apt.pacienteId);
        const medicoIdNum = Number(apt.MedicoId ?? apt.medicoId);
        const especialidadIdNum = Number(apt.EspecialidadId ?? apt.especialidadId);
  
        const patient = patients.find((p) => Number(p.id) === pacienteIdNum);
        const doctor = doctors.find((d) => Number(d.id) === medicoIdNum);
        const specialty = specialties.find((s) => Number(s.id) === especialidadIdNum);
  
        return {
          ...apt,
          pacienteName: patient?.name || "Unknown",
          medicoName: doctor?.name || "Unknown",
          especialidadName: specialty?.name || "Unknown",
        };
      })
      .filter((apt) => {
        const doctorMatch =
          filterDoctor === "all" ||
          Number(apt.MedicoId ?? apt.medicoId) === Number(filterDoctor);
        const statusMatch =
          filterStatus === "all" || apt.Estado === filterStatus;
        const dateMatch = filterDate === "" || String(apt.Fecha).startsWith(filterDate);
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
    toast({
      title: "Export Started",
      description: "Generating appointment data for export...",
    });
    console.log("Exporting appointments:", filteredAppointments);
  };

  return (
    <>
      <PageHeader
        title="Appointment Management"
        description="View, schedule, and manage all appointments."
      >
        <Button onClick={handleCreateAppointment}>
          <PlusCircle className="mr-2 h-4 w-4" /> Create Appointment
        </Button>
      </PageHeader>

      <div className="mb-6 p-4 border rounded-lg bg-card shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <label
              htmlFor="filter-doctor"
              className="block text-sm font-medium text-muted-foreground mb-1"
            >
              Filter by Doctor
            </label>
            <Select value={filterDoctor} onValueChange={setFilterDoctor}>
              <SelectTrigger id="filter-doctor">
                <SelectValue placeholder="All Doctors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Doctors</SelectItem>
                {doctors.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
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
              Filter by Status
            </label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger id="filter-status">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
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
              Filter by Date
            </label>
            <Input
              id="filter-date"
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>
          <Button onClick={handleExport} variant="outline">
            <Download className="mr-2 h-4 w-4" /> Export Data
          </Button>
        </div>
      </div>

      <div className="rounded-lg border shadow-sm overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Doctor</TableHead>
              <TableHead>Specialty</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
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
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => handleEditAppointment(apt)}
                          disabled={
                            apt.Estado === "Terminada" ||
                            apt.Estado === "Cancelada"
                          }
                        >
                          <Edit className="mr-2 h-4 w-4" /> Modify
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleCancelAppointment(apt)}
                          disabled={
                            apt.Estado === "Terminada" ||
                            apt.Estado === "Cancelada"
                          }
                          className="text-destructive focus:text-destructive focus:bg-destructive/10"
                        >
                          <XCircle className="mr-2 h-4 w-4" /> Cancel
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
                  No appointments found with the current filters.
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
              Are you sure you want to cancel this appointment?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action will mark the appointment for{" "}
              {appointmentToCancel?.pacienteName} with{" "}
              {appointmentToCancel?.medicoName} on{" "}
              {appointmentToCancel
                ? new Date(appointmentToCancel.Fecha).toLocaleDateString()
                : ""}{" "}
              as cancelled.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Appointment</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancelAppointment}
              className="bg-destructive hover:bg-destructive/90"
            >
              Confirm Cancellation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
