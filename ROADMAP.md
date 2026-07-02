# Roadmap de gamificação — Bancada

Ideias para aprofundar a gamificação da Bancada, priorizadas por impacto e
sequenciadas para construir o **loop** antes dos enfeites. É um documento vivo:
serve de guia, não de contrato.

## Onde estamos hoje

Já implementado:

- **Placar** com pódio (top 3) e lista ranqueada; abas **Top / Novos / Em alta**
  (esta usa `user_votes.created_at` dos últimos 7 dias).
- **Voto** persistente, 1 por usuário por projeto (`user_votes`), com destaque verde.
- **Avaliações** (1–5 estrelas + texto), uma por usuário por projeto; média nos cards.
- **XP / nível** calculados de dados reais: `xp = votos recebidos + 100 × projetos`,
  com curva de nível `xpParaNível(L) = 50 · (L-1) · L`.
- **Conquistas** derivadas de métricas: `TOP DA SEMANA`, `TOP 3`, `+1000/+100 VOTOS`,
  `MARATONISTA`, `PRIMEIRO PROJETO`; selo por nível (BUILDER → BRONZE → PRATA → OURO).
- **Perfil** do dev (nível, barra de XP, conquistas, projetos) e **"meus projetos"**.
- **Ciclo semanal** (Fase 1 ✓): placar da semana conta votos da semana corrente,
  vencedor coroado ao virar a semana e **Hall da Fama** com os campeões anteriores.

### A maior lacuna — resolvida na Fase 1

O app prometia **"PLACAR DA SEMANA"**, mas o ranking era **cumulativo/all-time**.
A Fase 1 introduziu o ciclo semanal (a base do *loop que recomeça*): o próximo
maior retorno agora está no **feedback** (Fase 2).

## Princípios de design

- **Não gamificar só o "ganhar".** Recompensar votar, avaliar e publicar mantém a
  plataforma acolhedora para quem chega agora — senão o topo cristaliza e o resto
  desiste.
- **Resets dão chance nova.** Ciclos semanais evitam o "rico fica mais rico".
- **Feedback é obrigatório.** Toda ação relevante do usuário (ou sobre o projeto
  dele) deve gerar retorno visível.
- **Escassez dá valor.** Voto/atenção limitados aumentam o significado de cada ação.
- **Anti-abuso desde cedo.** Evitar auto-voto, conluio e farm de XP.

## Fases

### Fase 1 — Ciclo semanal (a base de tudo) · alto impacto · ✓ feito

Torna o "PLACAR DA SEMANA" verdadeiro e cria motivo para voltar toda semana.

- ✓ **Semanas:** a semana é uma janela por data (segunda 00:00 UTC → segunda
  seguinte), derivada de `user_votes.created_at` — sem `season_id`. O placar da
  semana é calculado dessa janela; o all-time segue nas abas.
- ✓ **Vencedor da semana:** ao virar a semana, o 1º lugar é arquivado em
  `weekly_winners` — de forma preguiçosa na leitura (`settlePastWeeks`), sem agendador.
- ✓ **Hall da Fama:** `/hall-da-fama` com a disputa da semana atual e os campeões
  anteriores; faixa no topo do placar com o líder da semana e o tempo restante.
- **Fica para depois:** toggle "semana / geral" no placar principal (hoje o
  destaque semanal vive na faixa + Hall da Fama, e o placar segue all-time).

### Fase 2 — Feedback e movimento · alto impacto, médio esforço · ✓ feito

Fecha o loop: o usuário precisa *sentir* o efeito das ações.

- ✓ **Notificações:** "recebeu ★5", "alguém votou" (tabela `notifications`;
  selo de não-lidas no header; página `/notificacoes`). Geradas na ação real
  (voto novo / primeira avaliação).
- ✓ **Variação de posição:** `▲2 / ▼1 / novo` na disputa da semana vs. a semana
  passada, no pódio, na lista e no Hall da Fama. Calculada com precisão do
  placar **semanal** (o all-time não tem histórico por data). Falta ainda a
  *notificação* de posição ("subiu para #3") — agora que há a variação, é o
  próximo passo natural.
- ✓ **Juice:** animação satisfatória no voto (pop do ▲ + faíscas) e **confete ao
  bater marcos** de votos (10, 100, 1000…), sem dependências e respeitando
  `prefers-reduced-motion`. A celebração de *level-up* fica para a Fase 4
  (níveis/perks), onde a mudança de nível é o gatilho natural.

### Fase 3 — Recompensar participação · retenção e onboarding · ✓ feito

Hoje o XP vem quase só de *receber* votos, o que desanima quem começa.

- ✓ **XP por ação:** votar (+2), avaliar (+5), publicar (+25) e **presença diária**
  (+3) rendem XP, somado ao XP de votos recebidos/projetos. Anti-farm por índice
  único (`user_id, kind, ref`): um ganho por alvo; reverter/refazer (ou recarregar
  no mesmo dia) não repete. O perfil mostra o XP de participação.
- ✓ **Streaks:** dias consecutivos ativo, derivados da presença diária (mesmos
  `xp_events`, kind `daily`). Selo 🔥 no perfil; quebra ao passar um dia sem
  visitar. A presença é registrada no `getCurrentUser` (uma escrita por dia).
- ✓ **Missões da semana:** "vote em 3 projetos", "avalie 2", "publique 1" →
  recompensa em XP ao concluir (uma vez por semana, anti-farm). Progresso vindo
  das ações reais da semana (`xp_events`), painel no placar para quem está logado.

### Fase 4 — Profundidade de status · médio impacto

- **Conquistas com progresso visível:** "faltam 120 votos para +1000".
- **Novas conquistas:** *Curador* (votou em N), *Crítico* (deu N reviews),
  *Comentado* (recebeu N reviews), *Estreante da semana*, *Manteve o #1 por N semanas*.
- **Momento de desbloqueio:** toast/celebração ao ganhar uma conquista.
- **Níveis que valem algo:** título + moldura de perfil, selo destacado no card —
  nem que seja cosmético (progressão cosmética funciona).

### Fase 5 — Integridade e social · quando houver volume

- **Orçamento de votos** por semana (ex.: 10) ou **voto ponderado por nível:**
  escassez melhora a qualidade do ranking e reduz spam/conluio.
- **Anti-abuso:** impedir auto-voto/auto-review (já bloqueado p/ review do próprio
  projeto), detectar padrões de conluio.
- **Rankings por categoria** ("melhor em Design") e **seguir devs** → rivalidade
  saudável e leaderboards de nicho.
- **Comparar com amigos / rivais.**

## Sequência recomendada

1. Semana + vencedor + Hall da Fama (torna o "placar da semana" real).
2. Notificações + variação de posição (fecha o loop de feedback).
3. XP por participação + streak + missões (retenção e onboarding).
4. Conquistas com progresso + perks de nível (profundidade).
5. Orçamento/peso de voto + social (integridade e escala).

## Riscos e cuidados

- **Rich-get-richer:** mitigado por resets semanais e XP de participação.
- **Farm de XP:** limites diários, XP só na primeira ação relevante, cooldowns.
- **Complexidade:** introduzir uma mecânica por vez, medindo engajamento antes da próxima.
- **Ruído de notificações:** permitir silenciar/agrupar; nunca spammar.
