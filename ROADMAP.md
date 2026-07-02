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

### A maior lacuna

O app promete **"PLACAR DA SEMANA"**, mas o ranking é **cumulativo/all-time** — não
há ciclo. Gamificação vive de um *loop que recomeça* e de *feedback*. É onde está o
maior retorno.

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

### Fase 1 — Ciclo semanal (a base de tudo) · alto impacto

Torna o "PLACAR DA SEMANA" verdadeiro e cria motivo para voltar toda semana.

- **Temporadas/semanas:** votos contam para a semana corrente; manter um placar
  all-time à parte.
- **Vencedor da semana:** ao virar a semana, coroar o 1º lugar e arquivar o resultado.
- **Hall da Fama:** página com os vencedores anteriores (status permanente).
- **Notas de implementação:** já há base (`user_votes.created_at`). Precisa de uma
  noção de "semana" (ex.: `season_id` ou janela por data) e uma tabela de resultados
  (`weekly_results`: semana, project_id, rank, votos). Decidir se o placar principal
  passa a ser semanal com um toggle "semana / geral".

### Fase 2 — Feedback e movimento · alto impacto, médio esforço

Fecha o loop: o usuário precisa *sentir* o efeito das ações.

- **Notificações:** "seu projeto subiu para #3", "recebeu ★5", "alguém votou".
  (Tabela `notifications`; badge de não-lidas no header; página/lista.)
- **Variação de posição:** `▲2 / ▼1` desde a semana passada, no placar e no card.
- **Juice:** confete ao bater marcos, celebração de level-up, animação no voto.
  A estética de "bancada física" combina com micro-interações satisfatórias.

### Fase 3 — Recompensar participação · retenção e onboarding

Hoje o XP vem quase só de *receber* votos, o que desanima quem começa.

- **XP por ação:** votar, avaliar, publicar, login diário (com limites anti-farm).
- **Streaks:** dias/semanas seguidas ativo — uma das mecânicas de retenção mais fortes.
- **Missões da semana:** ex. "avalie 3 projetos", "publique 1" → recompensa em XP.
  Ensinam o loop e direcionam comportamento.

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
