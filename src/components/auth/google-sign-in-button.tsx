'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { auth } from '@/lib/auth/google-auth';

interface GoogleSignInButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export function GoogleSignInButton({ className, children }: GoogleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    try {
      setIsLoading(true);

      const { error } = await auth.signInWithGoogle();

      if (error) {
        toast.error('Erro ao fazer login com Google. Tente novamente.');
      }
    } catch {
      toast.error('Erro inesperado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleSignIn}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? 'Carregando...' : children || 'Entrar com Google'}
    </button>
  );
}
