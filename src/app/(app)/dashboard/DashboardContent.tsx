"use client";

import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Stethoscope, CalendarDays, Bell } from "lucide-react";
import { ApiCitasMensuales } from "./page"; 
import React from "react"; // <-- ¡CRÍTICO: ASEGÚRATE DE QUE ESTA LÍNEA ESTÉ!

const ChartClient = dynamic(() => import("@/components/ChartClient"), {
    ssr: false,
});

interface MetricCardProps {
    title: string;
    // CAMBIO CLAVE: 'value' AHORA PUEDE SER UN NÚMERO O UN ELEMENTO REACT (JSX)
    value: number | React.ReactNode; 
    icon: React.ElementType;
    // 'footerText' también puede ser un elemento React (JSX)
    footerText: React.ReactNode; 
}

function MetricCard({ title, value, icon: Icon, footerText }: MetricCardProps) {
    return (
        <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {/* // Aquí se renderiza el valor principal.
                // Si 'value' es un número, lo formateamos. Si es un JSX, React lo renderiza directamente. */}
                <div className="text-2xl"> 
                    {typeof value === 'number' ? value.toLocaleString() : value}
                </div>
                {/* // Renderizamos el footerText directamente. Su tipo 'React.ReactNode' asegura que el JSX se interprete. */}
                <p className="text-xs text-muted-foreground">
                    {footerText} 
                </p>
            </CardContent>
        </Card>
    );
}

interface DashboardContentProps {
    metrics: {
        // CAMBIO CLAVE: totalUsers y totalAppointments DEBEN aceptar React.ReactNode para los valores principales
        totalUsers: number | React.ReactNode; 
        totalDoctors: number;
        totalAppointments: number | React.ReactNode; 
        upcomingAppointments: number;
        // Los footers también aceptan React.ReactNode
        usersFooter: React.ReactNode; 
        doctorsFooter: React.ReactNode; 
        appointmentsFooter: React.ReactNode; 
        upcomingFooter: React.ReactNode; 
    };
    notifications: Array<{
        id: string;
        title: string;
        time: string;
        description: string;
    }>;
    citasPorMes: ApiCitasMensuales[];
}

export default function DashboardContent({ metrics, notifications, citasPorMes }: DashboardContentProps) {
    return (
        <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard 
                    title="Total Users" 
                    value={metrics.totalUsers} 
                    icon={Users} 
                    footerText={metrics.usersFooter} 
                />
                <MetricCard 
                    title="Total Doctors" 
                    value={metrics.totalDoctors} 
                    icon={Stethoscope} 
                    footerText={metrics.doctorsFooter} 
                />
                <MetricCard 
                    title="Total Appointments" 
                    value={metrics.totalAppointments} 
                    icon={CalendarDays} 
                    footerText={metrics.appointmentsFooter} 
                />
                <MetricCard 
                    title="Upcoming Appointments" 
                    value={metrics.upcomingAppointments} 
                    icon={Bell} 
                    footerText={metrics.upcomingFooter} 
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-6">
                <Card className="col-span-full lg:col-span-4 shadow-lg">
                    <CardHeader>
                        <CardTitle className="font-headline">
                            Appointments Overview
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ChartClient data={citasPorMes} /> 
                    </CardContent>
                </Card>

                <Card className="col-span-full lg:col-span-3 shadow-lg">
                    <CardHeader>
                        <CardTitle className="font-headline">
                            Recent Notifications
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className="flex items-start space-x-3 p-3 rounded-md hover:bg-muted/50 transition-colors"
                                >
                                    <Bell className="h-5 w-5 text-primary mt-1 shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium">
                                            {notification.title}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {notification.description}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {notification.time}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {notifications.length === 0 && (
                                <p className="text-sm text-muted-foreground">No new notifications.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
} 