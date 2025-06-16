"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/page-header";
import DashboardContent from "./DashboardContent";
import { useToast } from "@/hooks/use-toast";
import React from "react"; // <-- ¡CRÍTICO: ASEGÚRATE DE QUE ESTA LÍNEA ESTÉ!

// --- INTERFACES QUE REFLEJAN LA ESTRUCTURA DE TU API C# ---
interface ApiMetricsNumericas {
  TotalPacientes: number;
  PacientesEsteMes: number;
  PacientesMesAnterior: number;
  TotalMedicos: number;
  TotalCitas: number;
  CitasEsteMes: number;
  CitasMesAnterior: number;
  CitasProximas: number;
}

export interface ApiCitasMensuales {
  MesNombre: string;
  MesNumero: number;
  Anio: number;
  Confirmadas: number;
  Atendidas: number;
  Canceladas: number;
}

interface ApiDashboardData {
  Metricas: ApiMetricsNumericas;
  CitasPorMes: ApiCitasMensuales[];
}

const MOCK_NOTIFICATIONS = [
  { id: "1", title: "New Patient Registration", time: "10m ago", description: "John Doe has registered." },
  { id: "2", title: "Appointment Reminder", time: "1h ago", description: "Dr. Smith has an appointment at 3 PM." },
  { id: "3", title: "System Maintenance", time: "2d ago", description: "Scheduled maintenance tonight at 12 AM." },
];

export default function DashboardPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<ApiDashboardData | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch("https://localhost:44314/api/Usuario/DashboardMetrics");

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Error ${response.status}: ${errorText}`);
        }

        const data: ApiDashboardData = await response.json();
        setDashboardData(data);
      } catch (error: any) {
        console.error("Failed to fetch dashboard data:", error);
        toast({
          variant: "destructive",
          title: "Error al cargar el dashboard",
          description: `No se pudieron obtener los datos: ${error.message || "Error desconocido"}`,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [toast]);

  // --- Función para calcular y renderizar la DIFERENCIA numérica con color y signo ---
  // ESTA ES LA FUNCIÓN CRÍTICA. EL RETURN DEBE SER JSX DIRECTO, NO UN STRING.
  const renderNumericalDifferenceValue = (current: number, previous: number) => {
    const difference = current - previous;
    const isPositive = difference >= 0;
    const colorClass = isPositive ? "text-green-500" : "text-red-500"; 
    const sign = isPositive && difference !== 0 ? "+" : ""; // Añadir '+' solo si es positivo y no cero

    return (
      // <<-- ¡ATENCIÓN A ESTA LÍNEA! DEBE SER JSX. SIN BACKTICKS ENVOLVIENDO EL SPAN. -->>
      <span className={`font-bold ${colorClass}`}>
        {`${sign}${difference.toLocaleString()}`} 
      </span>
    );
  };

  if (loading) {
    return (
      <>
        <PageHeader
          title="Dashboard"
          description="Cargando resumen del sistema..."
        />
        <div className="flex justify-center items-center h-64">
          <p>Cargando datos...</p>
        </div>
      </>
    );
  }

  if (!dashboardData) {
    return (
      <>
        <PageHeader
          title="Dashboard"
          description="No se pudieron cargar los datos."
        />
        <div className="flex justify-center items-center h-64">
          <p>Hubo un error al obtener la información del dashboard.</p>
        </div>
      </>
    );
  }

  const preparedMetrics = {
    // CAMBIO CLAVE: El valor principal de Total Users ahora es la DIFERENCIA NUMÉRICA (JSX)
    totalUsers: renderNumericalDifferenceValue(
      dashboardData.Metricas.PacientesEsteMes, 
      dashboardData.Metricas.PacientesMesAnterior
    ),
    totalDoctors: dashboardData.Metricas.TotalMedicos, // Los doctores siguen mostrando el total absoluto
    // CAMBIO CLAVE: El valor principal de Total Appointments ahora es la DIFERENCIA NUMÉRICA (JSX)
    totalAppointments: renderNumericalDifferenceValue(
      dashboardData.Metricas.CitasEsteMes, 
      dashboardData.Metricas.CitasMesAnterior
    ),
    upcomingAppointments: dashboardData.Metricas.CitasProximas, // Las citas próximas siguen siendo el total absoluto

    // --- Los footers ahora son simplemente descripciones del valor principal ---
    usersFooter: "Diferencia de pacientes (este mes vs. anterior)",
    doctorsFooter: "Total de médicos registrados", 
    appointmentsFooter: "Diferencia de citas (este mes vs. anterior)",
    upcomingFooter: "Total de citas en los próximos 7 días", 
  };

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Overview of your health management system."
      />
      <DashboardContent 
        metrics={preparedMetrics}
        notifications={MOCK_NOTIFICATIONS} 
        citasPorMes={dashboardData.CitasPorMes} 
      />
    </>
  );
}