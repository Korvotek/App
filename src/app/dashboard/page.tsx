import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Users,
  Car,
  Settings,
  Package,
  UserPlus,
  TrendingUp,
  Activity,
} from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  const stats = [
    {
      title: "Total de Eventos",
      value: "0",
      icon: Calendar,
      color: "text-blue-600",
    },
    {
      title: "Clientes Ativos",
      value: "0",
      icon: Users,
      color: "text-green-600",
    },
    {
      title: "Funcionários",
      value: "0",
      icon: UserPlus,
      color: "text-yellow-600",
    },
    {
      title: "Veículos Disponíveis",
      value: "0",
      icon: Car,
      color: "text-purple-600",
    },
  ];

  const quickActions = [
    {
      title: "Eventos",
      description: "Gerencie todos os seus eventos e locações",
      href: "/dashboard/eventos",
      icon: Calendar,
      color: "bg-blue-500/10 text-blue-600 border-blue-200",
    },
    {
      title: "Clientes",
      description: "Cadastro e gestão de clientes",
      href: "/dashboard/clientes",
      icon: Users,
      color: "bg-green-500/10 text-green-600 border-green-200",
    },
    {
      title: "Funcionários",
      description: "Cadastro e gestão de funcionários",
      href: "/dashboard/funcionarios",
      icon: UserPlus,
      color: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
    },
    {
      title: "Veículos",
      description: "Controle de frota e veículos",
      href: "/dashboard/veiculos",
      icon: Car,
      color: "bg-purple-500/10 text-purple-600 border-purple-200",
    },
    {
      title: "Operações",
      description: "Mobilização e desmobilização",
      href: "/dashboard/operacoes",
      icon: Settings,
      color: "bg-orange-500/10 text-orange-600 border-orange-200",
    },
    {
      title: "Produtos/Serviços",
      description: "Catálogo de produtos e serviços",
      href: "/dashboard/produtos",
      icon: Package,
      color: "bg-teal-500/10 text-teal-600 border-teal-200",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Bem-vindo ao Sigelo! 👋
        </h1>
        <p className="text-muted-foreground text-lg">
          Sistema inteligente de gerenciamento de locação
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                +0% em relação ao mês passado
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Ações Rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action) => (
            <Card
              key={action.title}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${action.color}`}>
                    <action.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg">{action.title}</CardTitle>
                </div>
                <CardDescription>{action.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={action.href}>
                  <Button variant="outline" className="w-full">
                    Acessar
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Atividade Recente
        </h2>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Últimas Atividades</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Sistema inicializado</p>
                  <p className="text-xs text-muted-foreground">Agora mesmo</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Usuário logado</p>
                  <p className="text-xs text-muted-foreground">
                    Há alguns minutos
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
