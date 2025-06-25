// studio/src/app/login/page.tsx
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppLogoText, Logo } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      // Llamada a tu API Route para el login que se conecta a Somee
      const response = await fetch("/api/auth/somee-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: "Inicio de Sesión Exitoso",
          description: data.message || "¡Bienvenido de nuevo!",
        });

        // Guarda el ID y el rol del usuario en localStorage
        localStorage.setItem("userId", data.user.id);
        localStorage.setItem("userRole", data.user.rol);

        // Redirección basada en el rol
        switch (data.user.rol) {
          case "Admin":
            router.push("/dashboard");
            break;
          case "medico":
            router.push("/medico");
            break;
          case "Paciente":
            router.push("/paciente");
            break;
  
        }
      } else {
        toast({
          variant: "destructive",
          title: "Inicio de Sesión Fallido",
          description:
            data.message ||
            "Correo o contraseña inválidos. Inténtalo de nuevo.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error de Conexión",
        description:
          "Ocurrió un error inesperado al intentar iniciar sesión. Inténtalo de nuevo más tarde.",
      });
      console.error("Error al iniciar sesión:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center items-center gap-2 mb-4">
            <Logo className="h-24 w-24 text-primary" />
            {/* <AppLogoText /> */}
          </div>
          <CardTitle className="text-2xl font-headline">Login</CardTitle>
          <CardDescription>
            Ingresa tus credenciales para acceder a tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" passHref>
                  <Button
                    variant="link"
                    type="button"
                    className="p-0 h-auto text-sm text-primary hover:underline"
                    disabled={isLoading}
                  >
                    Forgot password?
                  </Button>
                </Link>
              </div>
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
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  <span className="sr-only">
                    {showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  </span>
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Iniciando sesión..." : "Login"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-sm">
          <p>
            ¿No tienes una cuenta?{" "}
            <Link href="/register" passHref>
              <Button
                variant="link"
                className="p-0 h-auto text-primary hover:underline"
                disabled={isLoading}
              >
                Regístrate
              </Button>
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
