# Produção e transporte de paletes

- Somente as propriedades compráveis de massas, agricultura, farmacêutico e vinícola possuem acesso próprio. O trajeto aparece durante a viagem até o pátio, como nas viagens entre cidades; não há linhas permanentes para todas as fábricas.
- As demais empresas continuam no mercado aleatório de fretes dentro das cidades, com o botão **VER EMPRESA** e sem novos pontos ou caminhos no mapa.
- Há apenas a fábrica de massas de Campinas. As antigas unidades de Mauá e Paraibuna foram retiradas; seus dados ficam arquivados no progresso, sem compra ou produção. Entregas já iniciadas continuam válidas. A página Chamadas dos Jogadores foi removida.
- No pátio de uma fábrica de massas, a Visão Geral mostra a fábrica e a retirada dos paletes.
- O mapa agrupa dois ou mais jogadores parados no mesmo local em um contador clicável, com lista, seleção e perfil. Cidade e pátio são locais distintos.
- Jogadores somem após 48 horas sem ação real. Atualizações automáticas e login sem ação não renovam a presença; ações autenticadas restauram a exibição. Perfis antigos usam a última presença conhecida até registrarem a primeira ação na nova versão.
- A fábrica de massas inicia outro ciclo de seis horas ao colocar o palete no estoque. Um segundo palete pode terminar e aguardar espaço, sem acumular produção ilimitada.
- O estoque gera chamadas públicas com empresa, proprietário, destino e pagamento. Publicações são idempotentes e falhas de publicação não apagam paletes.
- Retirada reserva a chamada e carrega o caminhão na mesma transação. Paletes contratados permanecem no caminhão até a entrega.
- Chegar à cidade não entrega automaticamente: use **ENTREGAR PALETES**. A entrega, o pagamento e o repasse ao proprietário são registrados atomicamente. O proprietário recebe seu repasse uma única vez.

## Verificação

Execute `node tests/production.cjs`, `node tests/map-expansion.cjs` e `node --check script.js`.
Os testes usam transações simuladas e cobrem produção, estoque cheio, migração, acesso, retirada repetida, falha de conexão, entrega e repasse único. A interface também foi verificada em Edge headless nos tamanhos desktop e celular. As regras foram compiladas e publicadas no Firebase com autorização do proprietário.

## Publicação

As regras de chamadas e retiradas já foram publicadas em 05/09/2026. Para futuras publicações completas: `firebase deploy --only hosting,firestore:rules --project loner-hq`.

Em 05/09/2026, a tentativa de validação da publicação compilou as regras, mas o Firebase Hosting respondeu HTTP 429 por cota de armazenamento esgotada. É necessário liberar armazenamento ou ampliar a cota antes de publicar esta versão. O envio ao GitHub não atualiza, por si só, o Firebase Hosting.


## Nomes no mapa

- A aba Mapa usa o estilo Liberty do OpenFreeMap (https://openfreemap.org/quick_start/), salvo em `assets/maps/liberty.json`, com MapLibre integrado ao Leaflet.
- Apenas rótulos de cidades cadastradas são filtrados, por nome e proximidade das coordenadas do cadastro. As bolinhas e os nomes do jogo permanecem. Estados, bairros, vias e cidades não cadastradas conservam seus rótulos.
- Novas cidades do cadastro entram automaticamente no filtro. A prévia de rotas mantém sua camada original.
- Se o mapa vetorial não puder carregar, o mapa original aparece com um aviso de que os nomes duplicados não puderam ser ocultados.
- Verifique com `node tests/map-labels.cjs`. O resultado também foi conferido no Edge com os nomes de São Paulo, Santo André e Mauá removidos do fundo e Cubatão preservado.

## Entregas por NPC

- Botão **Pedir Para Alguém Entregar** em paletes prontos do próprio jogador, nas unidades de massas, arroz, medicamentos e vinho.
- NPC reservado exclusivamente por palete, sem ocupar o caminhão do proprietário, inclusive quando ele está em outra cidade ou viagem.
- Rota rodoviária persistida, velocidade de 60 km/h, marcador de caminhão e linha roxa no mapa ao vivo.
- Pagamento líquido: massas R$ 1.000,00; arroz R$ 1.666,67; medicamentos R$ 2.666,67; vinho R$ 2.333,33 (dois terços do valor original).
- O pagamento ocorre após a chegada, em transação única. Viagens continuam pelo tempo decorrido com o jogo fechado; o crédito é sincronizado na volta do proprietário.
- Falha no cálculo da rota ou na reserva mantém a carga no estoque. O palete fica indisponível para retirada por jogadores após a reserva do NPC.
- As regras documentadas em `NPC-DELIVERY-RULES.md` foram compiladas sem avisos e publicadas no Firestore de `loner-hq` em 10/09/2026. A reserva e a conclusão por NPC estão habilitadas no servidor.
- Testes locais: `node tests/npc-deliveries.cjs`, `node tests/pasta-pickup-selection.cjs`, `node tests/production.cjs` e `node tests/map-live-updates.cjs`.
