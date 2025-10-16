"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { AuthStatus } from "@/components/auth/auth-status";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get("access_token");
    const refreshToken = hashParams.get("refresh_token");

    if (accessToken) {
      supabase.auth
        .setSession({
          access_token: accessToken,
          refresh_token: refreshToken || "",
        })
        .then(({ error }) => {
          if (!error) {
            setTimeout(() => {
              window.location.href = "/dashboard";
            }, 1000);
          }
        });
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <div className="w-full max-w-5xl h-[75vh] bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden flex">
        {/* Left Panel - Branding */}
        <div
          className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-center text-white"
          style={{
            background:
              "linear-gradient(135deg, rgb(54, 209, 197) 0%, rgb(43, 193, 181) 100%)",
          }}
        >
          <div>
            <h1 className="text-6xl font-bold mb-6">Sigelo</h1>
            <p className="text-xl text-white/90 leading-relaxed">
              Sistema inteligente de gerenciamento de locação
            </p>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Entrar
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Use sua conta Google para acessar
              </p>
            </div>

            {/* Google Sign In Button */}
            <GoogleSignInButton className="w-full bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-medium py-3 px-4 rounded-lg border border-gray-300 dark:border-gray-700 transition-colors duration-200 flex items-center justify-center gap-3 shadow-sm">
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continuar com Google
            </GoogleSignInButton>

            {/* Terms and Privacy */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
              <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                Ao continuar, você concorda com nossos{" "}
                <Link
                  href="/termos"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Termos de Serviço
                </Link>{" "}
                e{" "}
                <Link
                  href="/privacidade"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Política de Privacidade
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Status Badge */}
      <AuthStatus />
    </div>
  );
}
