"use client";

import { useState, useEffect } from "react";
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
import { MoreHorizontal, PlusCircle, Edit, Trash2 } from "lucide-react";
import { SpecialtyForm } from "./specialty-form";
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

export interface Specialty {
  id: string;
  name: string;
  createdAt: string;
}

// Base URL for your API
const API_BASE_URL = "https://localhost:44314/api";

export default function SpecialtyManagementPage() {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [specialtyToDelete, setSpecialtyToDelete] = useState<Specialty | null>(null);
  const { toast } = useToast();

  // --- API Fetching Functions ---
  const fetchSpecialties = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/Especialidad`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const rawData = await response.json();

      // Map backend structure to frontend Specialty interface
      const data: Specialty[] = rawData.map((item: any) => ({
        id: item.Id?.toString() ?? "0",
        name: item.Nombre ?? "Sin nombre",
        createdAt: new Date().toISOString(), // Placeholder date
      }));

      setSpecialties(data);
    } catch (error) {
      console.error("Error fetching specialties:", error);
      toast({
        title: "Error",
        description: "Failed to load specialties. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchSpecialties();
  }, []);

  const handleRegisterSpecialty = () => {
    setSelectedSpecialty(null);
    setIsFormOpen(true);
  };

  const handleEditSpecialty = (specialty: Specialty) => {
    setSelectedSpecialty(specialty);
    setIsFormOpen(true);
  };

  // AJUSTE: Mapea el objeto para coincidir con el backend ASP.NET
  const handleSaveSpecialty = async (specialtyData: Omit<Specialty, "createdAt"> & { id?: string }) => {
    try {
      // Solo envía lo que el backend espera
      const payload: any = {
        Nombre: specialtyData.name
      };
      if (specialtyData.id) {
        payload.Id = parseInt(specialtyData.id);
      }

      let response;
      if (specialtyData.id) {
        response = await fetch(`${API_BASE_URL}/Especialidad/${specialtyData.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        toast({
          title: "Especialidad actualizada",
          description: `${specialtyData.name} ha sido actualizada correctamente.`,
        });
      } else {
        response = await fetch(`${API_BASE_URL}/Especialidad`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        toast({
          title: "Especialidad registrada",
          description: `${specialtyData.name} ha sido registrada correctamente.`,
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to save specialty: ${response.statusText} - ${errorText}`);
      }

      fetchSpecialties();
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error saving specialty:", error);
      toast({
        title: "Error",
        description: `Failed to save specialty: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      });
    }
  };

  const handleDeleteSpecialty = (specialty: Specialty) => {
    setSpecialtyToDelete(specialty);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteSpecialty = async () => {
    if (!specialtyToDelete) return;

    try {
      const response = await fetch(`${API_BASE_URL}/Especialidad/${specialtyToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete specialty: ${response.statusText} - ${errorText}`);
      }

      toast({
        title: "Especialidad eliminada",
        description: `${specialtyToDelete.name} ha sido eliminada correctamente.`,
      });
      fetchSpecialties();
      setSpecialtyToDelete(null);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting specialty:", error);
      toast({
        title: "Error",
        description: `Failed to delete specialty: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <PageHeader title="Gestión de Especialidades" description="Administra todas las especialidades médicas del sistema.">
        <Button onClick={handleRegisterSpecialty}>
          <PlusCircle className="mr-2 h-4 w-4" /> Registrar Especialidad
        </Button>
      </PageHeader>

      <div className="rounded-lg border shadow-sm overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Fecha de creación</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {specialties.length > 0 ? (
              specialties.map((spec) => (
                <TableRow key={spec.id}>
                  <TableCell className="font-medium">{spec.name}</TableCell>
                  <TableCell>{new Date(spec.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEditSpecialty(spec)}>
                          <Edit className="mr-2 h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteSpecialty(spec)}
                          className="text-destructive focus:text-destructive focus:bg-destructive/10"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                  No hay especialidades registradas.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <SpecialtyForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        specialty={selectedSpecialty}
        onSave={handleSaveSpecialty}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente la especialidad: {specialtyToDelete?.name}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteSpecialty} className="bg-destructive hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}