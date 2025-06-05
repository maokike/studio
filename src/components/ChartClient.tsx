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

// Si deseas usar los datos y la configuración que ya tienes,
const MOCK_APPOINTMENTS_DATA = [
  { month: "Jan", appointments: 186, completed: 80 },
  { month: "Feb", appointments: 305, completed: 200 },
  { month: "Mar", appointments: 237, completed: 120 },
  { month: "Apr", appointments: 273, completed: 190 },
  { month: "May", appointments: 209, completed: 130 },
  { month: "Jun", appointments: 214, completed: 140 },
];

const chartConfig: ChartConfig = {
  appointments: {
    label: "Total Appointments",
    color: "hsl(var(--primary))",
  },
  completed: {
    label: "Completed",
    color: "hsl(var(--accent))",
  },
};

export default function ChartClient() {
  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={MOCK_APPOINTMENTS_DATA}
          margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
        >
          <XAxis
            dataKey="month"
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
          <Bar dataKey="appointments" fill="var(--color-appointments)" radius={4} />
          <Bar dataKey="completed" fill="var(--color-completed)" radius={4} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
