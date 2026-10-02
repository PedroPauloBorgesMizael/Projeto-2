# 🏢 HelpHome - Sistema de Gestão de Manutenção Predial

[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4+-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

O **HelpHome** é uma plataforma Full Stack moderna para gerenciamento e automação de chamados de manutenção predial e suporte técnico de facilities. O sistema integra solicitantes (moradores/clientes), técnicos de campo, gestores e administradores em um único ecossistema centralizado.

> 📖 **Documentação Arquitetural Completa:** Para consultar o detalhamento de regras de negócio, modelagem de banco (ERD) e especificações técnicas de cada módulo, veja o arquivo [`DOCUMENTACAO_DO_SISTEMA.md`](./DOCUMENTACAO_DO_SISTEMA.md).

---

## 📑 Sumário

* [🐳 Como Subir o Projeto com Docker (Passo a Passo)](#-como-subir-o-projeto-com-docker-passo-a-passo)
  * [1. Pré-requisitos](#1-pré-requisitos)
  * [2. Configurar o arquivo `.env`](#2-configurar-o-arquivo-env)
  * [3. Subir os Containers](#3-subir-os-containers)
  * [4. Verificar se os Containers Estão Rodando](#4-verificar-se-os-containers-estão-rodando)
  * [5. Popular o Banco com Dados de Teste (Seed)](#5-popular-o-banco-com-dados-de-teste-seed)
  * [6. Acessar o Sistema no Navegador](#6-acessar-o-sistema-no-navegador)
  * [7. Acompanhar Logs e Comandos Úteis do Docker](#7-acompanhar-logs-e-comandos-úteis-do-docker)
  * [8. Resolução de Problemas Comuns (Troubleshooting)](#8-resolução-de-problemas-comuns-troubleshooting)
* [🔑 Credenciais de Acesso para Teste (Seed)](#-credenciais-de-acesso-para-teste-seed)
* [💻 Execução Local sem Docker](#-execução-local-sem-docker)
* [🚀 Tecnologias Utilizadas](#-tecnologias-utilizadas)
* [🎯 Funcionalidades do Sistema](#-funcionalidades-do-sistema)
* [⚙️ Variáveis de Ambiente](#️-variáveis-de-ambiente)
* [🔌 Principais Endpoints da API](#-principais-endpoints-da-api)
* [📁 Estrutura do Repositório](#-estrutura-do-repositório)

---

## 🐳 Como Subir o Projeto com Docker (Passo a Passo)

Esta é a **forma recomendada** para rodar o projeto. O Docker Compose orquestra automaticamente:
1. **PostgreSQL 16**: Banco de dados relacional configurado com persistência de dados.
2. **Backend (API Node.js/Express/Prisma)**: Roda as migrations automaticamente e expõe os endpoints na porta `3000`.
3. **Frontend (React 19 + Vite + Nginx)**: Faz o build estático otimizado e serve a interface na porta `5173`.

---

### 1. Pré-requisitos

Antes de iniciar, certifique-se de ter instalado:
* **Docker Desktop** (no Windows ou macOS) ou **Docker Engine + Docker Compose** (no Linux).
  * ⚠️ **Atenção no Windows:** Abra o **Docker Desktop** e aguarde até que o ícone fique verde indicando que o Docker Engine está ativo.

---

### 2. Configurar o arquivo `.env`

Na pasta raiz do projeto (`Projeto-2`), crie o arquivo `.env` a partir do modelo de exemplo:

* **No Windows (PowerShell):**
  ```powershell
  Copy-Item .env.example .env
  ```

* **No Windows (Prompt de Comando / CMD):**
  ```cmd
  copy .env.example .env
  ```

* **No Linux / macOS (Terminal Bash/Zsh):**
  ```bash
  cp .env.example .env
  ```

> 💡 **Nota:** As configurações padrão do `.env.example` já estão 100% ajustadas e prontas para rodar no Docker! Não é necessário alterar nenhum valor para subir a aplicação pela primeira vez.

---

### 3. Subir os Containers

Na raiz do projeto (onde está localizado o arquivo `docker-compose.yml`), execute o comando de compilação e inicialização:

```bash
docker compose up --build -d
```

*(Caso use uma versão mais antiga do Docker Compose, utilize `docker-compose up --build -d`)*

#### O que este comando faz automaticamente?
1. Baixa a imagem do **PostgreSQL 16 Alpine** e inicia o banco de dados.
2. Aguarda o PostgreSQL ficar saudável (*healthcheck* ativo).
3. Compila a aplicação do **Backend**, executa as migrations do Prisma (`prisma migrate deploy`) e inicia a API na porta `3000`.
4. Compila o **Frontend Web**, configura o servidor **Nginx** e o disponibiliza na porta `5173`.

---

### 4. Verificar se os Containers Estão Rodando

Para confirmar se todos os serviços subiram sem erros, execute:

```bash
docker compose ps
```

Você deverá ver os 3 serviços com status `Up` / `healthy`:
* `helphome-postgres` (porta `5433:5432`)
* `helphome-backend` (porta `3000:3000`)
* `helphome-frontend` (porta `5173:80`)

---

### 5. Popular o Banco com Dados de Teste (Seed)

Para cadastrar automaticamente os usuários de teste, equipes, categorias, localizações e chamados de exemplo, execute:

```bash
docker compose exec backend npm run prisma:seed
```

Você verá no terminal a confirmação:
```text
🌱 Iniciando seed...
🧹 Limpando banco de dados...
🌱 Criando Categorias e Localizações...
👤 Criando Usuários...
🏢 Criando Equipes e vinculando membros...
🎫 Criando Chamados e Comentários...
✅ Seed finalizado com sucesso!
```

---

### 6. Acessar o Sistema no Navegador

Após concluir os passos acima, basta abrir as URLs no seu navegador:

| Serviço | URL de Acesso | Descrição |
| :--- | :--- | :--- |
| 🌐 **Frontend Web (Interface)** | [http://localhost:5173](http://localhost:5173) | Painel visual para login, chamados e configurações |
| 🔌 **API REST (Backend)** | [http://localhost:3000](http://localhost:3000) | Ponto de entrada da API REST |
| 📚 **Documentação Swagger** | [http://localhost:3000/docs](http://localhost:3000/docs) | Interface interativa com todos os endpoints |
| 🗄️ **Banco PostgreSQL** | `localhost:5433` | Host: `localhost`, Porta: `5433`, Usuário: `admin`, Senha: `admin123`, DB: `help_home` |

---

### 7. Acompanhar Logs e Comandos Úteis do Docker

* **Visualizar os logs de todos os containers em tempo real:**
  ```bash
  docker compose logs -f
  ```

* **Visualizar logs apenas do Backend:**
  ```bash
  docker compose logs -f backend
  ```

* **Visualizar logs apenas do Frontend:**
  ```bash
  docker compose logs -f frontend
  ```

* **Reiniciar um container específico (ex: backend):**
  ```bash
  docker compose restart backend
  ```

* **Parar todos os containers mantendo os dados salvos:**
  ```bash
  docker compose stop
  ```

* **Parar e remover todos os containers:**
  ```bash
  docker compose down
  ```

* **Resetar completamente o ambiente (apaga containers, redes e o banco de dados):**
  ```bash
  docker compose down -v
  ```

---

### 8. Resolução de Problemas Comuns (Troubleshooting)

* **Erro: `docker: error during connect: This error may indicate that the docker daemon is not running`**
  * *Causa:* O Docker Desktop não está aberto.
  * *Solução:* Abra o aplicativo **Docker Desktop** no Windows/Mac e aguarde a inicialização completa antes de rodar os comandos no terminal.

* **Erro de Porta Ocupada (`port is already allocated: 5433` ou `3000` ou `5173`):**
  * *Causa:* Outro serviço no seu computador já está utilizando essa porta.
  * *Solução:* Abra o arquivo `.env` e altere a porta em conflito (exemplo: mude `PORT=3001` ou `POSTGRES_PORT=5434` ou `FRONTEND_PORT=5174`), depois suba os containers novamente com `docker compose up --build -d`.

* **O Frontend não conecta com a API:**
  * *Causa:* A variável `VITE_API_URL` não foi informada corretamente durante o build do frontend.
  * *Solução:* Garanta que o `.env` contenha `VITE_API_URL=http://localhost:3000` e rode `docker compose up --build -d frontend`.

---

## 🔑 Credenciais de Acesso para Teste (Seed)

Após rodar o comando de seed (`docker compose exec backend npm run prisma:seed`), você pode se autenticar na tela de login ([http://localhost:5173](http://localhost:5173)) com qualquer uma das seguintes contas:

> 🔐 **Senha padrão para todos os usuários:** `123456`

| Perfil | E-mail | Senha | O que pode fazer? |
| :--- | :--- | :--- | :--- |
| 👑 **Administrador (`ADMIN`)** | `admin@helphome.com` | `123456` | Acesso total: gestão de usuários, equipes, categorias, relatórios, configurações e chamados. |
| 🔧 **Técnico (`TECHNICIAN`)** | `carlos@helphome.com` | `123456` | Atender chamados atribuídos, alterar status, adicionar comentários internos/públicos e solicitar aprovações. |
| 👤 **Solicitante 1 (`REQUESTER`)** | `joao@helphome.com` | `123456` | Abrir novos chamados de manutenção, acompanhar status e interagir via comentários públicos. |
| 👤 **Solicitante 2 (`REQUESTER`)** | `maria@helphome.com` | `123456` | Abrir chamados e acompanhar histórico da sua unidade/localização. |

---

## 💻 Execução Local sem Docker

Caso queira rodar o projeto localmente para desenvolvimento direto com hot reload do Vite e TSX:

### Pré-requisitos
* Node.js 20+ e npm instalados
* Instância do PostgreSQL em execução local

### 1. Iniciar o Backend
```bash
cd backend
npm install
```

Configure o arquivo `.env` dentro da pasta `backend`:
```env
PORT=3000
DATABASE_URL="postgresql://admin:admin123@localhost:5433/help_home?schema=public"
JWT_SECRET="secret"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="superrefreshsecret"
JWT_REFRESH_EXPIRES_IN="72h"
```

Execute as migrations, o seed e inicialize a API:
```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

### 2. Iniciar o Frontend
Em um novo terminal:
```bash
cd frontend
npm install
npm run dev
```

Acesse o Frontend em [http://localhost:5173](http://localhost:5173).

---

## 🚀 Tecnologias Utilizadas

### 🛠️ Backend
* **Node.js** (v20+ LTS) & **TypeScript**
* **Express**: Framework HTTP para rotas e middlewares REST
* **Prisma ORM**: Modelagem de dados, migrações e client tipado para PostgreSQL
* **PostgreSQL 16**: Banco de dados relacional e transacional
* **JWT & Refresh Token**: Autenticação stateless com renovação automática
* **Zod**: Validação de esquemas e dados de entrada
* **Multer**: Upload de anexos de evidência técnica
* **PDFKit**: Geração dinâmica de relatórios em PDF no servidor
* **Swagger (OpenAPI 3.0)**: Documentação interativa em `/docs`
* **BcryptJS**: Hashing criptográfico de senhas

### 💻 Frontend
* **React 19** com **TypeScript**
* **Vite**: Bundler e servidor de desenvolvimento ultra-rápido
* **Tailwind CSS v4**: Estilização utilitária e responsiva
* **React Router DOM v7**: Roteamento SPA e proteção de rotas privadas
* **Axios**: Cliente HTTP com interceptors para autorização e refresh token
* **Lucide React**: Biblioteca de ícones modernos

### 🐳 DevOps & Infraestrutura
* **Docker & Docker Compose**: Orquestração multi-container (`postgres`, `backend`, `frontend`)
* **Nginx (Alpine)**: Servidor web de alta performance servindo a SPA

---

## 🎯 Funcionalidades do Sistema

* **Autenticação Segura & RBAC:** 5 perfis de acesso (`ADMIN`, `MANAGER`, `TECHNICIAN`, `ASSISTANT`, `REQUESTER`).
* **Ciclo de Vida do Chamado:** `NEW`, `OPEN`, `TRIAGE`, `ASSIGNED`, `IN_PROGRESS`, `WAITING_USER`, `WAITING_PARTS`, `WAITING_VENDOR`, `RESOLVED`, `CLOSED`, `PENDING`.
* **Prioridades e SLA:** `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` com cálculo automático de prazos e marcação de violação (`slaBreached`).
* **Trilha de Auditoria:** Rastreamento imutável de todas as modificações no chamado (`TicketHistory`).
* **Fluxo de Aprovações:** Gestão de solicitações (orçamentos, compras, reformas) com aprovação/rejeição motivada.
* **Hierarquia Organizacional:** Categorias e Localizações em árvore (*parent/child*), além de equipes multidisciplinares.
* **Comentários & Anexos:** Mensagens públicas e notas internas para equipe técnica, com upload de arquivos.
* **Relatórios e Dashboard:** Métricas operacionais em tempo real e exportação consolidada em PDF.

---

## ⚙️ Variáveis de Ambiente

Configurações definidas no arquivo raiz `.env`:

| Variável | Valor Padrão | Descrição |
| :--- | :--- | :--- |
| `POSTGRES_USER` | `admin` | Usuário do banco PostgreSQL |
| `POSTGRES_PASSWORD` | `admin123` | Senha do banco PostgreSQL |
| `POSTGRES_DB` | `help_home` | Nome do banco de dados |
| `POSTGRES_PORT` | `5433` | Porta externa do PostgreSQL no host |
| `PORT` | `3000` | Porta em que a API Backend escuta |
| `DATABASE_URL` | `postgresql://admin:admin123@postgres:5432/help_home?schema=public` | String de conexão Prisma no Docker |
| `JWT_SECRET` | `secret` | Chave secreta dos Access Tokens JWT |
| `JWT_EXPIRES_IN` | `15m` | Tempo de expiração do Access Token |
| `JWT_REFRESH_SECRET` | `superrefreshsecret` | Chave secreta dos Refresh Tokens |
| `JWT_REFRESH_EXPIRES_IN` | `72h` | Tempo de expiração do Refresh Token |
| `FRONTEND_PORT` | `5173` | Porta externa do Frontend Web no host |
| `VITE_API_URL` | `http://localhost:3000` | URL da API consumida pelo Frontend |

---

## 🔌 Principais Endpoints da API

Acesse a documentação Swagger interativa em: **`http://localhost:3000/docs`**

| Módulo | Método | Rota | Descrição |
| :--- | :---: | :--- | :--- |
| **Auth** | `POST` | `/auth/login` | Autenticação e geração de tokens |
| **Auth** | `POST` | `/auth/refresh-token` | Renovação do access token |
| **Auth** | `GET` | `/auth/me` | Dados do usuário autenticado |
| **Users** | `GET` / `POST` | `/users` | Listar e cadastrar usuários |
| **Users** | `PATCH` | `/users/:id/status` | Ativar ou desativar usuário com justificativa |
| **Tickets** | `GET` / `POST` | `/tickets` | Listar e criar chamados com cálculo de SLA |
| **Tickets** | `GET` | `/tickets/:id` | Detalhes completos do chamado |
| **Tickets** | `PATCH` | `/tickets/:id/status` | Atualizar status do chamado |
| **Tickets** | `PATCH` | `/tickets/:id/assign` | Atribuir técnico ou equipe |
| **Tickets** | `GET` | `/tickets/:id/history` | Histórico de auditoria do chamado |
| **Tickets** | `POST` | `/tickets/:id/attachments` | Upload de arquivo/anexo |
| **Tickets** | `GET` | `/tickets/export/pdf` | Exportação de relatório em PDF |
| **Comments** | `POST` / `GET` | `/comments` | Adicionar e listar comentários |
| **Approvals** | `POST` | `/approvals` | Solicitar aprovação em chamado |
| **Approvals** | `PATCH` | `/approvals/:id/decide` | Aprovar ou reprovar solicitação |
| **Teams** | `GET` / `POST` | `/teams` | Gestão de equipes de manutenção |
| **Categories**| `GET` / `POST` | `/categories` | Categorias hierárquicas |
| **Locations** | `GET` / `POST` | `/locations` | Localizações prediais hierárquicas |
| **Metrics** | `GET` | `/metrics/dashboard` | Indicadores para o Dashboard |

---

## 📁 Estrutura do Repositório

```text
Projeto-2/
├── backend/                  # API RESTful (Node.js + TypeScript + Prisma)
│   ├── prisma/               # Schema do banco de dados e script de seed
│   ├── src/                  # Módulos de domínio, rotas e regras de negócio
│   └── Dockerfile            # Containerização do Backend
├── frontend/                 # Interface Web SPA (React 19 + Vite + Tailwind)
│   ├── src/                  # Telas, componentes, hooks e serviços
│   └── Dockerfile            # Multi-stage build com Nginx
├── .env.example              # Modelo de variáveis de ambiente
├── docker-compose.yml        # Orquestração dos containers (DB, API, Web)
├── DOCUMENTACAO_DO_SISTEMA.md# Documentação arquitetural profunda
└── README.md                 # Este documento
```

---

## 👨‍💻 Autor

Desenvolvido por **Pedro Paulo Borges Mizael**.
