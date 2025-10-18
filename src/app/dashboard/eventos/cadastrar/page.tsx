import { EventRegistrationForm } from "@/components/event-registration-form";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function EventRegistrationPage() {
  return (
    <ProtectedRoute requiredPermission={{ resource: "events", action: "create" }}>
      <EventRegistrationForm />
    </ProtectedRoute>
  );
}