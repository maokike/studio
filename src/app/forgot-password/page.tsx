// studio/src/app/forgot-password/page.tsx
"use client";

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppLogoText, Logo } from '@/components/icons';
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link'; // Para el enlace de volver al login

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    // Validación básica del email
    if (!email) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor, ingresa tu correo electrónico.",
      });
      setIsLoading(false);
      return;
    }

    console.log("Intentando enviar solicitud de recuperación para:", email);

    try {
      // Llama a tu API Route para solicitar el token de recuperación
      const response = await fetch('/api/auth/forgot-password', { // ¡Esta será la nueva ruta API que crearemos!
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: "Instrucciones Enviadas",
          description: data.message || "Si tu correo está registrado, recibirás un enlace para restablecer tu contraseña.",
        });
        // Opcional: Podrías redirigir al login o a una página de confirmación
        // router.push('/login');
      } else {
        toast({
          variant: "destructive",
          title: "Error en la Solicitud",
          description: data.message || "No se pudo procesar la solicitud. Intenta de nuevo.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error de Conexión",
        description: "An unexpected error occurred. Please try again later.",
      });
      console.error("Error en solicitud de recuperación:", error);
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
          <CardDescription>Ingresa tu correo electrónico para restablecerla.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
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
              {isLoading ? "Enviando..." : "Enviar enlace de recuperación"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-sm">
          <p>
            <Link href="/login" passHref>
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