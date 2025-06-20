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
  description?: string;
  doctorCount: number;
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
        description: "N/A", // Placeholder: not returned from backend
        doctorCount: 0, // Placeholder: backend doesn't provide this
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

  const handleSaveSpecialty = async (specialtyData: Omit<Specialty, "createdAt" | "doctorCount"> & { id?: string }) => {
    try {
      let response;
      if (specialtyData.id) {
        response = await fetch(`${API_BASE_URL}/Especialidad/${specialtyData.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(specialtyData),
        });
        toast({
          title: "Specialty Updated",
          description: `${specialtyData.name} has been successfully updated.`,
        });
      } else {
        response = await fetch(`${API_BASE_URL}/Especialidad`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(specialtyData),
        });
        toast({
          title: "Specialty Registered",
          description: `${specialtyData.name} has been successfully registered.`,
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
    if (specialty.doctorCount > 0) {
      toast({
        variant: "destructive",
        title: "Cannot Delete Specialty",
        description: `${specialty.name} has ${specialty.doctorCount} doctor(s) assigned.`,
      });
      return;
    }
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
        title: "Specialty Deleted",
        description: `${specialtyToDelete.name} has been successfully deleted.`,
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
      <PageHeader title="Specialty Management" description="Manage all medical specialties available in the system.">
        <Button onClick={handleRegisterSpecialty}>
          <PlusCircle className="mr-2 h-4 w-4" /> Register Specialty
        </Button>
      </PageHeader>

      <div className="rounded-lg border shadow-sm overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="text-center">Doctors</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {specialties.length > 0 ? (
              specialties.map((spec) => (
                <TableRow key={spec.id}>
                  <TableCell className="font-medium">{spec.name}</TableCell>
                  <TableCell className="text-center">{spec.doctorCount}</TableCell>
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
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEditSpecialty(spec)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteSpecialty(spec)}
                          className="text-destructive focus:text-destructive focus:bg-destructive/10"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  No specialties found.
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
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the specialty: {specialtyToDelete?.name}.
              {specialtyToDelete && specialtyToDelete.doctorCount > 0 && (
                <p className="mt-2 font-semibold text-red-600">
                  Warning: This specialty currently has {specialtyToDelete.doctorCount} doctor(s) assigned.
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteSpecialty} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
