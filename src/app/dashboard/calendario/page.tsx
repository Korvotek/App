import { CalendarView } from "@/components/calendar-view";
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function CalendarPage() {
  return (
    <ProtectedRoute requiredPermission={{ resource: "operations", action: "read" }}>
      <CalendarView />
    </ProtectedRoute>
  );
}
