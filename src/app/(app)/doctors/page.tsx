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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreHorizontal, PlusCircle, Edit, Trash2, History } from "lucide-react";
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
import type { Specialty } from "../specialties/page"; // Import Specialty type

export interface Doctor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  specialtyId: string;
  specialtyName?: string; // Denormalized for display
  avatarUrl?: string;
  registeredAt: string;
}

// MOCK DATA - In a real app, specialties would be fetched
const MOCK_SPECIALTIES: Pick<Specialty, 'id' | 'name'>[] = [
  { id: "spec_1", name: "Cardiology" },
  { id: "spec_2", name: "Pediatrics" },
  { id: "spec_3", name: "Neurology" },
  { id: "spec_4", name: "Orthopedics" },
];

const MOCK_DOCTORS_RAW: Omit<Doctor, 'specialtyName' | 'registeredAt' | 'avatarUrl'>[] = [
  { id: "doc_1", name: "Dr. Emily Carter", email: "emily.carter@example.com", phone: "555-0101", specialtyId: "spec_1" },
  { id: "doc_2", name: "Dr. Benjamin Lee", email: "ben.lee@example.com", phone: "555-0102", specialtyId: "spec_2" },
  { id: "doc_3", name: "Dr. Olivia Garcia", email: "olivia.garcia@example.com", specialtyId: "spec_3" },
  { id: "doc_4", name: "Dr. Samuel Green", email: "sam.green@example.com", phone: "555-0104", specialtyId: "spec_1" },
];

const getInitialDoctors = (): Doctor[] => {
  return MOCK_DOCTORS_RAW.map((doc, index) => ({
    ...doc,
    specialtyName: MOCK_SPECIALTIES.find(s => s.id === doc.specialtyId)?.name || "Unknown",
    avatarUrl: `https://placehold.co/100x100.png?text=${doc.name.charAt(0)}`,
    registeredAt: new Date(Date.now() - index * 1000 * 60 * 60 * 24 * 30).toISOString().split('T')[0], // Stagger registration dates
  }));
};


export default function DoctorManagementPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specialties, setSpecialties] = useState<Pick<Specialty, 'id' | 'name'>[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState<Doctor | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    // Simulate fetching data
    setDoctors(getInitialDoctors());
    setSpecialties(MOCK_SPECIALTIES);
  }, []);


  const handleRegisterDoctor = () => {
    setSelectedDoctor(null);
    setIsFormOpen(true);
  };

  const handleEditDoctor = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsFormOpen(true);
  };

  const handleSaveDoctor = (doctorData: Omit<Doctor, 'registeredAt' | 'avatarUrl' | 'specialtyName'> & { id?: string }) => {
    const specialtyName = specialties.find(s => s.id === doctorData.specialtyId)?.name || "Unknown";
    if (doctorData.id) {
      setDoctors(doctors.map(d => d.id === doctorData.id ? { ...d, ...doctorData, specialtyName } : d));
    } else {
      const newDoctor: Doctor = {
        ...doctorData,
        id: `doc_${Date.now()}`,
        avatarUrl: `https://placehold.co/100x100.png?text=${doctorData.name.charAt(0)}`,
        registeredAt: new Date().toISOString().split('T')[0],
        specialtyName,
      };
      setDoctors([newDoctor, ...doctors]);
    }
  };
  
  const handleDeleteDoctor = (doctor: Doctor) => {
    setDoctorToDelete(doctor);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteDoctor = () => {
    if (doctorToDelete) {
      setDoctors(doctors.filter(d => d.id !== doctorToDelete.id));
      toast({
        title: "Doctor Profile Deleted",
        description: `${doctorToDelete.name}'s profile has been successfully deleted.`,
      });
      setDoctorToDelete(null);
    }
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      <PageHeader title="Doctor Management" description="Manage doctor profiles, specialties, and schedules.">
        <Button onClick={handleRegisterDoctor}>
          <PlusCircle className="mr-2 h-4 w-4" /> Register Doctor
        </Button>
      </PageHeader>

      <div className="rounded-lg border shadow-sm overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Specialty</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Registered</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {doctors.map((doctor) => (
              <TableRow key={doctor.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={doctor.avatarUrl} alt={doctor.name} data-ai-hint="doctor portrait" />
                      <AvatarFallback>{doctor.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{doctor.name}</span>
                  </div>
                </TableCell>
                <TableCell>{doctor.specialtyName}</TableCell>
                <TableCell>{doctor.email}</TableCell>
                <TableCell>{doctor.phone || "N/A"}</TableCell>
                <TableCell>{new Date(doctor.registeredAt).toLocaleDateString()}</TableCell>
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
                      <DropdownMenuItem onClick={() => handleEditDoctor(doctor)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => alert(`View appointment history for ${doctor.name}`)}>
                        <History className="mr-2 h-4 w-4" /> View History
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDeleteDoctor(doctor)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete Profile
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {doctors.length === 0 && (
        <div className="text-center text-muted-foreground mt-8">
          No doctors found.
        </div>
      )}

      <DoctorForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        doctor={selectedDoctor}
        specialties={specialties}
        onSave={handleSaveDoctor}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete Dr. {doctorToDelete?.name}'s profile.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteDoctor} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
