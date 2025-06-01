import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { Users, Stethoscope, CalendarDays, Bell } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip as RechartsTooltip, Legend } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

const MOCK_METRICS = {
  totalUsers: 1250,
  totalDoctors: 75,
  totalAppointments: 3420,
  upcomingAppointments: 15,
};

const MOCK_APPOINTMENTS_DATA = [
  { month: "Jan", appointments: 186, completed: 80 },
  { month: "Feb", appointments: 305, completed: 200 },
  { month: "Mar", appointments: 237, completed: 120 },
  { month: "Apr", appointments: 273, completed: 190 },
  { month: "May", appointments: 209, completed: 130 },
  { month: "Jun", appointments: 214, completed: 140 },
];

const chartConfig = {
  appointments: {
    label: "Total Appointments",
    color: "hsl(var(--primary))",
  },
  completed: {
    label: "Completed",
    color: "hsl(var(--accent))",
  },
} satisfies ChartConfig;


const MOCK_NOTIFICATIONS = [
  { id: "1", title: "New Patient Registration", time: "10m ago", description: "John Doe has registered." },
  { id: "2", title: "Appointment Reminder", time: "1h ago", description: "Dr. Smith has an appointment at 3 PM." },
  { id: "3", title: "System Maintenance", time: "2d ago", description: "Scheduled maintenance tonight at 12 AM." },
];

export default function DashboardPage() {
  return (
    <>
      <PageHeader title="Dashboard" description="Overview of your health management system." />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{MOCK_METRICS.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+5.2% from last month</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Doctors</CardTitle>
            <Stethoscope className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{MOCK_METRICS.totalDoctors.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+2.1% from last month</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
            <CalendarDays className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{MOCK_METRICS.totalAppointments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+10.3% from last month</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
            <Bell className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{MOCK_METRICS.upcomingAppointments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">In the next 7 days</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-6">
        <Card className="col-span-full lg:col-span-4 shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">Appointments Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MOCK_APPOINTMENTS_DATA} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <XAxis dataKey="month" tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <RechartsTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                  <Legend />
                  <Bar dataKey="appointments" fill="var(--color-appointments)" radius={4} />
                  <Bar dataKey="completed" fill="var(--color-completed)" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="col-span-full lg:col-span-3 shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">Recent Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {MOCK_NOTIFICATIONS.map((notification) => (
                <div key={notification.id} className="flex items-start space-x-3 p-3 rounded-md hover:bg-muted/50 transition-colors">
                  <Bell className="h-5 w-5 text-primary mt-1 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{notification.title}</p>
                    <p className="text-xs text-muted-foreground">{notification.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
