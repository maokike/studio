"use client";
import React, { useEffect, useState, useCallback } from "react";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  MoreHorizontal,
  PlusCircle,
  Edit,
  Trash2,
  Loader2,
} from "lucide-react";
import { DoctorForm } from "./doctor-form";
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
import { useToast } from "@/hooks/use-toast";

export interface Doctor {
  Id: number;
  Cedula: number;
  Nombre: string;
  Apellido: string;
  Email: string;
  Contrasena?: string;
  Rol: "Medico";
  EspecialidadId?: number | null;
  Estatus: boolean;
  FechaRegistro: string;
  SpecialtyName?: string;
}

export interface DoctorFormData {
  Id?: number;
  Cedula?: number;
  Nombre: string;
  Apellido: string;
  Email: string;
  Contrasena?: string;
  Rol: "Medico";
  EspecialidadId?: number | null;
  Estatus?: boolean;
}

export interface Specialty {
  Id: number;
  Nombre: string;
}

export default function DoctorManagementPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingOrDeleting, setIsSavingOrDeleting] = useState(false);
  const { toast } = useToast();

  // Fetch specialties from API
  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const response = await fetch("https://localhost:44314/api/Especialidad");
        if (!response.ok) throw new Error("Error al cargar especialidades");
        const data = await response.json();
        setSpecialties(data);
      } catch (error) {
        setSpecialties([]);
      }
    };
    fetchSpecialties();
  }, []);

  // Fetch doctors from API
  const fetchDoctors = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("https://localhost:44314/api/Usuario");
      if (!response.ok) throw new Error("Error al cargar médicos");

      const data: any[] = await response.json();

      const processedDoctors: Doctor[] = data
        .filter((u) => u.Rol === "Medico")
        .map((user) => ({
          ...user,
          Estatus: Boolean(user.Estatus),
          SpecialtyName:
            specialties.find((s) => s.Id === user.EspecialidadId)?.Nombre ||
            "N/A",
        }));

      setDoctors(processedDoctors);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, specialties]);

  useEffect(() => {
    if (specialties.length > 0) {
      fetchDoctors();
    }
  }, [fetchDoctors, specialties]);

  const handleRegisterDoctor = () => {
    setSelectedDoctor(null);
    setIsFormOpen(true);
  };

  const handleEditDoctor = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsFormOpen(true);
  };

  const handleSaveDoctor = async (formData: DoctorFormData) => {
    setIsSavingOrDeleting(true);
    const isEditing = !!formData.Id;

    try {
      const payload = {
        Id: formData.Id,
        Cedula: formData.Cedula,
        Nombre: formData.Nombre,
        Apellido: formData.Apellido,
        Email: formData.Email,
        Contrasena: isEditing && !formData.Contrasena ? "" : formData.Contrasena || "",
        Rol: "Medico",
        EspecialidadId: formData.EspecialidadId || 0,
        Estatus: formData.Estatus ? 1 : 0,
      };

      const endpoint = `https://localhost:44314/api/Usuario${isEditing ? `/${formData.Id}` : ""}`;
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al guardar médico");
      }

      toast({
        title: `Médico ${isEditing ? "actualizado" : "registrado"}`,
        description: `El médico ha sido ${isEditing ? "actualizado" : "registrado"} correctamente.`,
      });

      setIsFormOpen(false);
      fetchDoctors();
    } catch (error: any) {
      console.error("Error detallado:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Ocurrió un error al procesar la solicitud",
      });
    } finally {
      setIsSavingOrDeleting(false);
    }
  };

  const handleDeleteDoctor = (doctor: Doctor) => {
    setDoctorToDelete(doctor);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteDoctor = async () => {
    if (!doctorToDelete) return;
    setIsSavingOrDeleting(true);

    try {
      const response = await fetch(
        `https://localhost:44314/api/Usuario/${doctorToDelete.Id}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al eliminar médico");
      }

      toast({
        title: "Médico eliminado",
        description: "El médico ha sido eliminado correctamente.",
      });

      setIsDeleteDialogOpen(false);
      fetchDoctors();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsSavingOrDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Gestión de Médicos"
        description="Administra todas las cuentas de médico en el sistema."
      >
        <Button onClick={handleRegisterDoctor} disabled={isSavingOrDeleting}>
          <PlusCircle className="mr-2 h-4 w-4" /> Registrar Médico
        </Button>
      </PageHeader>

      <div className="rounded-lg border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cédula</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Especialidad</TableHead>
              <TableHead>Estatus</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {doctors.map((doctor) => (
              <TableRow key={doctor.Id}>
                <TableCell>{doctor.Cedula}</TableCell>
                <TableCell>{`${doctor.Nombre} ${doctor.Apellido}`}</TableCell>
                <TableCell>{doctor.Email}</TableCell>
                <TableCell>{doctor.SpecialtyName}</TableCell>
                <TableCell>
                  <Badge variant={doctor.Estatus ? "default" : "secondary"}>
                    {doctor.Estatus ? "Activo" : "Inactivo"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditDoctor(doctor)}>
                        <Edit className="mr-2 h-4 w-4" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteDoctor(doctor)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <DoctorForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        doctor={selectedDoctor}
        specialties={specialties}
        onSave={handleSaveDoctor}
        isLoading={isSavingOrDeleting}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente al médico {doctorToDelete?.Nombre} {doctorToDelete?.Apellido}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteDoctor}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSavingOrDeleting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}