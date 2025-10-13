import React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TermsStepProps {
  termsAccepted: boolean;
  onTermsChange: (accepted: boolean) => void;
  onNext: () => void;
}

export const TermsStep: React.FC<TermsStepProps> = ({
  termsAccepted,
  onTermsChange,
  onNext,
}) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Termos e Condições</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg max-h-64 overflow-y-auto text-sm">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-foreground mb-3">
                Política Privacidade
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  A sua privacidade é importante para nós. É política do Tikko
                  respeitar a sua privacidade em relação a qualquer informação
                  sua que possamos coletar no site{" "}
                  <a
                    href="https://www.tikko.com.br"
                    className="text-primary underline"
                  >
                    Tikko
                  </a>
                  , e outros sites que possuímos e operamos.
                </p>
                <p>
                  Solicitamos informações pessoais apenas quando realmente
                  precisamos delas para lhe fornecer um serviço. Fazemo-lo por
                  meios justos e legais, com o seu conhecimento e consentimento.
                  Também informamos por que estamos coletando e como será usado.
                </p>
                <p>
                  Apenas retemos as informações coletadas pelo tempo necessário
                  para fornecer o serviço solicitado. Quando armazenamos dados,
                  protegemos dentro de meios comercialmente aceitáveis ​​para
                  evitar perdas e roubos, bem como acesso, divulgação, cópia,
                  uso ou modificação não autorizados.
                </p>
                <p>
                  Não compartilhamos informações de identificação pessoal
                  publicamente ou com terceiros, exceto quando exigido por lei.
                </p>
                <p>
                  O nosso site pode ter links para sites externos que não são
                  operados por nós. Esteja ciente de que não temos controle
                  sobre o conteúdo e práticas desses sites e não podemos aceitar
                  responsabilidade por suas respectivas{" "}
                  <a
                    href="https://politicaprivacidade.com/"
                    className="text-primary underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    políticas de privacidade
                  </a>
                  .
                </p>
                <p>
                  Você é livre para recusar a nossa solicitação de informações
                  pessoais, entendendo que talvez não possamos fornecer alguns
                  dos serviços desejados.
                </p>
                <p>
                  O uso continuado de nosso site será considerado como aceitação
                  de nossas práticas em torno de privacidade e informações
                  pessoais. Se você tiver alguma dúvida sobre como lidamos com
                  dados do usuário e informações pessoais, entre em contacto
                  connosco.
                </p>

                <h3 className="text-base font-semibold text-foreground mt-4 mb-2">
                  Compromisso do Usuário
                </h3>
                <p>
                  O usuário se compromete a fazer uso adequado dos conteúdos e
                  da informação que o Tikko oferece no site e com caráter
                  enunciativo, mas não limitativo:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    A) Não se envolver em atividades que sejam ilegais ou
                    contrárias à boa fé a à ordem pública;
                  </li>
                  <li>
                    B) Não difundir propaganda ou conteúdo de natureza racista,
                    xenofóbica, jogos de sorte ou azar, qualquer tipo de
                    pornografia ilegal, de apologia ao terrorismo ou contra os
                    direitos humanos;
                  </li>
                  <li>
                    C) Não causar danos aos sistemas físicos (hardwares) e
                    lógicos (softwares) do Tikko, de seus fornecedores ou
                    terceiros, para introduzir ou disseminar vírus informáticos
                    ou quaisquer outros sistemas de hardware ou software que
                    sejam capazes de causar danos anteriormente mencionados.
                  </li>
                </ul>

                <h3 className="text-base font-semibold text-foreground mt-4 mb-2">
                  Mais informações
                </h3>
                <p>
                  Esperemos que esteja esclarecido e, como mencionado
                  anteriormente, se houver algo que você não tem certeza se
                  precisa ou não, geralmente é mais seguro deixar os cookies
                  ativados, caso interaja com um dos recursos que você usa em
                  nosso site.
                </p>
                <p>Esta política é efetiva a partir de 13 October 2025 14:20</p>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3">
                Termos de Serviço
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <h3 className="text-base font-semibold text-foreground">
                  1. Termos
                </h3>
                <p>
                  Ao acessar ao site{" "}
                  <a
                    href="https://www.tikko.com.br"
                    className="text-primary underline"
                  >
                    Tikko
                  </a>
                  , concorda em cumprir estes termos de serviço, todas as leis e
                  regulamentos aplicáveis ​​e concorda que é responsável pelo
                  cumprimento de todas as leis locais aplicáveis. Se você não
                  concordar com algum desses termos, está proibido de usar ou
                  acessar este site. Os materiais contidos neste site são
                  protegidos pelas leis de direitos autorais e marcas comerciais
                  aplicáveis.
                </p>

                <h3 className="text-base font-semibold text-foreground mt-4">
                  2. Uso de Licença
                </h3>
                <p>
                  É concedida permissão para baixar temporariamente uma cópia
                  dos materiais (informações ou software) no site Tikko, apenas
                  para visualização transitória pessoal e não comercial. Esta é
                  a concessão de uma licença, não uma transferência de título e,
                  sob esta licença, você não pode:
                </p>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>modificar ou copiar os materiais;</li>
                  <li>
                    usar os materiais para qualquer finalidade comercial ou para
                    exibição pública (comercial ou não comercial);
                  </li>
                  <li>
                    tentar descompilar ou fazer engenharia reversa de qualquer
                    software contido no site Tikko;
                  </li>
                  <li>
                    remover quaisquer direitos autorais ou outras notações de
                    propriedade dos materiais; ou
                  </li>
                  <li>
                    transferir os materiais para outra pessoa ou 'espelhe' os
                    materiais em qualquer outro servidor.
                  </li>
                </ol>
                <p>
                  Esta licença será automaticamente rescindida se você violar
                  alguma dessas restrições e poderá ser rescindida por Tikko a
                  qualquer momento. Ao encerrar a visualização desses materiais
                  ou após o término desta licença, você deve apagar todos os
                  materiais baixados em sua posse, seja em formato eletrónico ou
                  impresso.
                </p>

                <h3 className="text-base font-semibold text-foreground mt-4">
                  3. Isenção de responsabilidade
                </h3>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>
                    Os materiais no site da Tikko são fornecidos 'como estão'.
                    Tikko não oferece garantias, expressas ou implícitas, e, por
                    este meio, isenta e nega todas as outras garantias,
                    incluindo, sem limitação, garantias implícitas ou condições
                    de comercialização, adequação a um fim específico ou não
                    violação de propriedade intelectual ou outra violação de
                    direitos.
                  </li>
                  <li>
                    Além disso, o Tikko não garante ou faz qualquer
                    representação relativa à precisão, aos resultados prováveis
                    ​​ou à confiabilidade do uso dos materiais em seu site ou de
                    outra forma relacionado a esses materiais ou em sites
                    vinculados a este site.
                  </li>
                </ol>

                <h3 className="text-base font-semibold text-foreground mt-4">
                  4. Limitações
                </h3>
                <p>
                  Em nenhum caso o Tikko ou seus fornecedores serão responsáveis
                  ​​por quaisquer danos (incluindo, sem limitação, danos por
                  perda de dados ou lucro ou devido a interrupção dos negócios)
                  decorrentes do uso ou da incapacidade de usar os materiais em
                  Tikko, mesmo que Tikko ou um representante autorizado da Tikko
                  tenha sido notificado oralmente ou por escrito da
                  possibilidade de tais danos. Como algumas jurisdições não
                  permitem limitações em garantias implícitas, ou limitações de
                  responsabilidade por danos conseqüentes ou incidentais, essas
                  limitações podem não se aplicar a você.
                </p>

                <h3 className="text-base font-semibold text-foreground mt-4">
                  5. Precisão dos materiais
                </h3>
                <p>
                  Os materiais exibidos no site da Tikko podem incluir erros
                  técnicos, tipográficos ou fotográficos. Tikko não garante que
                  qualquer material em seu site seja preciso, completo ou atual.
                  Tikko pode fazer alterações nos materiais contidos em seu site
                  a qualquer momento, sem aviso prévio. No entanto, Tikko não se
                  compromete a atualizar os materiais.
                </p>

                <h3 className="text-base font-semibold text-foreground mt-4">
                  6. Links
                </h3>
                <p>
                  O Tikko não analisou todos os sites vinculados ao seu site e
                  não é responsável pelo conteúdo de nenhum site vinculado. A
                  inclusão de qualquer link não implica endosso por Tikko do
                  site. O uso de qualquer site vinculado é por conta e risco do
                  usuário.
                </p>

                <h3 className="text-base font-semibold text-foreground mt-4">
                  Modificações
                </h3>
                <p>
                  O Tikko pode revisar estes termos de serviço do site a
                  qualquer momento, sem aviso prévio. Ao usar este site, você
                  concorda em ficar vinculado à versão atual desses termos de
                  serviço.
                </p>

                <h3 className="text-base font-semibold text-foreground mt-4">
                  Lei aplicável
                </h3>
                <p>
                  Estes termos e condições são regidos e interpretados de acordo
                  com as leis do Tikko e você se submete irrevogavelmente à
                  jurisdição exclusiva dos tribunais naquele estado ou
                  localidade.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="terms"
              checked={termsAccepted}
              onCheckedChange={(checked) => onTermsChange(checked as boolean)}
            />
            <label
              htmlFor="terms"
              className="text-sm text-foreground leading-relaxed"
            >
              Eu li e concordo com os{" "}
              <span className="text-primary underline cursor-pointer">
                Termos de Serviço
              </span>{" "}
              e a{" "}
              <span className="text-primary underline cursor-pointer">
                Política de Privacidade
              </span>
            </label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
