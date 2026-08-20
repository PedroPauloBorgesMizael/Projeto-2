# Evolução do Sistema de Gestão de Chamados (ITSM e Manutenção Predial)

Este documento apresenta a reestruturação e a evolução arquitetural do sistema de gestão de chamados, desenvolvida em **4 fases contínuas**. O objetivo principal foi transformar uma API básica em um motor de Service Desk completo, suportando fluxos de trabalho empresariais, auditoria, controle de prazos (SLA) e inteligência analítica.

---

## 🏗️ Fase 1: Fundações, Segurança e Gestão de Domínio
O sistema precisava de uma base sólida para suportar regras de negócios escaláveis. Focamos em permissões e organização das entidades auxiliares.

* **RBAC (Controle de Acesso Baseado em Cargos):** Proteção estrutural das rotas. Agora, operações críticas validam se o usuário logado possui perfil de Administrador, Técnico ou Solicitante.
* **Soft Delete:** Refatoração da exclusão de usuários e tickets. Nenhum dado é apagado permanentemente do banco; adicionamos o conceito de `deletedAt` e `status: INACTIVE` para preservar o histórico.
* **Entidades Auxiliares:** Criação dos domínios para `Teams` (Equipes de suporte), `Categories` (Classificação do problema) e `Locations` (Andares/Setores do prédio).
* **Paginação e Filtros Avançados:** O endpoint de listagem de chamados agora suporta paginação e filtros dinâmicos cruzados, essenciais para grandes volumes de dados.

## 🗂️ Fase 2: Auditoria, Transparência e Anexos
Um sistema de manutenção exige que fotos e documentos possam ser anexados aos problemas relatados e que as ações sejam auditáveis.

* **Histórico Completo de Ações (Audit Trail):** Criação da entidade `TicketHistory`. Todas as interações em um chamado (criação, mudança de status, atribuição de técnico) são gravadas automaticamente com carimbo de tempo e o usuário responsável, gerando uma timeline confiável no endpoint `GET /tickets/:id/history`.
* **Upload de Anexos:** Configuração do `multer` para interceptação de requisições `multipart/form-data`. Os usuários agora podem anexar evidências (imagens/documentos) físicas através do endpoint `POST /tickets/:id/attachments`.

## ⏱️ Fase 3: Motor de Tempo de Resposta (SLA)
O controle do ciclo de vida dos chamados exigia garantias de resolução baseadas em prioridade.

* **Mapeamento de Prioridades:** Implementação da classe utilitária `SlaCalculator`, que define os prazos máximos para a conclusão:
  * **CRITICAL:** 4 horas
  * **HIGH:** 24 horas
  * **MEDIUM:** 3 dias
  * **LOW:** 7 dias
* **Injeção de Prazos:** Ao abrir um chamado, o sistema calcula e grava instantaneamente a `slaTargetDate`. Ao fechar (RESOLVED/CLOSED), a flag `slaBreached` é analisada em tempo real.
* **Job de Verificação Automática:** Criação da rota estratégica `/tickets/sla-check`. Otimizada via Prisma (`updateMany`), ela permite que o servidor faça uma varredura atômica assíncrona que sinaliza automaticamente qualquer chamado que superou seu tempo limite.

## 📊 Fase 4: Inteligência Analítica e Relatórios
Para munir os gestores com visão operacional, encerramos o ciclo criando entregáveis de valor analítico.

* **Dashboard de Métricas:** Consolidação do endpoint `/metrics/dashboard`, realizando processamento agregado na camada do banco para entregar em tempo real:
  * Total de chamados abertos x resolvidos.
  * Agrupamento e contagem exata por volume de Prioridade.
  * O volume da fila com SLAs atualmente violados.
* **Exportação em PDF Nativa:** Implementação da integração com a biblioteca `pdfkit`. O endpoint `/tickets/export/pdf` constrói o relatório gerencial formatado sob demanda em stream binário, efetuando o download dinâmico para o gestor sem comprometer a memória do servidor Node.js.

---

## 🛠️ Tecnologias e Padrões Adotados
* **Arquitetura MVC & Service Pattern:** Código separado responsavelmente em Controladores (Interface/HTTP), Serviços (Regras de Negócio Puras) e Repositórios (Comunicação estrita com banco de dados via Padrão *Singleton*).
* **Node.js, Express & TypeScript:** Tipagem rigorosa em 100% da compilação para garantir confiabilidade.
* **Prisma ORM:** Alta performance e queries complexas encapsuladas de forma legível.
* **Swagger:** A documentação da API foi mantida atualizada acompanhando as dezenas de novos endpoints, payloads dinâmicos (como o Multipart de anexos) e definições de retorno (como downloads binários).
