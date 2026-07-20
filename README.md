# Bancada

![Bancada — vitrine gamificada de side projects](docs/banner.png)

**Bancada** é uma vitrine gamificada de side projects: um placar semanal com
pódio, votos e XP para a comunidade de builders. A interface segue uma metáfora
física de "bancada de trabalho" — madeira texturizada, papel, carimbos
editoriais e botões que afundam ao clicar.

Projeto criado com [Next.js](https://nextjs.org) (App Router, TypeScript,
Tailwind CSS v4), iniciado via `create-next-app`.

Próximos passos de gamificação estão em [`ROADMAP.md`](ROADMAP.md).

## Telas

| Rota | Tela | Descrição |
| --- | --- | --- |
| `/` | **Placar (1b)** | Tela principal: abas **Top / Novos / Em alta**, **busca** e **filtro por categoria**, pódio (top 3), lista ranqueada (com média de estrelas), conta e ação de publicar. |
| `/project/[slug]` | **Detalhe (1d)** | Hero, estatísticas, ações físicas (votar/abrir), descrição, tags e reviews da comunidade. |
| `/dev/[handle]` | **Perfil (1e)** | Nível, barra de XP, streak, conquistas (conquistadas + próximas com progresso) e projetos publicados do dev. |
| `/entrar`, `/cadastrar` | **Conta** | Login e cadastro (handle + senha). |
| `/publicar`, `/project/[slug]/editar` | **Formulários** | Publicar (requer login) e editar (só o dono). |
| `/perfil/editar` | **Perfil** | Editar o próprio nome, bio e avatar. |
| `/meus-projetos` | **Meus projetos** | Gerenciar (ver/editar/excluir) os projetos que você publicou. |
| `/hall-da-fama` | **Hall da Fama** | Disputa da semana atual (top 3 + quanto falta) e os vencedores de semanas passadas. |
| `/notificacoes` | **Notificações** | Feed de eventos dos seus projetos (votos e avaliações recebidos), com selo de não-lidas no header. |
| `/categorias` | **Rankings por categoria** | O "MELHOR EM {categoria}" (campeão + vice-campeões) de cada categoria. |
| `/seguindo` | **Seguindo** | Placar de rivalidade (você vs. quem você segue) + feed com os projetos deles (mais recentes primeiro). |

A tela principal é a **1b** (placar de ranking); as telas internas seguem a
direção visual da 1b, conforme o protótipo de referência.

## Contas e persistência

- Dados em **SQLite** (`better-sqlite3`), arquivo local em `data/bancada.db`,
  semeado a partir do seed na primeira execução.
- **Autenticação própria**: cadastro/login com senha (hash `scrypt` nativo) e
  sessão por cookie `httpOnly`. Opcionalmente, **login com GitHub** (OAuth).
- **Publicar** exige login; o autor vem da conta. **Editar/excluir** só o dono.
  As **estrelas** não são digitadas: o usuário informa o **link do repositório** e
  o sistema busca a contagem no GitHub automaticamente (usa `GITHUB_TOKEN` quando
  disponível para o limite de taxa).
- Os **autores do seed** são contas de verdade (sem senha): têm perfil e podem ser
  **seguidos**.
- **Voto persistente e por usuário**: no máximo um voto por projeto por conta.
- **Reviews reais**: avaliações (1–5 estrelas + texto) da comunidade, uma por
  usuário por projeto; não é possível avaliar o próprio projeto.
- **XP por participação**: além do XP de votos recebidos e projetos, votar (+2),
  avaliar (+5), publicar (+25) e a **presença diária** (+3) rendem XP. Anti-farm
  por índice único (`user_id, kind, ref`): no máximo um ganho por alvo — reverter
  e refazer a ação (ou recarregar a página no mesmo dia) não gera XP de novo.
- **Streak**: dias consecutivos ativo, derivado da presença diária. O perfil
  mostra um selo 🔥 com o streak atual (segue "vivo" enquanto você aparece a cada
  dia; quebra se passar um dia sem visitar).
- **Missões da semana**: metas curtas (ex.: "vote em 3 projetos", "avalie 2",
  "publique 1") com barra de progresso, recompensadas em XP ao concluir (uma vez
  por semana). Ficam num **botão flutuante** (com ícone animado e selo de
  pendentes) que abre um **drawer de baixo para cima**; o progresso vem das ações
  reais da semana.
- **Conquistas com progresso**: além das conquistadas (selos com ícone), o perfil mostra
  as **próximas** com barra de progresso ("faltam N votos para +1000"). Inclui as
  de participação — **Curador** (votar em 10), **Crítico** (avaliar 5) e
  **Comentado** (receber 5 avaliações). Ao abrir o próprio perfil com conquistas
  **recém-desbloqueadas**, há uma **celebração** (toast + confete), uma vez por
  conquista.
- **Perks de nível**: faixas (Builder → Bronze → Prata → Ouro) dão significado
  visível ao nível — título/selo, **moldura do avatar** e disco de nível coloridos
  por faixa no perfil, e **chip de nível destacado** por faixa no card do placar.
- **Perfil editável** (nome/bio/avatar); o perfil é calculado dos votos recebidos.
- **Notificações**: quando alguém vota ou avalia um projeto seu, ou começa a te
  seguir, você recebe um aviso (feed em `/notificacoes` + selo de não-lidas no
  sino do header). Só a primeira avaliação de cada pessoa gera aviso; editar uma
  avaliação não repete.
- **Ciclo semanal**: o placar da semana conta os votos da semana corrente
  (segunda 00:00 UTC → segunda seguinte). Ao virar a semana, o 1º lugar é coroado
  e arquivado no **Hall da Fama** — sem agendador: as semanas concluídas são
  "encerradas" de forma preguiçosa na leitura. Uma faixa no topo do placar mostra
  o líder da semana e quanto falta para encerrar.
- **Variação de posição** (`▲/▼`): cada projeto mostra como se moveu na disputa
  desta semana vs. a semana passada (`▲2` subiu, `▼1` caiu, `novo` entrou), no
  placar (pódio e lista) e no Hall da Fama.
- **Juice**: micro-interações satisfatórias e sem dependências — o ▲ do voto dá
  um "pop", faíscas saem do botão e há **confete** quando o voto cruza um marco
  de votos (10, 100, 1000…). Respeita `prefers-reduced-motion`.
- **Ordenação do placar** em abas: `top` (mais votados), `novos` (recentes) e
  `alta` (mais votos nos últimos 7 dias) — via `?ordem=`.
- **Busca** (`?q=` em nome/resumo/autor) e **filtro por categoria** (`?cat=`);
  a **média de estrelas** aparece nos cards do placar.
- **Rankings por categoria** (`/categorias`): o **"MELHOR EM {categoria}"** de cada
  categoria (campeão + vice-campeões), com atalho a partir do placar.
- **Seguir devs**: seguir/deixar de seguir pelo perfil, com contadores de
  seguidores/seguindo e **notificação de novo seguidor**. Não é possível seguir a
  si mesmo. O **feed `/seguindo`** reúne os projetos dos devs que você segue
  (mais recentes primeiro) e um **placar de rivalidade** (você vs. quem você segue,
  por votos recebidos).
- **Screenshot** do projeto e **avatar** do usuário guardados no banco e
  **otimizados no upload** com `sharp` (redimensiona e reencoda em WebP).
- API CRUD sob `/api/projects` (+ `/vote`, `/image`, `/reviews`),
  `/api/profile` e `/api/auth/{register,login,logout}`.

## Rodando localmente

```bash
npm install
npm run dev
# abra http://localhost:3000
```

Outros comandos:

```bash
npm run build   # build de produção
npm run start   # serve o build de produção
npm run lint    # ESLint
npm test        # testes unitários (Jest)
```

### Login com GitHub (opcional)

O botão "Entrar com GitHub" só aparece se as variáveis abaixo estiverem
definidas (ex.: em `.env.local`):

```bash
GITHUB_CLIENT_ID=seu_client_id
GITHUB_CLIENT_SECRET=seu_client_secret
# opcional; por padrão usa <origin>/api/auth/github/callback
GITHUB_REDIRECT_URI=http://localhost:3000/api/auth/github/callback
```

Crie um **OAuth App** em GitHub → Settings → Developer settings, com o
"Authorization callback URL" igual ao `GITHUB_REDIRECT_URI`. No primeiro login,
a conta é criada com o handle do GitHub e o avatar é importado.

Quem entra com GitHub pode **importar um repositório público** direto na tela de
publicar: o formulário é pré-preenchido com nome, descrição, tags, estrelas e a
URL do projeto. (Opcional: defina `GITHUB_TOKEN` para elevar o limite de taxa da
listagem de repositórios.)

## Deploy contínuo (VPS + Docker)

O pipeline `.github/workflows/ci.yml` faz **test → build → deploy**. A cada push na
`main`, a imagem é construída e publicada no **GHCR** (`ghcr.io/cedric-sd/bancada`,
tags `sha-…` e `latest`) e, se a VPS estiver configurada, o deploy **entra por SSH e
atualiza o container** (`docker compose pull && up -d`). Enquanto os secrets de SSH
não existirem, o passo de VPS é pulado e o pipeline segue verde.

Os arquivos de produção ficam em [`deploy/`](deploy/): `docker-compose.yml` (app +
Caddy para HTTPS automático), `Caddyfile` e `.env.example`. O SQLite é persistido no
volume `bancada-data` (montado em `/app/data`).

### Configuração da VPS (uma vez)

1. **VPS** (Hostinger KVM ou similar, Ubuntu 22.04+) com acesso SSH.
2. Instalar Docker + Compose:
   ```bash
   curl -fsSL https://get.docker.com | sh
   ```
3. Preparar a pasta e o `.env` (segredos ficam **só na VPS**):
   ```bash
   mkdir -p ~/bancada && cd ~/bancada
   # copie deploy/.env.example do repo para ~/bancada/.env e preencha
   ```
4. **Domínio**: registro **A** apontando `DOMAIN` para o IP da VPS. O Caddy emite o
   certificado HTTPS sozinho (Let's Encrypt).
5. **Firewall**: liberar `22, 80, 443` (ex.: `ufw allow 22,80,443/tcp`).
6. **Chave SSH do CI**: gerar um par dedicado, adicionar a **pública** em
   `~/.ssh/authorized_keys` da VPS.
7. Se o pacote GHCR for **privado**, rodar `docker login ghcr.io` na VPS com um PAT
   `read:packages` (com pacote público não precisa).

### Secrets no GitHub (ambiente `production`)

Em **Settings → Environments → production**:

| Secret | Valor |
| --- | --- |
| `SSH_HOST` | IP ou host da VPS |
| `SSH_USER` | usuário SSH (ex.: `deploy` ou `root`) |
| `SSH_KEY` | **chave privada** do par gerado no passo 6 |
| `SSH_PORT` | opcional (padrão `22`) |

Primeiro deploy manual (opcional, para validar): com o `.env` pronto e o
`docker-compose.yml`/`Caddyfile` em `~/bancada/`, rode `docker compose up -d` e
acesse `https://SEU_DOMINIO`.

## Estrutura

```
src/
  app/
    page.tsx                 # 1b — placar (tela principal)
    project/[slug]/page.tsx  # 1d — detalhe do projeto
    dev/[handle]/page.tsx    # 1e — perfil do dev
    layout.tsx               # fontes (Archivo, JetBrains Mono, Newsreader) + metadata
    globals.css              # tokens e estilos base
    api/                     # rotas de API (projetos, voto, auth)
  components/                # Board, Logo, PodiumCard, RankRow, VoteButton, AuthForm, etc.
  lib/
    data.ts                  # tipos, seed e perfis estáticos
    db.ts                    # conexão SQLite, schema e seed
    projects.ts              # repositório de projetos (CRUD, voto, rank)
    auth.ts                  # usuários, sessões e senha (scrypt)
```
