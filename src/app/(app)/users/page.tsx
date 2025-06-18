// studio/src/app/users/page.tsx
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
import { MoreHorizontal, PlusCircle, Edit, Trash2, Loader2 } from "lucide-react"; // Añadido Loader2 para carga
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

// --- Interfaz User: ¡AJUSTADA A PASCALCASE para coincidir con tu API de C#! ---
export interface User {
  Id: number; // Coincide con 'Id' en C#
  Cedula: number; // Coincide con 'Cedula' en C#
  Nombre: string; // Coincide con 'Nombre' en C#
  Apellido: string; // Coincide con 'Apellido' en C#
  Email: string; // Coincide con 'Email' en C#
  Contrasena?: string; // Coincide con 'Contrasena' en C# (opcional al recibir)
  Rol: "Paciente" | "Medico" | "Admin"; // Coincide con 'Rol' en C#
  EspecialidadId?: number | null; // Coincide con 'EspecialidadId' en C# (opcional, nullable)
  Estatus: boolean; // Coincide con 'Estatus' en C#
  FechaRegistro: string; // Coincide con 'FechaRegistro' en C# (string formato ISO)
}

// --- Interfaz UserFormData: Para los datos que envía el formulario (también PascalCase) ---
export interface UserFormData {
    Id?: number; // Opcional al editar
    Cedula: number;
    Nombre: string;
    Apellido: string;
    Email: string;
    Contrasena?: string; // Opcional, se envía solo si se cambia o es nuevo
    Rol: "Paciente" | "Medico" | "Admin";
    EspecialidadId?: number | null;
    Estatus?: boolean;
}


export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]); // Lista de usuarios
  const [isFormOpen, setIsFormOpen] = useState(false); // Controla si el formulario está abierto
  const [selectedUser, setSelectedUser] = useState<User | null>(null); // Usuario seleccionado para editar
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false); // Controla si el diálogo de eliminación está abierto
  const [userToDelete, setUserToDelete] = useState<User | null>(null); // Usuario a eliminar
  const [isLoading, setIsLoading] = useState(true); // Estado de carga inicial de la tabla
  const [isSavingOrDeleting, setIsSavingOrDeleting] = useState(false); // <--- Aquí se inicializa
  const { toast } = useToast(); // Para mostrar notificaciones

  console.log("DEBUG: isSavingOrDeleting (render):", isSavingOrDeleting); // <-- Añade esta línea al inicio del componente

  // --- Función para obtener usuarios de la API ---
  const fetchUsers = useCallback(async () => {
    setIsLoading(true); // Activa el estado de carga
    try {
      const response = await fetch("https://localhost:44314/api/Usuario"); // Llama a tu API de C# a través del proxy de Next.js
      if (!response.ok) {
        const errorData = await response.json(); // Si hay un error, lee el JSON del error
        throw new Error(errorData.message || "Error al cargar usuarios desde el backend.");
      }
      const data: User[] = await response.json(); // Mapea la respuesta a tu interfaz User[]
      setUsers(data.filter(u => u.Rol === 'Paciente')); // Filtra para mostrar solo los usuarios con Rol 'Paciente'
    } catch (error: any) {
      console.error("Error obteniendo usuarios:", error);
      toast({
        variant: "destructive",
        title: "Error de carga",
        description: error.message || "No se pudieron obtener los usuarios.",
      });
    } finally {
      setIsLoading(false); // Desactiva el estado de carga
    }
  }, [toast]); // Dependencias: se vuelve a crear si 'toast' cambia (poco probable)

  // Cargar usuarios al montar el componente (al cargar la página)
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]); // Se ejecuta una vez al montar y cuando fetchUsers cambie

  // Manejador para abrir el formulario de creación
  const handleCreateUser = () => {
    setSelectedUser(null); // No hay usuario seleccionado (es creación)
    setIsFormOpen(true); // Abre el formulario
  };

  // Manejador para abrir el formulario de edición
  const handleEditUser = (user: User) => {
    setSelectedUser(user); // Establece el usuario a editar
    setIsFormOpen(true); // Abre el formulario
  };

  // --- Función para guardar o actualizar un usuario a través de la API ---
  const handleSaveUser = async (userData: UserFormData) => {
    console.log("DEBUG: handleSaveUser iniciando. isSavingOrDeleting antes:", isSavingOrDeleting); // <-- Añade esta línea
    setIsSavingOrDeleting(true); // Se pone en true aquí
    console.log("DEBUG: isSavingOrDeleting después de set true:", true); // <-- Añade esta línea
    try {
      const isEditing = typeof userData.Id === 'number'; // Determina si es edición (si ya tiene Id)
      const method = isEditing ? "PUT" : "POST"; // Método HTTP
      const endpoint = "/api/users"; // Ruta de tu API Route de Next.js

      // Payload a enviar a tu API de C#. ¡Las claves deben ser PascalCase!
      const payload = {
          Id: isEditing ? userData.Id : undefined,
          Cedula: userData.Cedula,
          Nombre: userData.Nombre,
          Apellido: userData.Apellido,
          Email: userData.Email,
          Contrasena: userData.Contrasena || (isEditing ? undefined : "DefaultPass123"), // Contraseña: si es edición y no se cambió, undefined; si es creación y no hay, un default.
          Rol: userData.Rol,
          EspecialidadId: userData.Rol !== "Medico" ? null : (userData.EspecialidadId || null), // Si no es médico, null; si es médico, usa el valor o null
          Estatus: userData.Estatus ?? true // Usa el valor del formulario, o true por defecto
      };

      const response = await fetch(endpoint, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload), // Convierte el payload a JSON
      });

      const data = await response.json(); // Lee la respuesta de la API

      if (!response.ok) {
        throw new Error(data.message || `Fallo al ${isEditing ? "actualizar" : "crear"} el usuario.`);
      }

      toast({
        title: `Usuario ${isEditing ? "actualizado" : "creado"}`,
        description: `${data.mensaje || `El usuario ${payload.Nombre} ha sido ${isEditing ? "actualizado" : "creado"} exitosamente.`}`,
      });
      setIsFormOpen(false); // Cierra el formulario
      fetchUsers(); // Recarga la lista de usuarios para ver los cambios
    } catch (error: any) {
      console.error("DEBUG: Error en handleSaveUser:", error); // <-- Añade esta línea
      toast({
        variant: "destructive",
        title: `Error al ${isEditing ? "actualizar" : "crear"} usuario`,
        description: error.message || "Ocurrió un error al guardar el usuario.",
      });
    } finally {
      setIsSavingOrDeleting(false); // <--- Debe volver a false aquí
      console.log("DEBUG: handleSaveUser finalizando. isSavingOrDeleting después:", false); // <-- Añade esta línea
    }
  };

  // Manejador para iniciar el proceso de eliminación
  const handleDeleteUser = (user: User) => {
    setUserToDelete(user); // Establece el usuario a eliminar
    setIsDeleteDialogOpen(true); // Abre el diálogo de confirmación
  };

  // --- Función para confirmar y ejecutar la eliminación de un usuario a través de la API ---
  const confirmDeleteUser = async () => {
    if (!userToDelete) return; // Si no hay usuario a eliminar, no hacer nada

    console.log("DEBUG: confirmDeleteUser iniciando. isSavingOrDeleting antes:", isSavingOrDeleting); // <-- Añade esta línea
    setIsSavingOrDeleting(true); // Se pone en true aquí
    console.log("DEBUG: isSavingOrDeleting después de set true:", true); // <-- Añade esta línea
    try {
      // El ID se pasa como parámetro de consulta para la ruta API de Next.js (DELETE /api/users?id=...)
      const response = await fetch(`/api/users?id=${userToDelete.Id}`, {
        method: "DELETE",
      });

      const data = await response.json(); // Lee la respuesta de la API

      if (!response.ok) {
        throw new Error(data.message || "Fallo al eliminar el usuario.");
      }

      toast({
        title: "Usuario Eliminado",
        description: `${data.mensaje || `El usuario ${userToDelete.Nombre} ha sido eliminado correctamente.`}`,
      });
      setUserToDelete(null); // Limpia el usuario a eliminar
      setIsDeleteDialogOpen(false); // Cierra el diálogo de eliminación
      fetchUsers(); // Recarga la lista de usuarios
    } catch (error: any) {
      console.error("DEBUG: Error en confirmDeleteUser:", error); // <-- Añade esta línea
      toast({
        variant: "destructive",
        title: "Error al eliminar",
        description: error.message || "Ocurrió un error al eliminar el usuario.",
      });
    } finally {
      setIsSavingOrDeleting(false); // <--- Debe volver a false aquí
      console.log("DEBUG: confirmDeleteUser finalizando. isSavingOrDeleting después:", false); // <-- Añade esta línea
    }
  };

  // Función para obtener la variante del badge según el rol (usa Rol en PascalCase)
  const getRoleBadgeVariant = (rol: User["Rol"]) => {
    switch (rol) {
      case "Admin": // Coincide con 'Admin' de tu DB
        return "destructive";
      case "Medico": // Coincide con 'Medico' de tu DB
        return "default";
      case "Paciente": // Coincide con 'Paciente' de tu DB
        return "secondary";
      default:
        return "outline";
    }
  };

  // --- Renderizado Condicional: Muestra el spinner si está cargando ---
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen-minus-header">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">Cargando usuarios...</p>
      </div>
    );
  }

  // --- Renderizado Principal del Componente ---
  return (
    <>
      <PageHeader title="Gestión de Usuarios" description="Administra todas las cuentas de usuario en el sistema.">
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
            {users.length === 0 ? ( // Si no hay usuarios, muestra un mensaje
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No se encontraron usuarios con rol 'Paciente'.
                </TableCell>
              </TableRow>
            ) : (
              // Mapea los usuarios a filas de la tabla
              users.map((user) => (
                <TableRow key={user.Id}> {/* Usa user.Id (PascalCase) como clave única */}
                  <TableCell>{user.Cedula}</TableCell> {/* Muestra user.Cedula (PascalCase) */}
                  <TableCell className="font-medium">{`${user.Nombre} ${user.Apellido}`}</TableCell> {/* Combina user.Nombre y user.Apellido (PascalCase) */}
                  <TableCell>{user.Email}</TableCell> {/* Muestra user.Email (PascalCase) */}
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.Rol)} className="capitalize"> {/* Usa user.Rol (PascalCase) */}
                      {user.Rol}
                    </Badge>
                  </TableCell>
                  <TableCell>
                      <Badge variant={user.Estatus ? 'default' : 'secondary'} className="capitalize"> {/* Usa user.Estatus (PascalCase) */}
                          {user.Estatus ? 'Activo' : 'Inactivo'}
                      </Badge>
                  </TableCell>
                  <TableCell>
                    {/* Convierte la fecha de string ISO a un formato local legible */}
                    {new Date(user.FechaRegistro).toLocaleDateString("es-CO", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0" disabled={isSavingOrDeleting}>
                          <span className="sr-only">Abrir menú</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEditUser(user)} disabled={isSavingOrDeleting}>
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
        isLoading={isSavingOrDeleting} // Pasa el estado de carga al formulario
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente la cuenta de usuario de{" "}
              <span className="font-medium">{userToDelete?.Nombre} {userToDelete?.Apellido}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSavingOrDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteUser} className="bg-destructive hover:bg-destructive/90" disabled={isSavingOrDeleting}>
              {isSavingOrDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}