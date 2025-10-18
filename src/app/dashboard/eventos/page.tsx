import { EventsList } from "@/components/events-list";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function EventsPage() {
  return (
    <ProtectedRoute requiredPermission={{ resource: "events", action: "read" }}>
      <EventsList />
    </ProtectedRoute>
  );
}