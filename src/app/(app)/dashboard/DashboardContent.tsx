
"use client";

import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Stethoscope, CalendarDays, Bell } from "lucide-react";

// Dynamically import ChartClient, ensuring it's only loaded on the client-side
const ChartClient = dynamic(() => import("@/components/ChartClient"), {
  ssr: false,
});

interface MetricCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  footerText: string;
}

function MetricCard({ title, value, icon: Icon, footerText }: MetricCardProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {value.toLocaleString()}
        </div>
        <p className="text-xs text-muted-foreground">
          {footerText}
        </p>
      </CardContent>
    </Card>
  );
}

interface DashboardContentProps {
  metrics: {
    totalUsers: number;
    totalDoctors: number;
    totalAppointments: number;
    upcomingAppointments: number;
  };
  notifications: Array<{
    id: string;
    title: string;
    time: string;
    description: string;
  }>;
}

export default function DashboardContent({ metrics, notifications }: DashboardContentProps) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard 
          title="Total Users" 
          value={metrics.totalUsers} 
          icon={Users} 
          footerText="+5.2% from last month" 
        />
        <MetricCard 
          title="Total Doctors" 
          value={metrics.totalDoctors} 
          icon={Stethoscope} 
          footerText="+2.1% from last month" 
        />
        <MetricCard 
          title="Total Appointments" 
          value={metrics.totalAppointments} 
          icon={CalendarDays} 
          footerText="+10.3% from last month" 
        />
        <MetricCard 
          title="Upcoming Appointments" 
          value={metrics.upcomingAppointments} 
          icon={Bell} 
          footerText="In the next 7 days" 
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
            {/** ChartClient is now correctly dynamically imported and used here */}
            <ChartClient />
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
