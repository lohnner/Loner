# Loner

Jogo de celular de criar animais: o jogador compra um macho e uma fêmea no mercado, coloca para acasalar, vende os filhotes (ou qualquer animal) e faz dinheiro em euros. Página estática, **sem build e sem módulos**: `index.html` + `css/estilo.css` + `js/01..09`. Textos em português do Brasil. Feito primeiro para celular em pé; no PC fica numa coluna central.

- Site: GitHub Pages do repositório `lohnner/Loner` → https://lohnner.github.io/Loner/
- Backend: Firebase, projeto **`loner-hq`** (login Google + Firestore). O projeto é **dividido com outros jogos** — ver regras abaixo.
- Os arquivos do jogo ficam em `Documentos\Loner`. O dono publica pelo GitHub Desktop; o Git não está na linha de comando deste PC.
- O jogo anterior (ARPG, até a versão 45) só existe no histórico de commits de `lohnner/Loner`.

## Onde fica cada coisa

| Arquivo | O que tem | Nomes principais |
|---|---|---|
| `index.html` | HTML das áreas fixas e a ordem dos scripts | `#tela #nav #sheet #toast #login #upd` |
| `css/estilo.css` | Todo o visual; cores em variáveis no `:root` | — |
| `js/01-base.js` | Atalhos, **todo o balanceamento**, status e classificações, relógio de Brasília, estado salvo | `DINHEIRO_INICIAL espacoPreco CICLO_MERCADO MARGEM_COMPRA MARGEM_VENDA GRAVIDEZ_MIN/MAX PARTO IDADE_FERTIL IDADE_PISO STATUS RANKS CURVA_RANK agora() diaBR() defaults() normalize() S diario() save()` |
| `js/02-especies.js` | As 50 espécies e os textos da Wikipédia; categorias | `ESPECIES ESP CATEGORIAS categoria() fotoEsp()` |
| `js/03-creditos.js` | Autor e licença de cada foto (gerado ao baixar) | `CREDITOS` |
| `js/04-animais.js` | Idade, morte, classificação, valor, fusão genética | `rankDe() idadeDe() morreEm() fertil() fatorIdade() multRank() valorDe() precoCompra() precoVenda() fundeStatus() statusDaFaixa()` |
| `js/05-mercado.js` | Mercado sorteado por ciclo, índice de preço, terreno, compra e venda | `rng() cicloDe() indice() mercado() oferta() jaComprado() espacosTotal() especiesNoTerreno() temEspaco() comprarEspaco() comprar() vender() patrimonio()` |
| `js/06-criadouro.js` | Casais e o passar do tempo | `casalDe() animal() formaCasal() motivoCasal() repetir() pareados() processar() nascimentosNovos` |
| `js/07-telas.js` | As 5 telas, as janelas de detalhe e todas as ações de botão | `telaMercado telaAnimais telaAcasalar telaWiki telaConta TELAS abreSheet() renderSheet() renderAba() atualizaTimers() tick() ACT` |
| `js/08-conta.js` | Firebase: login Google e save na nuvem. **Só este arquivo fala com o Firebase** | `FIREBASE_CONFIG SAVES fbInit() onAuth() loadAccount() accountStore() cloudFlush() accountTick()` |
| `js/09-inicio.js` | Hora do servidor, aviso de atualização, liga tudo; expõe `window.__game` | `GAME_V checkUpdate() relogioPronto ACT.update` |
| `img/animais/{id}.jpg` | Foto de cada espécie (360×360), da Wikimedia Commons | — |
| `versao.json` | Versão publicada (`{"v": N}`, o mesmo do `?v=N`) | — |
| `manifest.json`, `sw.js`, `icones/` | App instalável / APK (PWA). O `sw.js` não guarda cache de propósito | — |
| `firestore.rules` | Regras do Firestore de todos os jogos do projeto. Cópia do que está no Console | — |
| `raiz-lohnner.github.io/` | Arquivos do login Firebase publicados em outro repositório (ver abaixo) | — |

## Regras do jogo

- **Dinheiro**: começa com `DINHEIRO_INICIAL` (€ 5.000). Sem animais e com menos de `AJUDA_LIMITE`, ganha `AJUDA_VALOR` para o jogo não travar (`processar`).
- **Status e classificação**: 5 status de 0 a 100 (`STATUS`). A média dá a classificação de E a S (`RANKS`) e o multiplicador de preço (`CURVA_RANK`).
- **Idade**: cada meia-noite de Brasília (UTC−3, sem horário de verão) soma 1 ano para todos (`diaBR`). `a.idade0` = idade no dia `a.dia0`. Ao chegar à `vida` da espécie o animal morre naquela meia-noite (`morreEm`). Quanto mais velho, mais barato, na compra e na venda (`fatorIdade`).
- **Preço**: `valorDe` = preço da espécie × classificação × idade. Compra = valor × índice × `MARGEM_COMPRA`; venda = valor × índice × `MARGEM_VENDA`. O índice de cada espécie varia entre 0,8 e 1,2 e fica parado durante o ciclo. Com essas margens não existe lucro só comprando e revendendo.
- **Mercado**: troca a cada `CICLO_MERCADO` (5 min) e é sorteado pelo número do ciclo: é igual para todos e não dá para forçar novo sorteio. Mostra `ESPECIES_NO_MERCADO` espécies, cada uma com 1 macho e 1 fêmea; sempre há uma Básica e uma Comum. O que foi comprado fica em `S.comprados` (só do ciclo atual).
- **Terreno**: cabem `ESPACOS_INICIAIS` (3) **espécies**, sem limite de animais por espécie; cada espaço a mais custa `espacoPreco(k)`. A vaga é liberada quando o último animal da espécie é vendido ou morre.
- **Acasalar**: macho e fêmea da mesma espécie, com pelo menos `IDADE_FERTIL` (1 ano). Sorteio de 1 a 3 h para engravidar, depois 1 h até nascer. Os status do filhote são calculados ao engravidar (`fundeStatus`), e o pai pode morrer sem perder a gestação. Grávida e pai não podem ser vendidos. Depois do parto o casal fica em `pronto` e o jogador manda acasalar de novo.
- **Tempo com o jogo fechado**: tudo são horários; `processar(t)` coloca o jogo em dia. A hora vem do cabeçalho `Date` do `versao.json` (`relogioDif`), então mudar o relógio do celular não apressa nada.
- **Balanceamento medido** (jogador simples, olha 5× por dia, vende todo filhote; 3 simulações de 30 dias, uma delas interrompida no dia 15 pelo limite de tempo da simulação): € 10 mil em 1–2 dias, € 100 mil em 5–7 dias, € 1 milhão em ~12 dias. Um casal se paga com 1,5 a 3 filhotes. Ao mexer em números, rode de novo uma simulação parecida. Em simulações, ponha um limite de tempo no laço: a população pode explodir e travar a aba.
- **Preços das espécies** são estimativas: há pouca fonte confiável para animais exóticos, e alguns valores foram ajustados para a progressão.

## Como os arquivos se enxergam

- São scripts clássicos carregados **em ordem** pelo `index.html`. Tudo que um arquivo declara no topo fica visível para os outros. **Não use `import/export`** nem envolva arquivo em `(() => {...})()`.
- Código que roda na hora em que o arquivo carrega só pode usar o que veio de arquivos **anteriores**. Dentro de funções pode chamar qualquer arquivo.
- Botões chamam ações por `data-act="nome"` + `data-v="valor"` → `ACT.nome(valor)` em `07-telas.js`.
- **Todo texto de fora (Firestore, conta Google) passa por `esc()` antes de ir para `innerHTML`.**
- Campo novo no estado: coloque em `defaults()`; `normalize()` mistura com os saves antigos. Não renomeie campos existentes de `S`.

## Firebase e login

- **Login Google é obrigatório.** `accountReady` só fica `true` com a conta carregada; fora disso `save()` não faz nada (evita gravar estado vazio por cima da conta). Não mude essa proteção.
- Save: `S` como texto JSON em `criadouroSaves/{uid}.data`, enviado no máximo a cada `CLOUD_EVERY` (20 s) e ao sair da aba; cópia local em `localStorage['loner-criadouro-v1:' + uid]`. No login vale o mais novo (`savedAt`). O limite das regras é de 900 mil caracteres.
- O jogo roda todo no aparelho do jogador: as regras protegem a conta de cada um, mas não impedem alguém de editar o próprio save.
- **`firestore.rules` contém as regras de outros jogos do projeto (`players`, `progress`, `messages`, `playerCalls`, `viboraSaves`, `ranking`...). Nunca apague nem substitua essas partes.** Coleção nova: adicione um `match` **antes** do bloco final `match /{document=**}`. Depois de editar, o dono precisa colar o arquivo em Console Firebase › Firestore › Regras › Publicar.
- Erro `permission-denied` ao carregar = as regras publicadas estão sem o bloco `criadouroSaves`.
- Domínios autorizados no login: `localhost`, `lohnner.github.io`.
- **Login no app (APK) e `authDomain`:** no site publicado o `authDomain` é `lohnner.github.io` (`SITE_HOST`); em outros endereços continua `loner-hq.firebaseapp.com`. Os arquivos de login ficam em `raiz-lohnner.github.io/` e são publicados no repositório **`lohnner/lohnner.github.io`**. No Google Cloud (loner-hq › APIs e serviços › Credenciais › cliente OAuth Web) precisa estar `https://lohnner.github.io/__/auth/handler` nos URIs de redirecionamento. Dentro do app (`inApp()`) o login sai por `signInWithRedirect`; no navegador, por popup.

## Como rodar e testar

`file://` não serve (o login não funciona). No Claude Code desktop use `preview_start` com `.claude/launch.json`, ou:

```bash
python -m http.server 4190 --bind 127.0.0.1 --directory "C:\Users\rodri\OneDrive\Documentos\Loner"
```

Abra http://localhost:4190. O navegador guarda os `.js` em cache: recarregue com Ctrl+F5.

- Para testar sem conta Google real, faça uma cópia num diretório temporário e troque os 3 `<script>` do firebasejs no `index.html` por um Firebase falso que guarda no `localStorage` (`auth` com `onAuthStateChanged/getRedirectResult/signInWithPopup/signOut` e `firestore().collection(n).doc(id).get/set/delete`). Não teste escrevendo no Firestore real.
- Para avançar o tempo no console: `relogioDif += 3600e3; tick();` (1 hora).
- Depois de qualquer mudança, confira: sem erros no console, login aparece, as 5 telas abrem, comprar → acasalar → grávida → nascer → vender funciona, e o jogo recarrega igual.
- Ao editar com PowerShell, não use listas aninhadas `@(@(a,b))` para trocas de texto: prefira a ferramenta de edição.

## Publicar

- **Antes de publicar, aumente a versão `?v=N`** em todos os `<script src="js/...">` e no `<link href="css/estilo.css">` do `index.html` (todos com o mesmo número) **e coloque o mesmo N no `versao.json`**.
- Publicar `index.html`, `versao.json`, `manifest.json`, `sw.js`, `icones/`, `img/`, `css/`, `js/` e `firestore.rules` em `lohnner/Loner` pelo GitHub Desktop. O Pages atualiza em 1–2 min. Se mudou `firestore.rules`, publique também no Console do Firebase, **antes** do site.
- APK (Android): é uma TWA que abre https://lohnner.github.io/Loner/, então publicar no GitHub já atualiza o conteúdo. A orientação da tela é gravada no APK ao gerar no PWABuilder: o APK gerado para o jogo antigo continua deitado até ser gerado de novo. **Guarde a chave de assinatura (`signing.keystore` + senhas)**: sem ela não dá para lançar versão nova na Play Store. O `assetlinks.json` fica em `lohnner.github.io/.well-known/assetlinks.json`.
