// studio/src/components/ChartClient.tsx
"use client";

import {
    Bar,
    BarChart,
    ResponsiveContainer,
    XAxis,
    YAxis,
    Tooltip as RechartsTooltip,
    Legend,
} from "recharts";
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

// Importamos la interfaz ApiCitasMensuales desde donde la definiste
// Asegúrate que la ruta sea correcta según donde hayas puesto el archivo page.tsx (ej. "@/app/dashboard/page")
import { ApiCitasMensuales } from "@/app/dashboard/page"; 

// La configuración de la gráfica que ya tienes, pero ajustamos los colores
const chartConfig: ChartConfig = {
    totalMes: { // Usaremos 'totalMes' como la barra principal (azul en tu dashboard)
        label: "Citas Totales",
        color: "hsl(var(--primary))", // Color azul
    },
    atendidas: { // Usaremos 'atendidas' como la barra de completadas (verde en tu dashboard)
        label: "Citas Atendidas",
        color: "hsl(var(--accent))", // Color verde
    },
    // Puedes añadir más configuraciones si quieres mostrar Confirmadas o Canceladas por separado
    // confirmadas: { label: "Confirmadas", color: "hsl(var(--blue-500))" },
    // canceladas: { label: "Canceladas", color: "hsl(var(--red-500))" },
};

// Definimos la interfaz para los props que ChartClient va a recibir
interface ChartClientProps {
    data: ApiCitasMensuales[]; // Ahora espera un array de ApiCitasMensuales
}

export default function ChartClient({ data }: ChartClientProps) {
    // Transformar los datos de la API al formato que Recharts espera
    const transformedData = data.map(item => ({
        month: item.MesNombre.substring(0, 3), // "Enero" -> "Ene", "Febrero" -> "Feb"
        // La barra 'appointments' en tu diseño original representaba el total.
        // Aquí lo mapeamos a la suma de todas las citas relevantes del mes.
        totalMes: item.Confirmadas + item.Atendidas + item.Canceladas,
        atendidas: item.Atendidas, // La barra 'completed' en tu diseño original.
        confirmadas: item.Confirmadas, // Podrías usar esto si agregas una barra para Confirmadas
        canceladas: item.Canceladas,   // Podrías usar esto si agregas una barra para Canceladas
    }));

    // Si no hay datos después de la transformación, mostramos un mensaje
    if (!transformedData || transformedData.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-muted-foreground">
                No hay datos de citas para mostrar la gráfica.
            </div>
        );
    }

    return (
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={transformedData} // Usamos los datos transformados
                    margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                >
                    <XAxis
                        dataKey="month" // Usamos 'month' como la clave de datos
                        tickLine={false}
                        axisLine={false}
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                    />
                    <YAxis
                        tickLine={false}
                        axisLine={false}
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                    />
                    <RechartsTooltip
                        cursor={false}
                        content={<ChartTooltipContent indicator="dot" />}
                    />
                    <Legend />
                    {/* dataKey="totalMes" y "atendidas" coinciden con chartConfig */}
                    <Bar dataKey="totalMes" fill="var(--color-totalMes)" radius={4} />
                    <Bar dataKey="atendidas" fill="var(--color-atendidas)" radius={4} />
                </BarChart>
            </ResponsiveContainer>
        </ChartContainer>
    );
}