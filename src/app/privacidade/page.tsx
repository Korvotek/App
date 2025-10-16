import Link from 'next/link';

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white">
      <div className="max-w-4xl mx-auto px-8 py-16">
        <Link
          href="/login"
          className="text-blue-500 hover:text-blue-400 mb-8 inline-block"
        >
          ← Voltar
        </Link>

        <h1 className="text-4xl font-bold mb-8">Política de Privacidade</h1>

        <div className="space-y-6 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Informações que Coletamos</h2>
            <p>
              Coletamos informações que você nos fornece diretamente, como nome, e-mail e foto
              de perfil através da autenticação Google. Também coletamos informações sobre seu
              uso do serviço, incluindo logs de acesso e dados de interação.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. Como Usamos suas Informações</h2>
            <p>Usamos as informações coletadas para:</p>
            <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
              <li>Fornecer, manter e melhorar nossos serviços</li>
              <li>Processar e completar transações</li>
              <li>Enviar informações técnicas e atualizações</li>
              <li>Responder a comentários e perguntas</li>
              <li>Proteger contra fraudes e abusos</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. Compartilhamento de Informações</h2>
            <p>
              Não vendemos suas informações pessoais. Podemos compartilhar suas informações
              apenas nas seguintes situações:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
              <li>Com seu consentimento explícito</li>
              <li>Para cumprir obrigações legais</li>
              <li>Com provedores de serviços que nos ajudam a operar o sistema</li>
              <li>Em caso de fusão, venda ou transferência de ativos da empresa</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. Segurança dos Dados</h2>
            <p>
              Implementamos medidas de segurança técnicas e organizacionais para proteger suas
              informações pessoais. Isso inclui criptografia de dados, controles de acesso e
              auditorias regulares de segurança.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. Autenticação Google</h2>
            <p>
              Usamos o Google OAuth para autenticação. Quando você faz login com o Google,
              recebemos apenas informações básicas do perfil (nome, e-mail, foto). Não temos
              acesso à sua senha do Google.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">6. Cookies e Tecnologias Similares</h2>
            <p>
              Usamos cookies e tecnologias similares para manter você conectado, lembrar suas
              preferências e analisar o uso do serviço. Você pode controlar cookies através das
              configurações do seu navegador.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">7. Seus Direitos</h2>
            <p>Você tem o direito de:</p>
            <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
              <li>Acessar suas informações pessoais</li>
              <li>Corrigir dados incorretos ou incompletos</li>
              <li>Solicitar a exclusão de suas informações</li>
              <li>Exportar seus dados em formato legível</li>
              <li>Revogar consentimentos previamente dados</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">8. Retenção de Dados</h2>
            <p>
              Mantemos suas informações pessoais apenas pelo tempo necessário para cumprir os
              propósitos descritos nesta política, a menos que um período de retenção mais
              longo seja exigido por lei.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">9. LGPD - Lei Geral de Proteção de Dados</h2>
            <p>
              Estamos comprometidos em cumprir a LGPD (Lei nº 13.709/2018) e proteger seus
              direitos de privacidade conforme estabelecido pela legislação brasileira.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">10. Alterações nesta Política</h2>
            <p>
              Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você
              sobre mudanças significativas por e-mail ou através de um aviso destacado no
              serviço.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">11. Contato</h2>
            <p>
              Para questões sobre esta Política de Privacidade ou para exercer seus direitos,
              entre em contato através dos canais de suporte disponíveis no sistema.
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
