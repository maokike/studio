// studio/src/app/register/page.tsx
"use client";

import React, { useState, type FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppLogoText, Logo } from '@/components/icons';
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


interface Specialty {
  Id: number;
  Nombre: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [cedula, setCedula] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // Si quieres que el rol inicial sea "Medico" (sin tilde), puedes cambiarlo aquí también.
  const [selectedRole, setSelectedRole] = useState('Paciente');
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState<number | null>(null);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingSpecialties, setIsFetchingSpecialties] = useState(false);

  useEffect(() => {
    // Si el rol es Paciente, la especialidad no es necesaria, así que se anula.
    if (selectedRole === 'Paciente') {
      setSelectedSpecialtyId(null);
      return;
    }

    // Si el rol es Médico y aún no se han cargado las especialidades
    // (o la lista está vacía y no estamos ya en proceso de carga)
    // Asegúrate de que el selectedRole aquí también coincida con "Medico" si lo estás usando.
    // O mejor, usa una comparación que ignore mayúsculas/minúsculas y tildes si es posible,
    // pero para este useEffect, la coincidencia literal "Medico" es lo más seguro.
    if (selectedRole === 'Medico' && !isFetchingSpecialties && specialties.length === 0) { // <--- Asegúrate que aquí también uses 'Medico' sin tilde
      const fetchSpecialties = async () => {
        setIsFetchingSpecialties(true);
        try {
          const response = await fetch('/api/Especialidad', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          const data = await response.json().catch(() => null);

          if (response.ok && Array.isArray(data)) {
            console.log('Datos desde la API de especialidades:', data);
            setSpecialties(data);

            if (data.length > 0) {
              if (selectedSpecialtyId === null || !data.some(s => s.Id === selectedSpecialtyId)) {
                setSelectedSpecialtyId(data[0].Id);
              }
            } else {
              setSelectedSpecialtyId(null);
            }
          } else {
            const errorMessage = data?.message || "No se pudieron cargar las especialidades. Verifique la conexión con el backend.";
            toast({
              variant: "destructive",
              title: "Error de carga",
              description: errorMessage,
            });
            setSelectedSpecialtyId(null);
          }
        } catch (error) {
          console.error("Error al cargar especialidades:", error);
          toast({
            variant: "destructive",
            title: "Error de Conexión",
            description: "Ocurrió un error inesperado al cargar especialidades. Verifique si el backend está activo.",
          });
          setSelectedSpecialtyId(null);
        } finally {
          setIsFetchingSpecialties(false);
        }
      };
      fetchSpecialties();
    }
  }, [selectedRole, isFetchingSpecialties, selectedSpecialtyId, specialties.length, toast]);


  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error de registro",
        description: "Las contraseñas no coinciden.",
      });
      setIsLoading(false);
      return;
    }

    // Asegúrate de que selectedRole aquí también sea "Medico" (sin tilde)
    if (selectedRole === 'Medico' && selectedSpecialtyId === null) { // <--- Aquí también usa 'Medico' sin tilde
      toast({
        variant: "destructive",
        title: "Error de registro",
        description: "Por favor, selecciona una especialidad para el rol de Médico.",
      });
      setIsLoading(false);
      return;
    }

    console.log("Intentando enviar datos de registro:", {
      cedula, nombre, apellido, email, password, rol: selectedRole, especialidadId: selectedRole === 'Medico' ? selectedSpecialtyId : null, // <--- Aquí también usa 'Medico' sin tilde
    });

    try {
      const response = await fetch('/api/Usuario', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Id: 0,
          Cedula: parseInt(cedula),
          Nombre: nombre.trim(),
          Apellido: apellido.trim(),
          Email: email,
          Contrasena: password,
          Rol: selectedRole, // Este valor vendrá directamente del SelectItem
          EspecialidadId: selectedRole === 'Medico' ? selectedSpecialtyId : null, // <--- Aquí también usa 'Medico' sin tilde
          Estatus: true,
          FechaRegistro: new Date().toISOString()
        }),
      });

      const data = await response.json().catch(() => ({ message: "Respuesta no JSON del servidor." }));

      if (response.ok && data.success) { // Asegúrate de que tu backend devuelve { success: true, ... }
        toast({
          title: "Registro Exitoso",
          description: data.message || "¡Tu cuenta ha sido creada con éxito! Ahora puedes iniciar sesión.",
        });
        router.push('/login');
      } else {
        const errorMessage = data.message || "Ocurrió un error al registrar la cuenta. Inténtalo de nuevo.";
        toast({
          variant: "destructive",
          title: "Registro Fallido",
          description: errorMessage,
        });
        console.error("Error del backend al registrar:", data);
      }
    } catch (error) {
      console.error("Error de conexión al registrar:", error);
      toast({
        variant: "destructive",
        title: "Error de Conexión",
        description: "Ocurrió un error inesperado. Por favor, intenta de nuevo más tarde.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center items-center gap-2 mb-4">
            <Logo className="h-8 w-8 text-primary" />
            <AppLogoText />
          </div>
          <CardTitle className="text-2xl font-headline">Registrarse</CardTitle>
          <CardDescription>Crea tu cuenta para acceder al sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cedula">Cédula</Label>
              <Input
                id="cedula"
                type="text"
                placeholder="Ej: 123456789"
                required
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                type="text"
                placeholder="Tu nombre"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apellido">Apellido</Label>
              <Input
                id="apellido"
                type="text"
                placeholder="Tu apellido"
                required
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Rol</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole} disabled={isLoading}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Paciente">Paciente</SelectItem>
                  {/* ***** CAMBIO CRÍTICO AQUÍ: value="Medico" (sin tilde y con M mayúscula) ***** */}
                  <SelectItem value="Medico">Médico</SelectItem> 
                </SelectContent>
              </Select>
            </div>

            {selectedRole === 'Medico' && ( // <--- Aquí también usa 'Medico' sin tilde
              <React.Fragment key="medical-specialty-field">
                <div className="space-y-2">
                  <Label htmlFor="specialty">Especialidad</Label>
                  <select
                    id="specialty"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={selectedSpecialtyId !== null ? selectedSpecialtyId.toString() : ""}
                    onChange={(e) => setSelectedSpecialtyId(e.target.value === "" ? null : parseInt(e.target.value))}
                    disabled={isLoading || isFetchingSpecialties || specialties.length === 0}
                  >
                    <option value="" disabled>
                      {isFetchingSpecialties ? "Cargando especialidades..." : (specialties.length > 0 ? "Selecciona una especialidad" : "No hay especialidades disponibles")}
                    </option>
                    {specialties.length > 0 &&
                      specialties.map((specialty) => (
                        <option key={specialty.Id} value={specialty.Id.toString()}>
                          {specialty.Nombre}
                        </option>
                      ))}
                  </select>
                </div>
              </React.Fragment>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span className="sr-only">{showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}</span>
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span className="sr-only">{showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}</span>
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Registrando..." : "Registrarse"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-sm">
          <p>
            ¿Ya tienes una cuenta?{' '}
            <Link href="/login" passHref>
              <Button
                variant="link"
                className="p-0 h-auto text-primary hover:underline"
                disabled={isLoading}
              >
                Iniciar sesión
              </Button>
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}