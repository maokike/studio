"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const images = [
  "/Imagenes/banner1.png",
  "/Imagenes/banner2.png",
  "/Imagenes/banner3.png",
  "/Imagenes/banner4.png",
  "/Imagenes/banner5.png",
];

export default function HomePage() {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center">
      {/* Logotipo superior izquierdo */}
      <div className="w-full flex items-start p-4">
        <Image
          src="/Imagenes/logo.jpeg"
          alt="Logotipo"
          width={120}
          height={60}
          className="object-contain"
          priority
        />
      </div>

      {/* Banner */}
      <div className="w-full flex justify-center">
        <div className="relative w-full max-w-5xl h-64 md:h-96 overflow-hidden rounded-xl shadow-lg">
          <Image
            src={images[currentImage]}
            alt="Banner"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 80vw"
            className="object-cover"
            style={{ objectPosition: "center top" }}
          />
        </div>
      </div>

      {/* Botones */}
      <div className="mt-8 flex gap-4">
        <Link href="/login">
          <Button variant="default">Iniciar sesión</Button>
        </Link>
        <Link href="/register">
          <Button variant="outline">Registrarse</Button>
        </Link>
      </div>

      {/* Secciones informativas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-10 max-w-6xl">
        <SectionCard title="Promociones">
          Descubre nuestras ofertas especiales en consultas y exámenes de rutina.
        </SectionCard>
        <SectionCard title="Nuestros Especialistas">
          Contamos con médicos certificados en múltiples especialidades listos para ayudarte.
        </SectionCard>
        <SectionCard title="Cuidados de la Salud">
          Consejos prácticos para mejorar tu bienestar físico y mental cada día.
        </SectionCard>
      </div>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card text-card-foreground p-6 rounded-2xl shadow-md">
      <h3 className="text-xl font-semibold mb-3 text-primary">{title}</h3>
      <p className="text-muted-foreground">{children}</p>
    </div>
  );
}