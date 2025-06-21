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
import { UserForm } from "./user-form";
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

export interface User {
  Id: number;
  Cedula: number;
  Nombre: string;
  Apellido: string;
  Email: string;
  Contrasena?: string;
  Rol: "Paciente" | "Medico" | "Admin";
  EspecialidadId?: number | null;
  Estatus: boolean;
  FechaRegistro: string;
}

export interface UserFormData {
  Id?: number;
  Cedula: number;
  Nombre: string;
  Apellido: string;
  Email: string;
  Contrasena?: string;
  Rol: "Paciente" | "Medico" | "Admin";
  EspecialidadId?: number | null;
  Estatus?: boolean;
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingOrDeleting, setIsSavingOrDeleting] = useState(false);
  const { toast } = useToast();

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("https://localhost:44314/api/Usuario");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Error al cargar usuarios desde el backend."
        );
      }
      
      const rawData: any[] = await response.json();
      const processedData: User[] = rawData.map(user => ({
        ...user,
        Estatus: Boolean(user.Estatus),
      }));

      setUsers(processedData.filter((u) => u.Rol === "Paciente"));
    } catch (error: any) {
      console.error("Error obteniendo usuarios:", error);
      toast({
        variant: "destructive",
        title: "Error de carga",
        description: error.message || "No se pudieron obtener los usuarios.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreateUser = () => {
    setSelectedUser(null);
    setIsFormOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handleSaveUser = async (userData: UserFormData) => {
    setIsSavingOrDeleting(true);
    try {
      const isEditing = typeof userData.Id === "number";
      const method = isEditing ? "PUT" : "POST";
      const endpoint = "https://localhost:44314/api/Usuario";
  
      // Determinar si incluir contraseña
      const shouldIncludePassword = !isEditing || 
                                  (userData.Contrasena && userData.Contrasena.trim() !== "");
  
      const payload = {
        Id: isEditing ? userData.Id : undefined,
        Cedula: userData.Cedula,
        Nombre: userData.Nombre,
        Apellido: userData.Apellido,
        Email: userData.Email,
        Contrasena: shouldIncludePassword ? userData.Contrasena : null, // Enviar null en lugar de undefined
        Rol: userData.Rol,
        EspecialidadId: userData.Rol !== "Medico" ? null : userData.EspecialidadId || null,
        Estatus: typeof userData.Estatus === 'boolean' ? (userData.Estatus ? 1 : 0) : 1,
      };
  
      const response = await fetch(
        isEditing ? `${endpoint}/${payload.Id}` : endpoint, 
        {
          method: method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
  
      // Verificar si la respuesta es OK
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Fallo al ${isEditing ? "actualizar" : "crear"} el usuario.`
        );
      }
  
      const data = await response.json();
      toast({
        title: `Usuario ${isEditing ? "actualizado" : "creado"}`,
        description: data.mensaje || `El usuario ha sido ${isEditing ? "actualizado" : "creado"} exitosamente.`,
      });
      
      setIsFormOpen(false);
      fetchUsers();
    } catch (error: any) {
      console.error("Error en handleSaveUser:", error);
      toast({
        variant: "destructive",
        title: "Error al guardar",
        description: error.message || "Ocurrió un error al guardar el usuario.",
      });
    } finally {
      setIsSavingOrDeleting(false);
    }
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    setIsSavingOrDeleting(true);
    try {
      const response = await fetch(`https://localhost:44314/api/Usuario/${userToDelete.Id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Fallo al eliminar el usuario.");
      }

      toast({
        title: "Usuario Eliminado",
        description: `${
          data.mensaje ||
          `El usuario ${userToDelete.Nombre} ha sido eliminado correctamente.`
        }`,
      });
      setUserToDelete(null);
      setIsDeleteDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      console.error("Error en confirmDeleteUser:", error);
      toast({
        variant: "destructive",
        title: "Error al eliminar",
        description:
          error.message || "Ocurrió un error al eliminar el usuario.",
      });
    } finally {
      setIsSavingOrDeleting(false);
    }
  };

  const getRoleBadgeVariant = (rol: User["Rol"]) => {
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
          Cargando usuarios...
        </p>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Gestión de Usuarios"
        description="Administra todas las cuentas de usuario en el sistema."
      >
        <Button onClick={handleCreateUser} disabled={isSavingOrDeleting}>
          <PlusCircle className="mr-2 h-4 w-4" /> Crear Usuario
        </Button>
      </PageHeader>

      <div className="rounded-lg border shadow-sm overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cédula</TableHead>
              <TableHead>Nombre Completo</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estatus</TableHead>
              <TableHead>Fecha de Registro</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-muted-foreground"
                >
                  No se encontraron usuarios con rol 'Paciente'.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.Id}>
                  <TableCell>{user.Cedula}</TableCell>
                  <TableCell className="font-medium">{`${user.Nombre} ${user.Apellido}`}</TableCell>
                  <TableCell>{user.Email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={getRoleBadgeVariant(user.Rol)}
                      className="capitalize"
                    >
                      {user.Rol}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.Estatus ? "default" : "secondary"}
                      className="capitalize"
                    >
                      {user.Estatus ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(user.FechaRegistro).toLocaleDateString("es-CO", {
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
                          onClick={() => handleEditUser(user)}
                          disabled={isSavingOrDeleting}
                        >
                          <Edit className="mr-2 h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteUser(user)}
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

      <UserForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        user={selectedUser}
        onSave={handleSaveUser}
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
              la cuenta de usuario de{" "}
              <span className="font-medium">
                {userToDelete?.Nombre} {userToDelete?.Apellido}
              </span>
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSavingOrDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteUser}
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