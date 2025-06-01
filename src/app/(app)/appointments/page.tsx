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
import { MoreHorizontal, PlusCircle, Edit, XCircle, Download, Filter } from "lucide-react";
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
import type { Doctor } from "../doctors/page";

export interface Appointment {
  id: string;
  patientId: string;
  patientName?: string; // Denormalized
  doctorId: string;
  doctorName?: string; // Denormalized
  date: string; // ISO Date string
  time: string; // HH:MM
  status: "scheduled" | "completed" | "cancelled";
  notes?: string;
  createdAt: string;
}

// MOCK DATA - In a real app, these would be fetched
const MOCK_PATIENTS: Pick<User, 'id' | 'name'>[] = [
  { id: "usr_3", name: "Charlie Chaplin" }, { id: "usr_5", name: "Edward Scissorhands" }, { id: "usr_6", name: "Fiona Gallagher" }
];
const MOCK_DOCTORS: Pick<Doctor, 'id' | 'name' | 'specialtyName'>[] = [
  { id: "doc_1", name: "Dr. Emily Carter", specialtyName: "Cardiology" }, { id: "doc_2", name: "Dr. Benjamin Lee", specialtyName: "Pediatrics" }
];

const MOCK_APPOINTMENTS_RAW: Omit<Appointment, 'patientName' | 'doctorName' | 'createdAt'>[] = [
  { id: "apt_1", patientId: "usr_3", doctorId: "doc_1", date: new Date(Date.now() + 2 * 24*60*60*1000).toISOString().split('T')[0], time: "10:00", status: "scheduled", notes: "Regular checkup" },
  { id: "apt_2", patientId: "usr_5", doctorId: "doc_2", date: new Date(Date.now() + 5 * 24*60*60*1000).toISOString().split('T')[0], time: "14:30", status: "scheduled" },
  { id: "apt_3", patientId: "usr_6", doctorId: "doc_1", date: new Date(Date.now() - 3 * 24*60*60*1000).toISOString().split('T')[0], time: "09:15", status: "completed", notes: "Follow-up successful." },
  { id: "apt_4", patientId: "usr_3", doctorId: "doc_2", date: new Date(Date.now() - 7 * 24*60*60*1000).toISOString().split('T')[0], time: "11:00", status: "cancelled", notes: "Patient rescheduled." },
];

const getInitialAppointments = (): Appointment[] => {
  return MOCK_APPOINTMENTS_RAW.map((apt, index) => ({
    ...apt,
    patientName: MOCK_PATIENTS.find(p => p.id === apt.patientId)?.name || "Unknown Patient",
    doctorName: MOCK_DOCTORS.find(d => d.id === apt.doctorId)?.name || "Unknown Doctor",
    createdAt: new Date(Date.now() - index * 1000 * 60 * 60 * 24).toISOString().split('T')[0],
  }));
};

export default function AppointmentManagementPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Pick<User, 'id' | 'name'>[]>([]);
  const [doctors, setDoctors] = useState<Pick<Doctor, 'id' | 'name' | 'specialtyName'>[]>([]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<Appointment | null>(null);
  
  const [filterDoctor, setFilterDoctor] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDate, setFilterDate] = useState<string>("");

  const { toast } = useToast();

  useEffect(() => {
    setAppointments(getInitialAppointments());
    setPatients(MOCK_PATIENTS);
    setDoctors(MOCK_DOCTORS);
  }, []);

  const filteredAppointments = useMemo(() => {
    return appointments.filter(apt => {
      const doctorMatch = filterDoctor === "all" || apt.doctorId === filterDoctor;
      const statusMatch = filterStatus === "all" || apt.status === filterStatus;
      const dateMatch = filterDate === "" || apt.date === filterDate;
      return doctorMatch && statusMatch && dateMatch;
    });
  }, [appointments, filterDoctor, filterStatus, filterDate]);


  const handleCreateAppointment = () => {
    setSelectedAppointment(null);
    setIsFormOpen(true);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsFormOpen(true);
  };

  const handleSaveAppointment = (appointmentData: Omit<Appointment, 'createdAt' | 'patientName' | 'doctorName'> & { id?: string }) => {
    const patientName = patients.find(p => p.id === appointmentData.patientId)?.name || "Unknown";
    const doctorName = doctors.find(d => d.id === appointmentData.doctorId)?.name || "Unknown";
    const status = appointmentData.status as Appointment['status'];

    if (appointmentData.id) {
      setAppointments(appointments.map(apt => apt.id === appointmentData.id ? { ...apt, ...appointmentData, date: formatBackendDate(appointmentData.date as unknown as Date), patientName, doctorName, status } : apt));
    } else {
      const newAppointment: Appointment = {
        ...appointmentData,
        id: `apt_${Date.now()}`,
        createdAt: new Date().toISOString().split('T')[0],
        date: formatBackendDate(appointmentData.date as unknown as Date),
        patientName,
        doctorName,
        status,
      };
      setAppointments([newAppointment, ...appointments]);
    }
  };

  const formatBackendDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const handleCancelAppointment = (appointment: Appointment) => {
    setAppointmentToCancel(appointment);
    setIsCancelDialogOpen(true);
  };

  const confirmCancelAppointment = () => {
    if (appointmentToCancel) {
      setAppointments(appointments.map(apt => 
        apt.id === appointmentToCancel.id ? { ...apt, status: "cancelled" } : apt
      ));
      toast({
        title: "Appointment Cancelled",
        description: `Appointment with ${appointmentToCancel.patientName} has been cancelled.`,
      });
      setAppointmentToCancel(null);
    }
    setIsCancelDialogOpen(false);
  };
  
  const getStatusBadgeVariant = (status: Appointment['status']) => {
    switch (status) {
      case 'scheduled': return 'default';
      case 'completed': return 'secondary'; // Using secondary which is often greenish in themes
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const handleExport = () => {
    // This is a placeholder for actual export functionality
    toast({ title: "Export Started", description: "Generating appointment data for export..." });
    console.log("Exporting appointments:", filteredAppointments);
  };

  return (
    <>
      <PageHeader title="Appointment Management" description="View, schedule, and manage all appointments.">
        <Button onClick={handleCreateAppointment}>
          <PlusCircle className="mr-2 h-4 w-4" /> Create Appointment
        </Button>
      </PageHeader>

      <div className="mb-6 p-4 border rounded-lg bg-card shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <label htmlFor="filter-doctor" className="block text-sm font-medium text-muted-foreground mb-1">Filter by Doctor</label>
            <Select value={filterDoctor} onValueChange={setFilterDoctor}>
              <SelectTrigger id="filter-doctor"><SelectValue placeholder="All Doctors" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Doctors</SelectItem>
                {doctors.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor="filter-status" className="block text-sm font-medium text-muted-foreground mb-1">Filter by Status</label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger id="filter-status"><SelectValue placeholder="All Statuses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor="filter-date" className="block text-sm font-medium text-muted-foreground mb-1">Filter by Date</label>
            <Input id="filter-date" type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
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
              <TableHead>Date & Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAppointments.map((apt) => (
              <TableRow key={apt.id}>
                <TableCell className="font-medium">{apt.patientName}</TableCell>
                <TableCell>{apt.doctorName}</TableCell>
                <TableCell>{new Date(apt.date).toLocaleDateString()} - {apt.time}</TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(apt.status)} className="capitalize">{apt.status}</Badge>
                </TableCell>
                <TableCell className="max-w-xs truncate">{apt.notes || "N/A"}</TableCell>
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
                      <DropdownMenuItem onClick={() => handleEditAppointment(apt)} disabled={apt.status === 'completed' || apt.status === 'cancelled'}>
                        <Edit className="mr-2 h-4 w-4" /> Modify
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleCancelAppointment(apt)} disabled={apt.status === 'completed' || apt.status === 'cancelled'} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                        <XCircle className="mr-2 h-4 w-4" /> Cancel
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {filteredAppointments.length === 0 && (
        <div className="text-center text-muted-foreground mt-8">
          No appointments found with the current filters.
        </div>
      )}

      <AppointmentForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        appointment={selectedAppointment}
        patients={patients}
        doctors={doctors}
        onSave={handleSaveAppointment}
      />

      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to cancel this appointment?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will mark the appointment for {appointmentToCancel?.patientName} with {appointmentToCancel?.doctorName} on {appointmentToCancel ? new Date(appointmentToCancel.date).toLocaleDateString() : ''} as cancelled.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Appointment</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancelAppointment} className="bg-destructive hover:bg-destructive/90">
              Confirm Cancellation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
