# DevSecOps API Lab

Laboratório prático para criação de uma API REST com foco em segurança de aplicações, automação de validações e supply chain security.

O projeto simula uma API interna de service desk para abertura, acompanhamento e triagem de tickets. A aplicação é simples o suficiente para estudo, mas estruturada com práticas comuns em projetos profissionais.

## Tecnologias

- Node.js
- Express
- SQLite
- Knex
- JWT
- Zod
- Python
- GitHub Actions

## Funcionalidades

- Cadastro e login de usuários.
- Autenticação com JWT.
- Consulta do usuário autenticado.
- Criação e listagem de tickets.
- Controle de acesso por perfil.
- Atualização de status de tickets por usuários de suporte.
- Histórico de alterações de tickets.
- Health check da API.

## Segurança

A API inclui controles básicos de segurança para estudo e validação:

- headers HTTP com Helmet;
- limite de tamanho do corpo JSON;
- rate limiting no login;
- validação de entrada com Zod;
- autenticação obrigatória em rotas protegidas;
- autorização baseada em roles;
- tratamento centralizado de erros;
- proteção contra acesso indevido a tickets de outros usuários.

## Automação DevSecOps

O repositório possui uma pipeline de segurança no GitHub Actions com:

- lint da aplicação Node.js;
- `npm audit` para dependências Node.js;
- scripts Python de validação de segurança contra a API em execução;
- Gitleaks para secret scanning;
- Semgrep para SAST;
- OSV Scanner para dependency scanning;
- CycloneDX para gerar SBOM Node.js como artifact.

## Como rodar localmente

Crie o arquivo `.env` com base em `.env.example`.

Instale as dependências:

```powershell
npm install
pip install -r security-scripts/requirements.txt
```

Prepare o banco:

```powershell
npm run db:migrate
npm run db:seed
```

Inicie a API:

```powershell
npm run dev
```

A API ficará disponível em:

```text
http://localhost:3000
```

## Usuário inicial

O seed cria um usuário de suporte para testes:

```text
email: support@example.com
password: SupportPassword123!
```

## Endpoints principais

```text
GET    /health
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
POST   /api/tickets
GET    /api/tickets
GET    /api/tickets/:id
PATCH  /api/tickets/:id/status
GET    /api/tickets/:id/history
```

## Scripts úteis

```powershell
npm run lint
npm run db:migrate
npm run db:rollback
npm run db:status
npm run db:seed
python security-scripts/run_security_checks.py
```

## Validações de segurança em Python

Os scripts em `security-scripts/` executam checks direcionados contra a API rodando localmente. Eles validam comportamentos relacionados a autenticação, autorização, headers de segurança, mass assignment, IDOR, transições inválidas de workflow e rate limiting.

Para executar:

```powershell
python security-scripts/run_security_checks.py
```

## Observações

Este projeto é um laboratório técnico para estudo, experimentação e demonstração de boas práticas de DevSecOps em uma API REST.
