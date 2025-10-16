import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center space-y-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold">404</h1>
        <h2 className="text-2xl font-semibold">Página não encontrada</h2>
        <p className="text-muted-foreground mt-2">
          A página que você está procurando não existe.
        </p>
      </div>
      <Link href="/dashboard">
        <Button>Voltar ao Dashboard</Button>
      </Link>
    </div>
  );
}
