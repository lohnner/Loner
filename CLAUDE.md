# Caçada da Víbora

ARPG "idle" de celular e PC: o herói caça sozinho, o jogador usa as habilidades, troca itens e sobe de nível. Classes: **Arqueiro** (veneno, ataca de longe e recua) e **Guerreiro** (sangramento, corpo a corpo, mais vida/armadura e 10% menos dano recebido). Página estática, **sem build e sem módulos**: `index.html` + `css/estilo.css` + `js/01..10`. Textos do jogo em português do Brasil.

- Site: GitHub Pages do repositório `lohnner/Loner` → https://lohnner.github.io/Loner/ (este jogo substituiu o antigo Loner de caminhão).
- Backend: Firebase, projeto **`loner-hq`** (login Google + Firestore). O projeto é **dividido com o jogo Loner** (caminhões) — ver regras abaixo.
- O Git não está instalado no PC do dono: a publicação é feita enviando os arquivos pelo site do GitHub (Add file › Upload files).

## Onde fica cada coisa

| Arquivo | O que tem | Nomes principais |
|---|---|---|
| `index.html` | Só o HTML (HUD, canvas, barra de habilidades, abas, gaveta `#sheet`, diálogo `#dlg`, telas `#create` e `#login`) e a ordem dos scripts | — |
| `css/estilo.css` | Todo o visual. Cores em variáveis no `:root` | — |
| `js/01-base.js` | Atalhos, constantes e dados fixos do jogo (classes, habilidades, armas, afixos); estado salvo `S` | `$ rnd clamp D fmt n1 pc`, `MAX_LV RANGE MELEE INV_MAX`, `MAPS MONS SKD CLASS_KIT ACTIVE PASSIVE setClass() clsOf() isWar() dotN() dotT()`, `SLOTS SLOT_N BOWS BLADES weaponBases() AFX`, `CLASSES BUILDS buildsFor()`, `defaults(cls) normalize() readLocal() save()`, `S` |
| `js/02-modelos.js` | Itens (com classe) e status | `genItem(ilvl, rar, slot, cls) canUse() clsName() rollRar() rollShop() buyPrice sellPrice`, `calcStats()` (dps estimado por classe), `ST`, `refreshStats()`, `xpNeed ptsFree skDesc()` |
| `js/03-mapa.js` | Canvas/câmera, listas do mundo, efeitos, chão/decoração, vila, entrar em mapa | `cv ctx cam zoom hero mons projs clouds drops cds`, `scene mode`, `log() txt() part() ring()`, `makeMon() enterMap() enterTown() startPortal() depart()` |
| `js/04-batalha.js` | Veneno e sangramento, dano, morte, loot, XP/nível/Paragon, ataque básico (flecha ou golpe) e as 8 ativas (`cast/doSkill`) | `poison() bleed() poisonLeft bleedLeft applyDot dotLeft`, `dealHit() meleeHit() kill() gainXp() gainParagon() PARA parFree hurtHero()`, `fireBasic() manualCast() cast() doSkill()`, `BURST_R RUPT_R CLEAVE_REACH CHARGE_LEN whirlR()` |
| `js/05-habilidades.js` | Mira manual (arrastar no celular / segurar tecla no PC) do Leque, Chuva e Investida; alvo fixo por clique; desenho da mira | `AIMABLE aim aimPoint() aimRelease()`, `fanPointBlank()`, `focus getFocus() setFocus() hoverMon()`, `drawAim() drawFocus()` |
| `js/06-cena.js` | Simulação: IA do herói (Arqueiro recua, Guerreiro avança), Investida/Giro em andamento, monstros, vila, portal, `step(dt)` | `heroAI() heroTimers() monUpdate() step()` |
| `js/07-animacoes.js` | Desenho e o loop. Heróis em pé com volume (degradês de luz e sombra) | `shade() sphere() cyl() heroPose() drawHero() drawArcher() drawWarrior() drawMon() drawBars() render()`, `frame()` (chama `step`, `render`, `updateHud`, `save` a cada 5s, `accountTick`) |
| `js/08-hud.js` | Interface: ícones, barra de habilidades, painéis (Mapas, Herói, Mochila centralizada, Ranking em tela cheia, Regras), diálogo de item (comparação ganha/perde, "só Guerreiro"), criação de personagem, **todas as ações de botão** (`ACT`) e eventos de teclado/mouse/toque | `ICON_SK ICON_BOW ICON_SWORD itemIcon() itemSlotN() updateHud() buildSkillbar() openTab() renderPanel() panelHero() panelBag() renderDlg() itemDiff() showCreate()`, `ACT` |
| `js/09-conta.js` | Firebase: login Google obrigatório, tela de personagens (lista, jogar, criar, apagar, trocar), save da conta na nuvem, ranking | `FIREBASE_CONFIG fbUser acct accountReady MAX_CHARS`, `startAccount() onAuth() loadAccount() renderLogin() renderChars() playChar() newChar() switchChar() deleteChar()`, `accountStore() cloudFlush() accountTick()`, `pushRank() loadRank() panelRank()`, `esc()` |
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
- **Login Google é obrigatório.** Fluxo: tela `#login` → "Entrar com Google" → **tela de personagens** (lista da conta com Jogar/Apagar, "Criar novo personagem", até `MAX_CHARS` = 5) → jogo. `accountReady` só fica `true` com um personagem em jogo; fora disso `save()` não faz nada (evita gravar estado vazio por cima da conta). Não mude essa proteção.
- Conta: `acct = {chars: [personagem, ...], savedAt}`. Cada personagem é um estado `S` completo com id `S.cid` (`'c' + dígitos`). `save()` → `accountStore()` coloca o `S` atual em `acct.chars` (pelo `cid`), grava a cópia local `localStorage['cacada-vibora-v1:' + uid]` e marca a nuvem. `accountTick()` envia `acct` inteiro como texto JSON para `viboraSaves/{uid}.data` no máximo a cada 20 s; `cloudFlush()` envia na hora (sair da aba, trocar de personagem, sair da conta, apagar).
- No login vale a versão mais nova (`savedAt`) entre nuvem e cópia local. `toAcct()` aceita o formato antigo (um personagem só). O save antigo sem conta (`localStorage['cacada-vibora-v1']`) vira um personagem da conta no primeiro login e é apagado.
- Ranking: tela cheia, com abas por classe (busca `where('cls','==',classe)` e ordena no navegador, sem índice composto). **Uma linha por personagem** em `ranking/{uid}_{cid}` com `{name, lv, par, score, cls, build, kills, updated}`; `score = lv + par + fração da barra de XP`. Enviado ao jogar, ao subir de nível/Paragon e a cada 60 s se mudou. Apagar o personagem apaga a linha dele. Só o nome do herói é público; nome/e-mail do Google nunca vão para o ranking.
- Erro `permission-denied` ao carregar = as regras publicadas no Console estão desatualizadas (falta `viboraSaves` ou o formato novo de `ranking`). A solução é publicar o `firestore.rules` desta pasta.
- **Todo texto vindo do Firestore passa por `esc()` antes de ir para `innerHTML`.**
- Só `09-conta.js` fala com o Firebase. Outros arquivos usam as funções dele.
- **`firestore.rules` contém as regras do jogo Loner (players, progress, messages, playerCalls...). Nunca apague nem substitua essas partes.** Para uma coleção nova, adicione um `match` novo **antes** do bloco final `match /{document=**}` (que bloqueia todo o resto). Se mudar os campos de `ranking` ou `viboraSaves`, atualize o `hasOnly([...])` e as validações. Depois de editar, o dono precisa colar o arquivo em Console Firebase › Firestore › Regras › Publicar.
- Domínios autorizados no login: `localhost`, `lohnner.github.io` (Authentication › Configurações).

### Classes e balanceamento
- Cada classe tem 4 ativas e 5 passivas em `CLASS_KIT`; `setClass()` troca `ACTIVE/PASSIVE` ao entrar com o personagem (`playChar`) e a barra é refeita com `buildSkillbar()`. As teclas 1–4 seguem `ACTIVE`.
- O espaço da arma continua com a chave `'bow'` (compatibilidade); o nome mostrado vem de `SLOT_N.bow` / `itemSlotN()`.
- Os atributos `pois`/`pdur` (itens, passivas, Paragon) valem para o dano ao longo do tempo da classe: veneno no Arqueiro, sangramento no Guerreiro. Textos usam `dotN()`/`dotT()`.
- Sangramento dói 50% mais enquanto o monstro anda (`monUpdate`).
- Itens: armas e lendários com +habilidade têm `it.cls`; só a classe certa equipa (`canUse()`). 25% dos drops saem para a outra classe; o mercador vende só da sua classe.
- Mochila: `INV_MAX` = 10. Saves antigos com mais itens não perdem nada: os excedentes aparecem em vermelho e o herói não pega mais itens até liberar espaço.
- Pontos de habilidade podem ser gastos em qualquer lugar; redistribuir tudo só na vila.
- Balanceamento atual (simulação de 3 min por classe em nv 5/15/25/35, itens raros do nível, todas as ativas usadas ao ficar prontas): Guerreiro mata ~11–24% mais por minuto que o Arqueiro e recebe bem mais dano, sem mortes. Ao mexer em números, rode de novo uma simulação parecida (ver "Como rodar e testar") e compare as duas classes.

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
- Depois de qualquer mudança, confira: sem erros no console, tela de login aparece, mapa anda com `step`, todas as abas abrem (`ACT.tab('maps'|'hero'|'bag'|'rank'|'rules')`), e as duas classes jogam.
- Simulação de balanceamento: crie o personagem com `defaults(cls)` + `playChar()`, ponha `accountReady = false` (não salva), suba `S.lv`, distribua pontos, equipe `genItem(lv, 2, slot, cls)` em cada espaço, `S.cfg.ret = 0`, `enterMap(mapa)` e rode `step(.05)` em laço chamando `manualCast(id)` para cada ativa pronta. Meça `S.kills` por minuto, mortes (`mode === 'dead'`) e menor vida.

## Publicar
Enviar `index.html`, `css/`, `js/` (e `firestore.rules`, só como registro) para `lohnner/Loner` pelo site do GitHub; o Pages atualiza em 1–2 min. Se mudou `firestore.rules`, publicar também no Console do Firebase.
