"use client";

import { useState } from "react";
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
  doctorCount: number; // Number of doctors associated with this specialty
  createdAt: string;
}

const MOCK_SPECIALTIES_DATA: Specialty[] = [
  { id: "spec_1", name: "Cardiology", description: "Deals with disorders of the heart.", doctorCount: 5, createdAt: "2023-01-10" },
  { id: "spec_2", name: "Pediatrics", description: "Branch of medicine dealing with children.", doctorCount: 3, createdAt: "2023-02-15" },
  { id: "spec_3", name: "Neurology", description: "Focuses on the nervous system.", doctorCount: 2, createdAt: "2023-03-20" },
  { id: "spec_4", name: "Orthopedics", description: "Concerned with the musculoskeletal system.", doctorCount: 4, createdAt: "2023-04-25" },
];

export default function SpecialtyManagementPage() {
  const [specialties, setSpecialties] = useState<Specialty[]>(MOCK_SPECIALTIES_DATA);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [specialtyToDelete, setSpecialtyToDelete] = useState<Specialty | null>(null);
  const { toast } = useToast();

  const handleRegisterSpecialty = () => {
    setSelectedSpecialty(null);
    setIsFormOpen(true);
  };

  const handleEditSpecialty = (specialty: Specialty) => {
    setSelectedSpecialty(specialty);
    setIsFormOpen(true);
  };

  const handleSaveSpecialty = (specialtyData: Omit<Specialty, 'createdAt' | 'doctorCount' | 'id'> & {id?: string}) => {
    if (specialtyData.id) {
      setSpecialties(specialties.map(s => s.id === specialtyData.id ? { ...s, ...specialtyData } : s));
    } else {
      const newSpecialty: Specialty = {
        ...specialtyData,
        id: `spec_${Date.now()}`,
        doctorCount: 0, // New specialties start with 0 doctors
        createdAt: new Date().toISOString().split('T')[0],
      };
      setSpecialties([newSpecialty, ...specialties]);
    }
  };

  const handleDeleteSpecialty = (specialty: Specialty) => {
    if (specialty.doctorCount > 0) {
      toast({
        variant: "destructive",
        title: "Cannot Delete Specialty",
        description: `${specialty.name} has ${specialty.doctorCount} doctor(s) assigned. Please reassign doctors before deleting.`,
      });
      return;
    }
    setSpecialtyToDelete(specialty);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteSpecialty = () => {
    if (specialtyToDelete) {
      setSpecialties(specialties.filter(s => s.id !== specialtyToDelete.id));
      toast({
        title: "Specialty Deleted",
        description: `${specialtyToDelete.name} has been successfully deleted.`,
      });
      setSpecialtyToDelete(null);
    }
    setIsDeleteDialogOpen(false);
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
              <TableHead>Description</TableHead>
              <TableHead className="text-center">Doctors</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {specialties.map((spec) => (
              <TableRow key={spec.id}>
                <TableCell className="font-medium">{spec.name}</TableCell>
                <TableCell className="max-w-sm truncate">{spec.description || "N/A"}</TableCell>
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
                      <DropdownMenuItem onClick={() => handleDeleteSpecialty(spec)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {specialties.length === 0 && (
        <div className="text-center text-muted-foreground mt-8">
          No specialties found.
        </div>
      )}

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
