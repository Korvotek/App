import Link from 'next/link';

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white">
      <div className="max-w-4xl mx-auto px-8 py-16">
        <Link
          href="/login"
          className="text-blue-500 hover:text-blue-400 mb-8 inline-block"
        >
          ← Voltar
        </Link>

        <h1 className="text-4xl font-bold mb-8">Termos de Serviço</h1>

        <div className="space-y-6 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Aceitação dos Termos</h2>
            <p>
              Ao acessar e usar o Sigelo, você concorda em cumprir e estar vinculado a estes
              Termos de Serviço. Se você não concorda com alguma parte destes termos, não deve
              usar nosso serviço.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. Descrição do Serviço</h2>
            <p>
              O Sigelo é um sistema inteligente de gerenciamento de locação que oferece
              ferramentas para organização de eventos, controle de operações e gestão de
              recursos.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. Conta de Usuário</h2>
            <p>
              Para usar o Sigelo, você precisa criar uma conta usando sua conta Google. Você é
              responsável por manter a confidencialidade de sua conta e senha.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. Uso Aceitável</h2>
            <p>
              Você concorda em usar o Sigelo apenas para fins legítimos e de acordo com todas
              as leis e regulamentos aplicáveis. É proibido usar o serviço para qualquer
              atividade ilegal ou não autorizada.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              5. Propriedade Intelectual
            </h2>
            <p>
              Todo o conteúdo, recursos e funcionalidades do Sigelo são propriedade exclusiva
              da empresa e são protegidos por leis de direitos autorais e outras leis de
              propriedade intelectual.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">6. Limitação de Responsabilidade</h2>
            <p>
              O Sigelo é fornecido &ldquo;como está&rdquo; sem garantias de qualquer tipo. Não nos
              responsabilizamos por quaisquer danos diretos, indiretos, incidentais ou
              consequenciais resultantes do uso ou incapacidade de usar o serviço.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">7. Modificações</h2>
            <p>
              Reservamo-nos o direito de modificar estes termos a qualquer momento. As
              alterações entram em vigor imediatamente após a publicação no site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">8. Contato</h2>
            <p>
              Se você tiver dúvidas sobre estes Termos de Serviço, entre em contato conosco
              através dos canais de suporte disponíveis no sistema.
            </p>
          </section>

          <p className="text-sm text-gray-500 mt-12">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>
      </div>
    </div>
  );
}
