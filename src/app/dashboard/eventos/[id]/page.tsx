import { EventDetails } from "@/components/event-details";
import { ProtectedRoute } from "@/components/auth/protected-route";

interface EventDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EventDetailsPage({ params }: EventDetailsPageProps) {
  const { id } = await params;

  return (
    <ProtectedRoute requiredPermission={{ resource: "events", action: "read" }}>
      <EventDetails eventId={id} />
    </ProtectedRoute>
  );
}