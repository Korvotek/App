"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { TableShimmer } from "@/components/ui/shimmer";
import { SearchInput } from "@/components/ui/search-input";
import { updateUserRole, deactivateUser } from "@/actions/user-actions";
import { useUsers } from "@/hooks/use-users";
import { usePagination } from "@/hooks/use-pagination";
import { useDebounce } from "@/hooks/use-debounce";
import { PermissionGate } from "@/components/auth/permission-gate";
import { toast } from "sonner";
import { 
  MoreVertical, 
  UserCheck, 
  Shield, 
  Eye, 
  UserX,
  Calendar,
  Clock,
  Mail,
  Users
} from "lucide-react";

export function UsersList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  const { data: usersData, isLoading, error } = useUsers({
    page: currentPage,
    limit: 12,
    search: debouncedSearchTerm.trim() || undefined,
  });

  const total = usersData?.totalCount || 0;
  
  const pagination = usePagination({
    initialPage: currentPage,
    initialLimit: 12,
    totalItems: total,
  });

  const users = usersData?.users || [];

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getRoleBadgeVariant = (role: string | null) => {
    switch (role) {
      case "ADMIN":
        return "destructive";
      case "OPERATOR":
        return "default";
      case "VIEWER":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getRoleLabel = (role: string | null) => {
    switch (role) {
      case "ADMIN":
        return "Administrador";
      case "OPERATOR":
        return "Operador";
      case "VIEWER":
        return "Visualizador";
      default:
        return "Sem role";
    }
  };

  const handleRoleChange = async (userId: string, newRole: "ADMIN" | "OPERATOR" | "VIEWER") => {
    try {
      await updateUserRole(userId, newRole);
      toast.success("Role atualizado com sucesso!");
      
      window.location.reload();
    } catch (error) {
      toast.error("Erro ao atualizar role do usuário");
    }
  };

  const handleDeactivateUser = async (userId: string) => {
    try {
      await deactivateUser(userId);
      toast.success("Usuário desativado com sucesso!");
      
      window.location.reload();
    } catch (error) {
      toast.error("Erro ao desativar usuário");
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Nunca";
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="w-full space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Usuários do Sistema</h1>
            <p className="text-muted-foreground text-sm">
              Gerencie os usuários e suas permissões
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1 max-w-md">
            <SearchInput
              placeholder="Buscar usuários..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <div className="text-sm text-muted-foreground">
            Carregando...
          </div>
        </div>

        <TableShimmer rows={6} columns={7} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Erro ao carregar usuários</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Usuários do Sistema</h1>
          <p className="text-muted-foreground text-sm">
            Gerencie os usuários e suas permissões
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 max-w-md">
          <SearchInput
            placeholder="Buscar usuários..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {total} usuários total
        </div>
      </div>

      
      {users.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <div className="text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm
                ? "Nenhum usuário encontrado"
                : "Nenhum usuário cadastrado"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm
                ? "Tente ajustar os termos de busca"
                : "Usuários são criados automaticamente no login"}
            </p>
          </div>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Último Login</TableHead>
              <TableHead>Última Atividade</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="relative h-8 w-8">
                      {user.picture_url ? (
                        <Image
                          src={user.picture_url}
                          alt={user.full_name || user.email}
                          width={32}
                          height={32}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <UserCheck className="h-4 w-4 text-primary" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-medium">
                        {user.full_name || "Nome não informado"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ID: {user.id.slice(0, 8)}...
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {user.email}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getRoleBadgeVariant(user.role)} className="rounded-full">
                    <Shield className="h-3 w-3 mr-1" />
                    {getRoleLabel(user.role)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={user.active ? "default" : "secondary"}
                    className="rounded-full"
                  >
                    {user.active ? "Ativo" : "Inativo"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {formatDate(user.last_login_at)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {formatDate(user.last_activity_at)}
                  </div>
                </TableCell>
                <TableCell>
                  <PermissionGate resource="users" action="update">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="rounded-lg">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleRoleChange(user.id, "ADMIN")}
                          disabled={user.role === "ADMIN"}
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          Tornar Admin
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleRoleChange(user.id, "OPERATOR")}
                          disabled={user.role === "OPERATOR"}
                        >
                          <UserCheck className="h-4 w-4 mr-2" />
                          Tornar Operador
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleRoleChange(user.id, "VIEWER")}
                          disabled={user.role === "VIEWER"}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Tornar Visualizador
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeactivateUser(user.id)}
                          className="text-destructive"
                          disabled={!user.active}
                        >
                          <UserX className="h-4 w-4 mr-2" />
                          Desativar Usuário
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </PermissionGate>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      
      {pagination.totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) {
                      handlePageChange(currentPage - 1);
                    }
                  }}
                  className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>

              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNumber;
                if (pagination.totalPages <= 5) {
                  pageNumber = i + 1;
                } else if (currentPage <= 3) {
                  pageNumber = i + 1;
                } else if (currentPage >= pagination.totalPages - 2) {
                  pageNumber = pagination.totalPages - 4 + i;
                } else {
                  pageNumber = currentPage - 2 + i;
                }

                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(pageNumber);
                      }}
                      isActive={currentPage === pageNumber}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              {pagination.totalPages > 5 && currentPage < pagination.totalPages - 2 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < pagination.totalPages) {
                      handlePageChange(currentPage + 1);
                    }
                  }}
                  className={currentPage >= pagination.totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
