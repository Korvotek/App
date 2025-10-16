import { UsersList } from '@/components/users-list';
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function UsersPage() {
  return (
    <ProtectedRoute requiredRole="ADMIN">
      <UsersList />
    </ProtectedRoute>
  );
}
