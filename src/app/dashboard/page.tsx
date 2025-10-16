import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { SignOutButton } from '@/components/auth/sign-out-button';
import Image from 'next/image';

export default async function DashboardPage() {
  const supabase = await createServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      {/* Header */}
      <header className="bg-[#1e2738] border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-white">Sigelo</h1>
            <span className="text-gray-500">|</span>
            <span className="text-gray-400">Dashboard</span>
          </div>

          <div className="flex items-center gap-4">
            {session.user.user_metadata?.avatar_url && (
              <Image
                src={session.user.user_metadata.avatar_url}
                alt="Avatar"
                width={40}
                height={40}
                className="w-10 h-10 rounded-full"
              />
            )}
            <div className="text-right">
              <p className="text-white font-medium">
                {session.user.user_metadata?.full_name || session.user.email}
              </p>
              <p className="text-gray-500 text-sm">{session.user.email}</p>
            </div>
            <SignOutButton className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Bem-vindo ao Sigelo! 👋
          </h2>
          <p className="text-gray-400 text-lg">
            Sistema inteligente de gerenciamento de locação
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 - Eventos */}
          <div className="bg-[#1e2738] border border-gray-700 rounded-xl p-6 hover:border-teal-500 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-teal-500/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📅</span>
              </div>
              <h3 className="text-xl font-semibold text-white">Eventos</h3>
            </div>
            <p className="text-gray-400 mb-4">
              Gerencie todos os seus eventos e locações
            </p>
            <button className="text-teal-500 hover:text-teal-400 font-medium">
              Ver eventos →
            </button>
          </div>

          {/* Card 2 - Clientes */}
          <div className="bg-[#1e2738] border border-gray-700 rounded-xl p-6 hover:border-teal-500 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
              <h3 className="text-xl font-semibold text-white">Clientes</h3>
            </div>
            <p className="text-gray-400 mb-4">
              Cadastro e gestão de clientes
            </p>
            <button className="text-blue-500 hover:text-blue-400 font-medium">
              Ver clientes →
            </button>
          </div>

          {/* Card 3 - Veículos */}
          <div className="bg-[#1e2738] border border-gray-700 rounded-xl p-6 hover:border-teal-500 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🚗</span>
              </div>
              <h3 className="text-xl font-semibold text-white">Veículos</h3>
            </div>
            <p className="text-gray-400 mb-4">
              Controle de frota e veículos
            </p>
            <button className="text-purple-500 hover:text-purple-400 font-medium">
              Ver veículos →
            </button>
          </div>

          {/* Card 4 - Operações */}
          <div className="bg-[#1e2738] border border-gray-700 rounded-xl p-6 hover:border-teal-500 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⚙️</span>
              </div>
              <h3 className="text-xl font-semibold text-white">Operações</h3>
            </div>
            <p className="text-gray-400 mb-4">
              Mobilização e desmobilização
            </p>
            <button className="text-orange-500 hover:text-orange-400 font-medium">
              Ver operações →
            </button>
          </div>

          {/* Card 5 - Produtos/Serviços */}
          <div className="bg-[#1e2738] border border-gray-700 rounded-xl p-6 hover:border-teal-500 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📦</span>
              </div>
              <h3 className="text-xl font-semibold text-white">Produtos/Serviços</h3>
            </div>
            <p className="text-gray-400 mb-4">
              Catálogo de produtos e serviços
            </p>
            <button className="text-green-500 hover:text-green-400 font-medium">
              Ver catálogo →
            </button>
          </div>

          {/* Card 6 - Relatórios */}
          <div className="bg-[#1e2738] border border-gray-700 rounded-xl p-6 hover:border-teal-500 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold text-white">Relatórios</h3>
            </div>
            <p className="text-gray-400 mb-4">
              Análises e relatórios do sistema
            </p>
            <button className="text-pink-500 hover:text-pink-400 font-medium">
              Ver relatórios →
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl p-6">
            <p className="text-white/80 text-sm font-medium mb-1">Total de Eventos</p>
            <p className="text-white text-3xl font-bold">0</p>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6">
            <p className="text-white/80 text-sm font-medium mb-1">Clientes Ativos</p>
            <p className="text-white text-3xl font-bold">0</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6">
            <p className="text-white/80 text-sm font-medium mb-1">Veículos Disponíveis</p>
            <p className="text-white text-3xl font-bold">0</p>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6">
            <p className="text-white/80 text-sm font-medium mb-1">Operações Ativas</p>
            <p className="text-white text-3xl font-bold">0</p>
          </div>
        </div>
      </main>
    </div>
  );
}
