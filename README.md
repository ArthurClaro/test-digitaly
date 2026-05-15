# Test Digitaly — Campo Minado FullStack

Desafio técnico fullstack: jogo de **Campo Minado** com autenticação via GitHub, ranking global e arquitetura limpa.

## Stack

- **Frontend**: Next.js 15 (App Router) + TypeScript + shadcn/ui + Tailwind
- **Backend**: NestJS 10 + TypeORM + class-validator
- **Banco**: PostgreSQL 16
- **Auth**: NextAuth v5 com provider GitHub (JWT compartilhado com o backend)

## Estrutura

```
test-digitaly/
├── backend/         # NestJS API
├── frontend/        # Next.js App
├── docker-compose.yml
└── README.md
```

## Pré-requisitos

- Node.js 20+
- pnpm 9+
- Docker + Docker Compose
- Uma OAuth App do GitHub ([criar aqui](https://github.com/settings/developers))
  - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`

## Como rodar

### 1. Subir Postgres

```bash
docker compose up -d
```

Postgres ficará em `localhost:5433`.

### 2. Backend

```bash
cd backend
cp .env.example .env
# editar .env preenchendo NEXTAUTH_SECRET (igual ao do frontend)
pnpm install
pnpm migration:run
pnpm start:dev
```

API em `http://localhost:3001`.

### 3. Frontend

```bash
cd frontend
cp .env.example .env.local
# editar .env.local com:
#   GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, NEXTAUTH_SECRET
pnpm install
pnpm dev
```

App em `http://localhost:3000`.

## Páginas

| Rota       | Descrição                       | Protegida |
|------------|---------------------------------|-----------|
| `/login`   | Login com GitHub                | não       |
| `/`        | Jogo (Campo Minado)             | sim       |
| `/ranking` | Top 30 pontuações globais       | sim       |

## API

| Método | Rota                  | Descrição                             |
|--------|-----------------------|---------------------------------------|
| POST   | `/scores`             | Salva score do jogador autenticado    |
| GET    | `/scores/ranking`     | Retorna top 30 (filtro opcional por tamanho) |

Todas as rotas exigem header `Authorization: Bearer <jwt>` emitido pelo NextAuth.

## Tamanhos de campo

| Tamanho | Minas |
|---------|-------|
| 9x9     | 10    |
| 16x16   | 40    |
| 30x16   | 99    |

## Como testar

1. Acesse `http://localhost:3000` → será redirecionado para `/login`
2. Faça login com GitHub
3. Escolha o tamanho do campo e jogue
4. Em caso de vitória, o score é salvo automaticamente
5. Acesse `/ranking` para ver o top 30

## Licença

MIT — veja [LICENSE](./LICENSE).
