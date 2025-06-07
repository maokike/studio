// studio/src/app/register/page.tsx
"use client";

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppLogoText, Logo } from '@/components/icons';
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link'; // Importa Link para el enlace de "Ya tienes cuenta"

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [cedula, setCedula] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

    try {
      // Llama a tu API Route para el registro
      const response = await fetch('/api/auth/register', { // ¡Esta es la ruta API que creamos!
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cedula,
          nombre,
          apellido,
          email,
          password, // Recuerda: ¡Hashing en el backend es CRÍTICO!
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: "Registro Exitoso",
          description: data.message || "¡Tu cuenta ha sido creada con éxito! Ahora puedes iniciar sesión.",
        });
        router.push('/login'); // Redirige al login después de un registro exitoso
      } else {
        toast({
          variant: "destructive",
          title: "Registro Fallido",
          description: data.message || "Ocurrió un error al registrar la cuenta. Inténtalo de nuevo.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error de Conexión",
        description: "Ocurrió un error inesperado. Por favor, intenta de nuevo más tarde.",
      });
      console.error("Error de registro:", error);
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
          <form onSubmit={handleSubmit} className="space-y-4"> {/* Reducido el espacio para más campos */}
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
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  placeholder="••••••••"
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
                  disabled={isLoading}
                  placeholder="••••••••"
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