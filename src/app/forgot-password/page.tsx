"use client";

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppLogoText, Logo } from '@/components/icons';
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();

  // Estados para el flujo
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Paso 1: Verificar correo
  const handleEmailSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      // SOLO ENVÍA EL CORREO en minúsculas
      const response = await fetch('https://localhost:44314/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }), // <-- minúsculas
      });
      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: "Correo verificado",
          description: "Ahora ingresa tu ID de usuario y la nueva contraseña.",
        });
        setStep(2);
      } else {
        toast({
          variant: "destructive",
          title: "Correo no encontrado",
          description: data.message || "El correo no está registrado.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error de Conexión",
        description: "Ocurrió un error inesperado. Intenta más tarde.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Paso 2: Validar ID y cambiar contraseña
  const handleResetSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      // ENVÍA Email, Id y newPassword (con mayúsculas)
      const response = await fetch('https://localhost:44314/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Email: email, Id: userId, newPassword }),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: "Contraseña actualizada",
          description: "Ya puedes iniciar sesión con tu nueva contraseña.",
        });
        router.push('/login');
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.message || "No se pudo actualizar la contraseña.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error de Conexión",
        description: "Ocurrió un error inesperado. Intenta más tarde.",
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
          <CardTitle className="text-2xl font-headline">¿Olvidaste tu contraseña?</CardTitle>
          <CardDescription>
            {step === 1
              ? "Ingresa tu correo electrónico para verificar tu identidad."
              : "Ingresa tu ID de usuario y la nueva contraseña."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 ? (
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
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
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Verificando..." : "Verificar correo"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleResetSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="userId">ID de Usuario</Label>
                <Input
                  id="userId"
                  type="text"
                  placeholder="Ej: 123"
                  required
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nueva contraseña</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Nueva contraseña"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Actualizando..." : "Actualizar contraseña"}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="text-center text-sm">
          <p>
            <Link href="/login">
              <Button
                variant="link"
                className="p-0 h-auto text-primary hover:underline"
                disabled={isLoading}
              >
                Volver al inicio de sesión
              </Button>
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}