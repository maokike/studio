// studio/src/app/doctors/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
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
  Trash2,
  Loader2,
} from "lucide-react"; 
import { DoctorForm } from "./doctor-form"; // <--- Importa DoctorForm
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

// Definimos la interfaz Doctor basada en tu interfaz User, pero específica para médicos
// Coincide con las propiedades PascalCase de tu API de C# para Usuario
export interface Doctor {
  Id: number;
  Cedula: number;
  Nombre: string;
  Apellido: string;
  Email: string;
  Contrasena?: string;
  Rol: "Medico"; // El rol será siempre "Medico"
  EspecialidadId?: number | null; // Requerido para Medico, puede ser null si no hay especialidad
  Estatus: boolean;
  FechaRegistro: string;
  // Puedes añadir más propiedades específicas del médico aquí si tu API las devuelve
  SpecialtyName?: string; // Para mostrar el nombre de la especialidad
}

// Interfaz para los datos del formulario de médico
export interface DoctorFormData {
  Id?: number;
  Cedula?: number;
  Nombre: string;
  Apellido: string;
  Email: string;
  Contrasena?: string;
  Rol: "Medico"; // En el formulario, siempre será "Medico"
  EspecialidadId?: number | null;
  Estatus?: boolean;
}

// Interfaz para las especialidades (solo Id y Nombre, para el Select)
export interface Specialty {
  Id: number;
  Nombre: string;
}

// MOCK DATA para Especialidades (en una app real, esto se obtendría de una API)
const MOCK_SPECIALTIES: Specialty[] = [
  { Id: 1, Nombre: "Cardiología" },
  { Id: 2, Nombre: "Pediatría" },
  { Id: 3, Nombre: "Neurología" },
  { Id: 4, Nombre: "Ortopedia" },
  { Id: 5, Nombre: "Dermatología" },
  { Id: 6, Nombre: "Neurologia" },
  { Id: 7, Nombre: "Oftalmologia" },
  { Id: 8, Nombre: "Otorrinolaringologia" },
  { Id: 9, Nombre: "Ortopedia" },
  { Id: 10, Nombre: "Psiquiatria" },
  { Id: 11, Nombre: "Urologia" },
  { Id: 12, Nombre: "Endocrinologia" },
  { Id: 13, Nombre: "Gastroenterologia" },
  { Id: 14, Nombre: "Nefrologia" },
  { Id: 15, Nombre: "Oncologia" },
  { Id: 16, Nombre: "Reumatologia" },
  { Id: 17, Nombre: "Neumologia" },
  { Id: 18, Nombre: "Traumatologia" },
  { Id: 19, Nombre: "Infectologia" },
  { Id: 20, Nombre: "Alergologia" },

];


export default function DoctorManagementPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]); // Lista de médicos
  const [specialties, setSpecialties] = useState<Specialty[]>([]); // Lista de especialidades
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingOrDeleting, setIsSavingOrDeleting] = useState(false);
  const { toast } = useToast();

  console.log("DEBUG: isSavingOrDeleting (render):", isSavingOrDeleting);

  // --- Función para obtener médicos de la API ---
  const fetchDoctors = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("https://localhost:44314/api/Usuario"); // Obtener todos los usuarios
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al cargar médicos desde el backend.");
      }
      
      const rawData: any[] = await response.json(); 
      
      // Mapea y filtra a Doctor, convirtiendo Estatus a booleano y añadiendo SpecialtyName
      const processedDoctors: Doctor[] = rawData
        .filter((u: any) => u.Rol === "Medico") // Filtrar solo médicos
        .map((user: any) => ({
          ...user,
          Estatus: Boolean(user.Estatus), // Convertir 0/1 a false/true
          // Añadir el nombre de la especialidad para mostrar en la tabla
          SpecialtyName: MOCK_SPECIALTIES.find(s => s.Id === user.EspecialidadId)?.Nombre || "N/A",
        }));

      setDoctors(processedDoctors);
      setSpecialties(MOCK_SPECIALTIES); // Cargar especialidades mockeadas
    } catch (error: any) {
      console.error("Error obteniendo médicos:", error);
      toast({
        variant: "destructive",
        title: "Error de carga",
        description: error.message || "No se pudieron obtener los médicos.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]); 

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const handleRegisterDoctor = () => {
    setSelectedDoctor(null); // Es un nuevo médico
    setIsFormOpen(true);
  };

  const handleEditDoctor = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsFormOpen(true);
  };

  // --- Función para guardar o actualizar un médico ---
  const handleSaveDoctor = async (doctorData: DoctorFormData) => {
    console.log("DEBUG: handleSaveDoctor iniciando. isSavingOrDeleting antes:", isSavingOrDeleting);
    setIsSavingOrDeleting(true);
    console.log("DEBUG: isSavingOrDeleting después de set true:", true);

    const isEditing = typeof doctorData.Id === "number";
    const method = isEditing ? "PUT" : "POST";
    const endpoint = "https://localhost:44314/api/Usuario"; // Siempre la API de Usuario

    // Prepara el payload para el backend
    const payload = {
      Id: isEditing ? doctorData.Id : undefined,
      Cedula: doctorData.Cedula,
      Nombre: doctorData.Nombre,
      Apellido: doctorData.Apellido,
      Email: doctorData.Email,
      Contrasena: doctorData.Contrasena || (isEditing ? undefined : "DefaultPass123"), // Default si es nuevo y no se proporciona
      Rol: "Medico", // Siempre será "Medico" para este formulario
      EspecialidadId: doctorData.EspecialidadId, // Ya viene como number/null desde el formulario
      Estatus: typeof doctorData.Estatus === 'boolean' ? (doctorData.Estatus ? 1 : 0) : 1, // Convierte a 1/0
    };

    try {
      const response = await fetch(
        isEditing ? `${endpoint}/${payload.Id}` : endpoint, 
        {
          method: method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Fallo al ${isEditing ? "actualizar" : "registrar"} el médico.`);
      }

      toast({
        title: `Médico ${isEditing ? "actualizado" : "registrado"}`,
        description: `${data.mensaje || `El médico ${payload.Nombre} ha sido ${isEditing ? "actualizado" : "registrado"} exitosamente.`}`,
      });
      setIsFormOpen(false);
      fetchDoctors(); // Recargar la lista
    } catch (error: any) {
      console.error("DEBUG: Error en handleSaveDoctor:", error);
      toast({
        variant: "destructive",
        title: `Error al ${isEditing ? "actualizar" : "registrar"} médico`,
        description: error.message || "Ocurrió un error al guardar el médico.",
      });
    } finally {
      setIsSavingOrDeleting(false);
      console.log("DEBUG: handleSaveDoctor finalizando. isSavingOrDeleting después:", false);
    }
  };
  
  const handleDeleteDoctor = (doctor: Doctor) => {
    setDoctorToDelete(doctor);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteDoctor = async () => {
    if (!doctorToDelete) return;

    console.log("DEBUG: confirmDeleteDoctor iniciando. isSavingOrDeleting antes:", isSavingOrDeleting);
    setIsSavingOrDeleting(true);
    console.log("DEBUG: isSavingOrDeleting después de set true:", true);
    try {
      const response = await fetch(`https://localhost:44314/api/Usuario/${doctorToDelete.Id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Fallo al eliminar el médico.");
      }

      toast({
        title: "Médico Eliminado",
        description: `${data.mensaje || `El médico ${doctorToDelete.Nombre} ha sido eliminado correctamente.`}`,
      });
      setDoctorToDelete(null);
      setIsDeleteDialogOpen(false);
      fetchDoctors(); // Recargar la lista
    } catch (error: any) {
      console.error("DEBUG: Error en confirmDeleteDoctor:", error);
      toast({
        variant: "destructive",
        title: "Error al eliminar",
        description: error.message || "Ocurrió un error al eliminar el médico.",
      });
    } finally {
      setIsSavingOrDeleting(false);
      console.log("DEBUG: confirmDeleteDoctor finalizando. isSavingOrDeleting después:", false);
    }
  };

  const getRoleBadgeVariant = (rol: Doctor["Rol"]) => {
    switch (rol) {
      case "Admin": 
        return "destructive";
      case "Medico": 
        return "default";
      case "Paciente": 
        return "secondary";
      default:
        return "outline";
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen-minus-header">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">
          Cargando médicos...
        </p>
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

      <div className="rounded-lg border shadow-sm overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cédula</TableHead>
              <TableHead>Nombre Completo</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Especialidad</TableHead> {/* <--- CAMBIO AQUÍ */}
              <TableHead>Estatus</TableHead>
              <TableHead>Fecha de Registro</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {doctors.length === 0 ? ( 
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-muted-foreground"
                >
                  No se encontraron médicos.
                </TableCell>
              </TableRow>
            ) : (
              doctors.map((doctor) => (
                <TableRow key={doctor.Id}>
                  <TableCell>{doctor.Cedula}</TableCell>
                  <TableCell className="font-medium">{`${doctor.Nombre} ${doctor.Apellido}`}</TableCell>
                  <TableCell>{doctor.Email}</TableCell>
                  <TableCell>{doctor.SpecialtyName || "N/A"}</TableCell> {/* Muestra el nombre de la especialidad */}
                  <TableCell>
                    <Badge
                      variant={doctor.Estatus ? "default" : "secondary"}
                      className="capitalize"
                    >
                      {doctor.Estatus ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(doctor.FechaRegistro).toLocaleDateString("es-CO", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          disabled={isSavingOrDeleting}
                        >
                          <span className="sr-only">Abrir menú</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => handleEditDoctor(doctor)}
                          disabled={isSavingOrDeleting}
                        >
                          <Edit className="mr-2 h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteDoctor(doctor)}
                          className="text-destructive focus:text-destructive focus:bg-destructive/10"
                          disabled={isSavingOrDeleting}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <DoctorForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        doctor={selectedDoctor}
        specialties={specialties} // Pasa las especialidades al formulario
        onSave={handleSaveDoctor}
        isLoading={isSavingOrDeleting} 
      />

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente
              la cuenta del médico{" "}
              <span className="font-medium">
                {doctorToDelete?.Nombre} {doctorToDelete?.Apellido}
              </span>
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSavingOrDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteDoctor}
              className="bg-destructive hover:bg-destructive/90"
              disabled={isSavingOrDeleting}
            >
              {isSavingOrDeleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}{" "}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
