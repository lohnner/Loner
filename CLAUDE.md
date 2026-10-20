# Loner

ARPG "idle" de celular e PC: o herói caça sozinho, o jogador usa as habilidades, troca itens e sobe de nível. Classes: **Arqueiro** (veneno, ataca de longe e recua), **Guerreiro** (sangramento, corpo a corpo com espada de uma mão, +40% de vida, mais armadura, 15% menos dano recebido e 1,5% de roubo de vida inato) e **Mago** (fogo/queimadura, ataca de longe com explosões em área, 8% menos vida). Página estática, **sem build e sem módulos**: `index.html` + `css/estilo.css` + `js/01..10`. Textos do jogo em português do Brasil.

- Site: GitHub Pages do repositório `lohnner/Loner` → https://lohnner.github.io/Loner/ (este jogo substituiu o antigo Loner de caminhão).
- Backend: Firebase, projeto **`loner-hq`** (login Google + Firestore). O projeto é **dividido com o jogo Loner** (caminhões) — ver regras abaixo.
- O Git não está instalado no PC do dono: a publicação é feita enviando os arquivos pelo site do GitHub (Add file › Upload files).

## Onde fica cada coisa

| Arquivo | O que tem | Nomes principais |
|---|---|---|
| `index.html` | Só o HTML (HUD, canvas, barra de habilidades, abas, gaveta `#sheet`, diálogo `#dlg`, telas `#create` e `#login`, cartão da vila com Vender/Mercador/Armazém/Partir) e a ordem dos scripts | — |
| `css/estilo.css` | Todo o visual. Cores em variáveis no `:root` | — |
| `js/01-base.js` | Atalhos, constantes e dados fixos do jogo (mapas, monstros, classes, habilidades, armas, afixos, raridades, orbes); estado salvo `S` | `$ rnd clamp D fmt n1 pc`, `MAX_LV RANGE MELEE INV_MAX SK_MAX STASH_MAX`, `RAR AFF_N LEG_R migrateItem()`, `ELEM RES_MAX RES_KEYS MON_EL`, `MAPS MONS SKD CLASS_KIT ACTIVE PASSIVE setClass() clsOf() isWar() isMage() DOT_INFO dotN() dotT() dotDe()`, `ORBS`, `SLOTS SLOT_N WEAPON_N BOWS BLADES STAVES WEAPONS weaponBases(cls) AFX`, `invUsed() invFull() orbStacks()`, `CLASSES BUILDS buildsFor()`, `defaults(cls) normalize() readLocal() save()`, `S` |
| `js/02-modelos.js` | Itens (com classe e nível exigido), melhoria por orbe e status | `genItem(ilvl, rar, slot, cls) RAR_F addAffixes() addSkill() normalAffix() upgradeItem() canUse() reqLv() canEquip() clsName() rollRar() rollShop() buyPrice sellPrice`, `calcStats()` (dps estimado por classe), `ST`, `refreshStats()`, `xpNeed ptsFree skDesc()` |
| `js/03-mapa.js` | Canvas/câmera, listas do mundo, efeitos, chão/decoração, vila, entrar em mapa | `cv ctx cam zoom hero mons projs clouds drops cds`, `scene mode`, `log() txt() part() ring()`, `makeGround() makeDecor() makeMon() spawnPack() packSize() SOLO_MAP SOLO_GAP enterMap() enterTown() startPortal() depart()` |
| `js/04-batalha.js` | Veneno, sangramento e queimadura, dano, morte (Contágio/Sede de Sangue/Combustão), loot e orbes, XP/nível/Paragon, ataque básico (flecha, golpe ou brasa) e as 12 ativas (`cast/doSkill`) | `poison() bleed() burn() poisonLeft bleedLeft burnLeft applyDot dotLeft DOT_C()`, `dealHit() meleeHit() spellHit() explode() plagueBurst() kill() dropItem() gainXp() gainParagon() PARA parFree hurtHero()`, `fireBasic() manualCast() cast() doSkill()`, `BURST_R RUPT_R CLEAVE_REACH CHARGE_LEN INFERNO_R WAVE_LEN WAVE_SPREAD whirlR() meteorR()` |
| `js/05-habilidades.js` | Mira manual (arrastar no celular / segurar tecla no PC) do Leque, Chuva, Investida, Onda de Chamas e Meteoro; alvo fixo por clique; desenho da mira | `AIMABLE aim aimPoint() aimRelease()`, `fanPointBlank()`, `focus getFocus() setFocus() hoverMon()`, `drawAim() drawFocus()` |
| `js/06-cena.js` | Simulação: IA do herói (pega drops primeiro; Arqueiro/Mago recuam, Guerreiro avança), Investida/Giro em andamento, monstros, vila, portal, `step(dt)` | `canPick() nearestDrop() PICK_RANGE heroAI() dashBoom() heroTimers() monUpdate() step()` |
| `js/07-animacoes.js` | Desenho e o loop. Heróis e criaturas em pé, de lado, com volume (degradês de luz e sombra) | `shade() sphere() cyl() egg() eyeDot() heroPose() drawHero() drawArcher() drawWarrior() drawMage() drawDecor() ROCK_C drawMon() monBiped() monQuad() monSpider() monBlob() MON_DECO MON_H monH() drawItemDrop() drawOrbDrop() drawBars() render()`, `frame()` (chama `step`, `render`, `updateHud`, `save` a cada 5s, `accountTick`) |
| `js/08-hud.js` | Interface: ícones, barra de habilidades, painéis (Mapas, Herói, Mochila e Armazém centralizados, Ranking em tela cheia, Regras), diálogo de item (comparação ganha/perde, "só Guerreiro", nível exigido, usar orbe, guardar no armazém), janela do orbe, criação de personagem, **todas as ações de botão** (`ACT`) e eventos de teclado/mouse/toque | `ICON_SK ICON_BOW ICON_SWORD ICON_STAFF ICON_ORB WEAPON_ICON CLS_ICON DEF_NAME itemIcon() itemSlotN() orbTile() updateHud() buildSkillbar() openTab() renderPanel() panelHero() panelBag() panelStash() renderDlg() renderOrbDlg() itemDiff() showCreate()`, `ACT` |
| `js/09-conta.js` | Firebase: login Google obrigatório, tela de personagens (lista, jogar, criar, apagar, trocar), save da conta na nuvem, armazém da conta, ranking | `FIREBASE_CONFIG fbUser acct accountReady MAX_CHARS`, `startAccount() onAuth() loadAccount() renderLogin() renderChars() playChar() newChar() switchChar() deleteChar()`, `accountStore() cloudFlush() accountTick()`, `stash() stashId() stashOrbs() stashUsed()`, `pushRank() loadRank() panelRank()`, `esc()` |
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
- Conta: `acct = {chars: [personagem, ...], stash: [itens], savedAt}`. Cada personagem é um estado `S` completo com id `S.cid` (`'c' + dígitos`). `save()` → `accountStore()` coloca o `S` atual em `acct.chars` (pelo `cid`), grava a cópia local `localStorage['cacada-vibora-v1:' + uid]` e marca a nuvem. `accountTick()` envia `acct` inteiro como texto JSON para `viboraSaves/{uid}.data` no máximo a cada 20 s; `cloudFlush()` envia na hora (sair da aba, trocar de personagem, sair da conta, apagar).
- No login vale a versão mais nova (`savedAt`) entre nuvem e cópia local. `toAcct()` aceita o formato antigo (um personagem só) e mantém o `stash`. O save antigo sem conta (`localStorage['cacada-vibora-v1']`) vira um personagem da conta no primeiro login e é apagado.
- Ranking: tela cheia, com abas por classe (busca `where('cls','==',classe)` e ordena no navegador, sem índice composto). **Uma linha por personagem** em `ranking/{uid}_{cid}` com `{name, lv, par, score, cls, build, kills, updated}`; `score = lv + par + fração da barra de XP`. Enviado ao jogar, ao subir de nível/Paragon e a cada 60 s se mudou. Apagar o personagem apaga a linha dele. Só o nome do herói é público; nome/e-mail do Google nunca vão para o ranking.
- Erro `permission-denied` ao carregar = as regras publicadas no Console estão desatualizadas (falta `viboraSaves` ou o formato novo de `ranking`). A solução é publicar o `firestore.rules` desta pasta.
- **Todo texto vindo do Firestore passa por `esc()` antes de ir para `innerHTML`.**
- Só `09-conta.js` fala com o Firebase. Outros arquivos usam as funções dele.
- **`firestore.rules` contém as regras do jogo Loner (players, progress, messages, playerCalls...). Nunca apague nem substitua essas partes.** Para uma coleção nova, adicione um `match` novo **antes** do bloco final `match /{document=**}` (que bloqueia todo o resto). Se mudar os campos de `ranking` ou `viboraSaves`, atualize o `hasOnly([...])` e as validações. Depois de editar, o dono precisa colar o arquivo em Console Firebase › Firestore › Regras › Publicar.
- Domínios autorizados no login: `localhost`, `lohnner.github.io` (Authentication › Configurações).

### Classes, itens e balanceamento
- Cada classe tem 4 ativas e 5 passivas em `CLASS_KIT`; `setClass()` troca `ACTIVE/PASSIVE` ao entrar com o personagem (`playChar`) e a barra é refeita com `buildSkillbar()`. As teclas 1–4 seguem `ACTIVE`. Com o mouse sobre uma criatura, Flecha Venenosa, Explosão de Praga e Bola de Fogo vão nela.
- Rank máximo das habilidades: 7 (`SK_MAX`; Contágio/Sede de Sangue/Combustão 5). `normalize()` corta ranks acima e o resto vira ponto livre. Pontos podem ser gastos em qualquer lugar; redistribuir tudo só na vila.
- O espaço da arma continua com a chave `'bow'` (compatibilidade); o nome mostrado vem de `SLOT_N.bow` / `itemSlotN()`.
- Os atributos `pois`/`pdur` (itens, passivas, Paragon) valem para o dano ao longo do tempo da classe: veneno no Arqueiro, sangramento no Guerreiro, queimadura no Mago. Textos usam `dotN()`/`dotT()`/`dotDe()` (`DOT_INFO`). Classe nova: entrada em `SKD`, `CLASS_KIT`, `DOT_INFO`, `WEAPONS`/`WEAPON_N`/`WEAPON_ICON`, `CLASSES`, `BUILDS`, `startWeapon`, `calcStats` (passivas e dps), `skDesc`, `manualCast/doSkill`, ícones, `drawHero` e `DEF_NAME`.
- Sangramento dói 50% mais enquanto o monstro anda (`monUpdate`).
- Tipos de dano das criaturas (`ELEM` em 01): Físico, Fogo, Gelo, Elétrico, Caos, Veneno, Necrótico, Psíquico. `MON_EL` (01) diz quem bate com o quê (vira `MONS[k].el`; sem entrada = físico; a cor do projétil `ranged` acompanha). Em `hurtHero()` (04): físico é reduzido pela armadura; os outros por metade da armadura + `ST.res[tipo]` (máx. `RES_MAX` = 75%). Resistências vêm dos afixos `rf rc rl rx rp rn rs` e `rall` (fogo+gelo+elétrico), calculadas em `calcStats()` (02); inatas: Arqueiro +20% veneno, Mago +20% fogo. Painel do Herói mostra as resistências; o de Mapas mostra o tipo de dano de cada criatura. Tipo novo: entrada em `ELEM`/`RES_KEYS`, afixo em `AFX`/`SUF`, chave no `a` e no `st.res` de `calcStats` e rótulo em `DIFF_L` (08).
- Ultimates: Explosão de Praga (Arqueiro) é uma flecha que explode na criatura atingida (`plagueBurst`, raio `BURST_R` = 170); Ruptura (Guerreiro) e Inferno (Mago) explodem em volta do herói. A Investida (Guerreiro) termina com uma explosão pequena (`dashBoom`, raio `DASH_BOOM_R` = 65, em 06).
- Raridades (`RAR` em 01, cores também em `--r0..--r4` no CSS): Comum (branco, 0 atributos), Incomum (verde, 1), Raro (azul, 2), Épico (roxo, 3), Lendário (amarelo, 4 + a +habilidade da classe, `LEG_R` = 4). O número de atributos é `AFF_N[rar]`; a força da base/atributos é `RAR_F` (02). `--perf` (laranja) é a cor do ◆ "atributo perto do máximo". Saves com `ver < 3` (e armazém sem `acct.rv`) passam por `migrateItem()`: o antigo Lendário (3) vira 4 e Mágico/Raro viram a raridade do número de atributos.
- Nível exigido dos itens: `reqLv(it)` = ilvl − 3 (Comum), −2 (Incomum e Raro), −1 (Épico), ilvl (Lendário), entre 1 e 40. É calculado (não fica salvo), então vale para itens antigos. Equipar exige `canEquip()` (classe certa e nível).
- Itens: armas e lendários com +habilidade têm `it.cls`; só a classe certa equipa (`canUse()`). 25% dos drops saem para outra classe; o mercador vende só da sua classe.
- Orbes (`ORBS` em 01, chance própria em qualquer criatura): um por melhoria — **Despertar** `desp` (5%, Comum → Incomum), **Ascensão** `asc` (2,5%, → Raro), **Exaltação** `exa` (1%, → Épico), **Lenda** `lenda` (0,3%, → Lendário, ganha a +habilidade) — e a **Anulação** `anul` (1,5%, `rm`), que tira 1 atributo aleatório e baixa 1 raridade (num Lendário tira também a +habilidade). `ORBS[k].ok(it)` diz em quais itens serve. Ficam em `S.orbs` (por personagem), empilhados: cada tipo ocupa 1 espaço da mochila. Use sempre `invUsed()`/`invFull()` para espaço da mochila (nunca `S.inv.length`). Uso em `upgradeItem()` (02; sobe/desce a base pela razão de `RAR_F`); drop no chão tem `d.orb` em vez de `d.it` (`canPick`, `drawOrbDrop`). Orbe novo: entrada em `ORBS` e no `orbs` de `defaults()`.
- Mochila: `INV_MAX` = 10. Saves antigos com mais itens não perdem nada: os excedentes aparecem em vermelho e o herói não pega mais itens até liberar espaço.
- Armazém da vila: `acct.stash` (da conta, dividido entre personagens, salvo junto em `viboraSaves`), `STASH_MAX` = 10, `stash()`/`stashId()` em 09 (ids grandes para não colidir com os de cada personagem); painel `panelStash()` e ações `stashPut/stashTake` em 08. Orbes também vão para o armazém: `acct.orbs` (`stashOrbs()`), uma pilha por tipo, ações `orbPut/orbTake` (movem a pilha inteira). Espaço ocupado = `stashUsed()` (itens + pilhas; nunca `stash().length`). Só guarda na vila.
- Criaturas (07): desenhadas em pé, de lado, em "unidades de herói" escaladas por `r/13`, com os pés em `m.y + r*.6`. Cada `kind` tem sua função (`monBiped/monQuad/monSpider/monBlob`) e o detalhe de cada uma vem de `MON_DECO[tipo]` (chapéu, chifres, capuz, ossos, asas...). A barra de vida usa a altura `monH(m)`. Criatura nova: entrada em `MON_DECO` (e em `MON_H` se a altura for diferente do `kind`).
- IA: o herói sempre vai pegar o que caiu (até `PICK_RANGE` = 500) antes de lutar, a não ser que o jogador tenha clicado num alvo (`nearestDrop()` em 06).
- Mapas (`MAPS`, nível mín–máx, libera 1 nível antes): Campos de Trigo 1–5, Floresta Sombria 5–11, Pântano Pútrido 12–16, Mina Abandonada 16–20, Catacumbas 20–24, Picos Gélidos 24–28, Deserto de Cinzas 28–32, Cidadela Profana 32–36, Abismo Ardente 36–40. Cada um tem 3 criaturas em `MONS` e um tipo de decoração (`decor`: field, forest, swamp, mine, crypt, ice, desert, citadel, hell) usado em `makeGround`/`makeDecor` (03) e `drawDecor`/`ROCK_C` (07). Mapa novo: entrada em `MAPS`, criaturas em `MONS` e, se for decoração nova, um caso em `makeDecor` e desenhos em `drawDecor`.
- Spawns: no `SOLO_MAP` (Campos de Trigo) as criaturas nascem sozinhas e a pelo menos `SOLO_GAP` (260) umas das outras; nos outros mapas o grupo é sozinha 35% / dupla 30% / 3–5 35% (`packSize()`).
- Balanceamento atual (simulação de 2,5 min por classe em nv 5/15/25/35, itens raros do nível, todas as ativas usadas ao ficar prontas, sem voltar para a vila): Arqueiro e Mago ficam parecidos (20–26 abates/min); o Guerreiro mata ~5–30% mais e recebe bem mais dano, sem mortes (menor vida ~67%). Ao mexer em números, rode de novo uma simulação parecida (ver "Como rodar e testar") e compare as classes.

### Save e compatibilidade
- Campo novo no estado: coloque em `defaults()` (01-base). `normalize()` mistura o save antigo com os padrões, então saves antigos continuam funcionando. Não renomeie campos existentes de `S`.
- Nível máximo 40 (`MAX_LV`); depois a XP vira Paragon (`S.par`, `S.pxp`, pontos em `S.pp`).

## Como rodar e testar

`file://` não serve (o login Google não funciona). Rode um servidor local na pasta do jogo:

```bash
python -m http.server 4190 --bind 127.0.0.1 --directory "C:\Users\rodri\OneDrive\Documentos\Loner"
```

Abra http://localhost:4190 (`localhost` já está autorizado no Firebase). No Claude Code desktop, use `preview_start` com uma configuração no `.claude/launch.json` em vez de rodar o servidor pelo terminal. O navegador guarda os `.js` em cache: depois de editar, recarregue com `fetch(arquivo, {cache:'reload'})` em cada script ou Ctrl+F5.

Testando pelo console / `javascript_tool`:
- `window.__game` tem `S`, `ST`, `hero`, `ACT`, `step`, `render`, `updateHud`, `manualCast`. As funções globais também podem ser chamadas pelo nome (ex.: `accountTick(1)`, `cloudFlush()`, `gainXp(1000)`).
- Se o painel do navegador estiver escondido, o `requestAnimationFrame` para e o jogo congela. Avance na mão: `for(let i=0;i<500;i++) __game.step(.03); __game.updateHud();`.
- `S.speed = 0` pausa o jogo (é salvo no personagem: volte para 1 depois).
- Para testar login/save/ranking sem conta Google real, faça uma cópia da pasta num diretório temporário e troque os 3 `<script>` do firebasejs no `index.html` por um Firebase falso que guarda dados no `localStorage` (auth com `onAuthStateChanged/signInWithPopup/signOut` e `firestore().collection(n).doc(id).get/set/delete` + `where().orderBy().limit().get()`). Não teste escrevendo no Firestore real.
- Depois de qualquer mudança, confira: sem erros no console, tela de login aparece, mapa anda com `step`, todas as abas abrem (`ACT.tab('maps'|'hero'|'bag'|'rank'|'rules'|'stash')`), e as três classes jogam.
- Simulação de balanceamento: crie o personagem com `defaults(cls)` + `playChar()`, ponha `accountReady = false` (não salva), suba `S.lv`, distribua pontos, equipe `genItem(lv, 2, slot, cls)` em cada espaço, `S.cfg.ret = 0`, `enterMap(mapa)` e rode `step(.05)` em laço chamando `manualCast(id)` para cada ativa pronta. Meça `S.kills` por minuto, mortes (`mode === 'dead'`) e menor vida.
- Ao editar arquivos com PowerShell, não use listas aninhadas `@(@(a,b))` para trocas de texto: o PowerShell achata a lista e a troca vira caractere por caractere (já estragou este arquivo uma vez). Prefira a ferramenta de edição ou uma troca por vez.

## Publicar
- **Antes de publicar, aumente a versão `?v=N`** em todos os `<script src="js/...">` e no `<link href="css/estilo.css">` do `index.html` (todos com o mesmo número). Sem isso, o navegador dos jogadores pode misturar um arquivo novo com um antigo do cache e o jogo quebra (ex.: `stash is not defined`).
- Enviar `index.html`, `css/`, `js/` (e `firestore.rules`, só como registro) para `lohnner/Loner` pelo site do GitHub; o Pages atualiza em 1–2 min. Se mudou `firestore.rules`, publicar também no Console do Firebase.
- O nome do jogo é **Loner**. Os identificadores internos antigos (`cacada-vibora-v1` no localStorage e a coleção `viboraSaves`) ficam como estão: trocar faria os saves sumirem.
