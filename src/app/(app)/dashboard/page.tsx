
import { PageHeader } from "@/components/page-header";
import DashboardContent from "./DashboardContent";

// In a real application, this data would likely be fetched from an API
const MOCK_METRICS = {
  totalUsers: 1250,
  totalDoctors: 75,
  totalAppointments: 3420,
  upcomingAppointments: 15,
};

const MOCK_NOTIFICATIONS = [
  {
    id: "1",
    title: "New Patient Registration",
    time: "10m ago",
    description: "John Doe has registered.",
  },
  {
    id: "2",
    title: "Appointment Reminder",
    time: "1h ago",
    description: "Dr. Smith has an appointment at 3 PM.",
  },
  {
    id: "3",
    title: "System Maintenance",
    time: "2d ago",
    description: "Scheduled maintenance tonight at 12 AM.",
  },
];

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Overview of your health management system."
      />
      <DashboardContent 
        metrics={MOCK_METRICS} 
        notifications={MOCK_NOTIFICATIONS} 
      />
    </>
  );
}
