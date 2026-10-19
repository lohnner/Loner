# Caçada da Víbora

ARPG "idle" de celular e PC: o herói (arqueira de veneno) caça sozinho, o jogador usa as habilidades, troca itens e sobe de nível. Página estática, **sem build e sem módulos**: `index.html` + `css/estilo.css` + `js/01..10`. Textos do jogo em português do Brasil.

- Site: GitHub Pages do repositório `lohnner/Loner` → https://lohnner.github.io/Loner/ (este jogo substituiu o antigo Loner de caminhão).
- Backend: Firebase, projeto **`loner-hq`** (login Google + Firestore). O projeto é **dividido com o jogo Loner** (caminhões) — ver regras abaixo.
- O Git não está instalado no PC do dono: a publicação é feita enviando os arquivos pelo site do GitHub (Add file › Upload files).

## Onde fica cada coisa

| Arquivo | O que tem | Nomes principais |
|---|---|---|
| `index.html` | Só o HTML (HUD, canvas, barra de habilidades, abas, gaveta `#sheet`, diálogo `#dlg`, telas `#create` e `#login`) e a ordem dos scripts | — |
| `css/estilo.css` | Todo o visual. Cores em variáveis no `:root` | — |
| `js/01-base.js` | Atalhos, constantes e dados fixos do jogo; estado salvo `S` | `$ rnd clamp D fmt n1 pc`, `MAX_LV`, `RANGE`, `MAPS MONS SKD ACTIVE PASSIVE SLOTS BOWS AFX`, `defaults() normalize() readLocal() save()`, `S` |
| `js/02-modelos.js` | Itens e status | `genItem() rollRar() rollShop() buyPrice sellPrice`, `calcStats()`, `ST`, `refreshStats()`, `xpNeed ptsFree skDesc()` |
| `js/03-mapa.js` | Canvas/câmera, listas do mundo, efeitos, chão/decoração, vila, entrar em mapa | `cv ctx cam zoom hero mons projs clouds drops`, `scene mode`, `log() txt() part() ring()`, `enterMap() enterTown() startPortal() depart()` |
| `js/04-batalha.js` | Dano, veneno, morte, loot, XP/nível/Paragon, ataque básico e efeito das habilidades | `dealHit() poison() kill() gainXp() gainParagon() PARA parFree`, `manualCast() cast() doSkill()` |
| `js/05-habilidades.js` | Mira manual (arrastar no celular / segurar tecla no PC), alvo fixo por clique, desenho da mira | `AIMABLE aim aimPoint() aimRelease()`, `fanPointBlank()`, `focus getFocus() setFocus() hoverMon()`, `drawAim() drawFocus()` |
| `js/06-cena.js` | Simulação: IA do herói e monstros, vila, portal, `step(dt)` | `heroAI() heroTimers() monUpdate() step()` |
| `js/07-animacoes.js` | Desenho de tudo e o loop | `drawHero() drawMon() drawBars() render()`, `frame()` (chama `step`, `render`, `updateHud`, `save` a cada 5s, `accountTick`) |
| `js/08-hud.js` | Interface: ícones, barra de habilidades, painéis (Mapas, Herói, Mochila, Ranking, Regras), diálogo de item (comparação ganha/perde), criação de personagem, **todas as ações de botão** (`ACT`) e eventos de teclado/mouse/toque | `ICON_SK updateHud() openTab() renderPanel() panelHero() renderDlg() itemDiff() showCreate()`, `ACT` |
| `js/09-conta.js` | Firebase: login Google obrigatório, save na nuvem, ranking | `FIREBASE_CONFIG fbUser accountReady`, `startAccount() onAuth() applyAccount() cloudFlush() accountTick()`, `pushRank() loadRank() panelRank()`, `esc()` |
| `js/10-inicio.js` | Liga tudo: barra, vila, tela de login, loop; expõe `window.__game` | — |
| `firestore.rules` | Regras do Firestore (Loner + Caçada da Víbora). Cópia do que está publicado no Console | — |

Não existe arquivo de sons: o jogo não tem áudio.

## Regras importantes

### Como os arquivos se enxergam (quem pode chamar o quê)
- São scripts clássicos carregados **em ordem** pelo `index.html`. Tudo que um arquivo declara no topo (`const`, `let`, `function`) fica visível para os outros (escopo global compartilhado). **Não use `import/export`** nem envolva arquivo em `(() => {...})()`.
- **Código que roda na hora em que o arquivo carrega** (fora de funções) só pode usar o que veio de arquivos **anteriores**. Ex.: `02-modelos.js` faz `let ST = calcStats()` e pode usar `S` do 01, mas não algo do 03.
- **Dentro de funções** pode chamar qualquer arquivo, porque elas só rodam depois que tudo carregou (ex.: `gainXp()` no 04 chama `dirtyPanel()` do 08).
- Arquivo novo: crie `js/NN-nome.js` com `'use strict';`, coloque o `<script>` no lugar certo do `index.html` e atualize esta tabela.
- Nomes globais são compartilhados: antes de criar um nome no topo, procure se já existe (`Grep`). Nunca use `window`, `document`, `location` ou `top` como nome.
- Botões chamam ações por `data-act="nome"` + `data-v="valor"` → função `ACT.nome(v)` em `08-hud.js`. Painel aberto redesenha com `dirtyPanel()`.

### Online / "multiplayer" (Firebase)
- **Login Google é obrigatório.** O personagem só existe depois do login: `09-conta.js` troca `S` pelo save da conta e liga `accountReady`. Antes disso `save()` não faz nada (isso evita apagar o save da nuvem com um estado vazio). Não mude essa proteção.
- Save: `save()` grava uma cópia local (`localStorage['cacada-vibora-v1:' + uid]`) e marca a nuvem para envio; `accountTick()` envia para `viboraSaves/{uid}` no máximo a cada 20 s, e `cloudFlush()` envia na hora (sair da aba/conta). No login vale o save mais novo (`savedAt`) entre nuvem e cópia local. O save antigo sem conta (`localStorage['cacada-vibora-v1']`) é migrado no primeiro login e apagado.
- Ranking: `ranking/{uid}` com `{name, lv, par, score, cls, kills, updated}`; `score = lv + par + fração da barra de XP`. Enviado ao entrar, ao subir de nível/Paragon e a cada 60 s se mudou. Só o nome do herói é público; nome/e-mail do Google nunca vão para o ranking.
- **Todo texto vindo do Firestore passa por `esc()` antes de ir para `innerHTML`.**
- Só `09-conta.js` fala com o Firebase. Outros arquivos usam as funções dele.
- **`firestore.rules` contém as regras do jogo Loner (players, progress, messages, playerCalls...). Nunca apague nem substitua essas partes.** Para uma coleção nova, adicione um `match` novo **antes** do bloco final `match /{document=**}` (que bloqueia todo o resto). Se mudar os campos de `ranking` ou `viboraSaves`, atualize o `hasOnly([...])` e as validações. Depois de editar, o dono precisa colar o arquivo em Console Firebase › Firestore › Regras › Publicar.
- Domínios autorizados no login: `localhost`, `lohnner.github.io` (Authentication › Configurações).

### Save e compatibilidade
- Campo novo no estado: coloque em `defaults()` (01-base). `normalize()` mistura o save antigo com os padrões, então saves antigos continuam funcionando. Não renomeie campos existentes de `S`.
- Nível máximo 40 (`MAX_LV`); depois a XP vira Paragon (`S.par`, `S.pxp`, pontos em `S.pp`).

## Como rodar e testar

`file://` não serve (o login Google não funciona). Rode um servidor local na pasta do jogo:

```bash
python -m http.server 4190 --bind 127.0.0.1 --directory "C:\Users\rodri\OneDrive\Documentos\Loner"
```

Abra http://localhost:4190 (`localhost` já está autorizado no Firebase). No Claude Code desktop, use `preview_start` com uma configuração no `.claude/launch.json` em vez de rodar o servidor pelo terminal.

Testando pelo console / `javascript_tool`:
- `window.__game` tem `S`, `ST`, `hero`, `ACT`, `step`, `render`, `updateHud`, `manualCast`. As funções globais também podem ser chamadas pelo nome (ex.: `accountTick(1)`, `cloudFlush()`, `gainXp(1000)`).
- Se o painel do navegador estiver escondido, o `requestAnimationFrame` para e o jogo congela. Avance na mão: `for(let i=0;i<500;i++) __game.step(.03); __game.updateHud();`.
- `S.speed = 0` pausa o jogo (é salvo no personagem: volte para 1 depois).
- Para testar login/save/ranking sem conta Google real, faça uma cópia da pasta num diretório temporário e troque os 3 `<script>` do firebasejs no `index.html` por um Firebase falso que guarda dados no `localStorage` (auth com `onAuthStateChanged/signInWithPopup/signOut` e `firestore().collection(n).doc(id).get/set` + `orderBy().limit().get()`). Não teste escrevendo no Firestore real.
- Depois de qualquer mudança, confira: sem erros no console, tela de login aparece, mapa anda com `step`, todas as abas abrem (`ACT.tab('maps'|'hero'|'bag'|'rank'|'rules')`).

## Publicar
Enviar `index.html`, `css/`, `js/` (e `firestore.rules`, só como registro) para `lohnner/Loner` pelo site do GitHub; o Pages atualiza em 1–2 min. Se mudou `firestore.rules`, publicar também no Console do Firebase.
