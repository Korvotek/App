"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { auth } from "@/lib/auth/google-auth";

interface SignOutButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export function SignOutButton({ className, children }: SignOutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await auth.signOut();

      if (error) {
        toast.error("Erro ao fazer logout. Tente novamente.");
      } else {
        toast.success("Logout realizado com sucesso!");
        router.push("/");
        router.refresh();
      }
    } catch {
      toast.error("Erro inesperado. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button onClick={handleSignOut} disabled={isLoading} className={className}>
      {isLoading ? "Saindo..." : children || "Sair"}
    </button>
  );
}
