"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const sections = [
  { id: "inicio", label: "Inicio" },
  { id: "mis-citas", label: "Mis Citas" },
  { id: "reservar-cita", label: "Reservar Nueva Cita" },
  { id: "mi-perfil", label: "Mi Perfil" },
  { id: "historial-citas", label: "Historial de Citas" },
  { id: "notificaciones", label: "Notificaciones" },
  { id: "soporte", label: "Soporte / Ayuda" },
];

export default function PacientePortal() {
  const [activeSection, setActiveSection] = useState("inicio");
  const [proximaCita, setProximaCita] = useState<string | null>(null);
  const [totalCitas, setTotalCitas] = useState<number>(0);
  const router = useRouter();

  // 👇 Asegura que solo se ejecute en el cliente
  useEffect(() => {
    const fetchResumen = async () => {
      try {
        const rawData = sessionStorage.getItem("userData");
        if (!rawData) {
          console.warn("⚠️ userData no encontrado en sessionStorage");
          return;
        }
  
        const userData = JSON.parse(rawData);
        const pacienteId = userData.id;
  
        if (!pacienteId) {
          console.warn("⚠️ ID de paciente no encontrado en userData");
          return;
        }
  
        const response = await fetch(
          `http://localhost:44314/api/Paciente/${pacienteId}/ResumenCitas`
        );
        const data = await response.json();
        console.log("📦 Datos recibidos:", data);
        setProximaCita(data.proximaCita);
        setTotalCitas(data.totalCitas);
      } catch (error) {
        console.error("❌ Error al cargar resumen de citas:", error);
      }
    };
  
    fetchResumen();
  }, []);
  

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    sessionStorage.removeItem("userData");
    router.push("/login");
  };

  const notificaciones = ["No hay notificaciones nuevas."];
  const mensajes = ["¡Bienvenido al portal!"];
  const ofertas = [
    "Descuento en consulta de nutrición",
    "2x1 en exámenes de laboratorio este mes",
    "Chequeo dental gratis con tu próxima cita",
  ];
  const medicamentos = [
    "Paracetamol 500mg",
    "Ibuprofeno 400mg",
    "Omeprazol 20mg",
  ];
  const loQueSomos = [
    "Somos una clínica dedicada a tu bienestar.",
    "Más de 20 años de experiencia.",
    "Atención personalizada y tecnología de punta.",
  ];

  const handleMenuClick = (id: string) => setActiveSection(id);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="flex items-center justify-between bg-white shadow px-6 py-4 border-b border-border">
        <div className="flex items-center gap-4">
          <Image
            src="/Imagenes/real_logo.jpeg"
            alt="Logo"
            width={50}
            height={50}
            className="rounded-full"
          />
          <span className="text-xl font-bold text-primary tracking-wide">
            HEALTH_M&J
          </span>
        </div>
        <ul className="flex gap-6">
          {sections.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleMenuClick(section.id);
                }}
                className={`text-sm font-medium transition-colors ${
                  activeSection === section.id
                    ? "text-primary border-b-2 border-primary"
                    : "text-foreground hover:text-primary"
                }`}
              >
                {section.label}
              </a>
            </li>
          ))}
        </ul>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
        >
          Cerrar Sesión
        </button>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <section className={activeSection === "inicio" ? "block" : "hidden"}>
          <div className="bg-white shadow-md rounded-lg p-6 space-y-6">
            <h1 className="text-2xl font-bold text-primary">Bienvenido</h1>
            <div className="flex gap-12 text-sm">
              <div>
                <span className="text-muted-foreground font-medium">
                  Próxima cita:{" "}
                </span>
                <span className="font-semibold text-primary">
                  {proximaCita ?? "Ninguna"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground font-medium">
                  Total de citas:{" "}
                </span>
                <span className="font-semibold text-primary">
                  {totalCitas}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-primary font-semibold">
                  Notificaciones recientes:
                </h3>
                <ul className="list-disc ml-5 text-sm">
                  {notificaciones.map((n, i) => (
                    <li key={i}>{n}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-primary font-semibold">
                  Mensajes del sistema:
                </h3>
                <ul className="list-disc ml-5 text-sm">
                  {mensajes.map((m, i) => (
                    <li key={i}>{m}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-secondary rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-primary mb-2">Ofertas</h4>
                <ul className="list-disc ml-5 text-sm">
                  {ofertas.map((o, i) => (
                    <li key={i}>{o}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-secondary rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-primary mb-2">
                  Medicamentos
                </h4>
                <ul className="list-disc ml-5 text-sm">
                  {medicamentos.map((m, i) => (
                    <li key={i}>{m}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-secondary rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-primary mb-2">
                  Lo que somos
                </h4>
                <ul className="list-disc ml-5 text-sm">
                  {loQueSomos.map((l, i) => (
                    <li key={i}>{l}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
