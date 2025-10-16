import { AuditLogsList } from '@/components/audit-logs-list';
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function AuditPage() {
  return (
    <ProtectedRoute requiredRole="ADMIN">
      <AuditLogsList />
    </ProtectedRoute>
  );
}
