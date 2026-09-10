# Proposta de regras para entregas por NPC

Status: regras aplicadas, compiladas sem avisos e publicadas no Firestore do projeto loner-hq em 10/09/2026. Incluída tolerância de 1 ms no cálculo da duração para compatibilidade com arredondamento numérico.

## Alteração proposta

Adicionar as funções abaixo dentro de `match /databases/{database}/documents` em `firestore.rules`.
Na condição `allow update` de `/playerCalls/{callId}`, incluir `npcDispatch() || npcDelivery() ||` antes das duas alternativas atuais. Preservar todas as regras de retirada e entrega por jogadores.

Escopo: o dono da produção poderá reservar uma chamada disponível para NPC. A chamada só poderá finalizar após o tempo de viagem no relógio do servidor; o crédito e a conclusão serão gravados na mesma transação. Outros jogadores não poderão reservar nem liquidar o NPC do proprietário. Nenhuma coleção nova ou acesso anônimo será liberado.

```javascript
function npcPay(product) {
  return product == 'pasta' ? 1000.0 : product == 'player-rice' ? 1666.67
    : product == 'wine' ? 2333.33 : product == 'paracetamol' ? 2666.67 : 0.0;
}
function npcDispatch() {
  let trip = request.resource.data.npcTrip;
  return resource.data.status == 'available'
    && resource.data.ownerId == request.auth.uid
    && request.resource.data.status == 'npc_transit'
    && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['status','npcTrip','npcStartedAt','claimedAtMs'])
    && request.resource.data.npcStartedAt == request.time
    && trip is map && trip.npc == true && trip.speed == 60
    && trip.from == resource.data.origin && trip.to == resource.data.destination
    && trip.totalKm is number && trip.totalKm > 0
    && trip.durationMs is int && trip.durationMs > 0
    && trip.durationMs >= trip.totalKm * 60000 - 1
    && trip.durationMs <= trip.totalKm * 60000 + 1
    && trip.end == trip.start + trip.durationMs
    && trip.path is list && trip.path.size() >= 2 && trip.path.size() <= 2001
    && trip.pay == npcPay(resource.data.product) && trip.pay > 0;
}
function npcDelivery() {
  let before = get(/databases/$(database)/documents/progress/$(request.auth.uid)).data;
  let after = getAfter(/databases/$(database)/documents/progress/$(request.auth.uid)).data;
  return resource.data.status == 'npc_transit'
    && resource.data.ownerId == request.auth.uid
    && request.resource.data.status == 'npc_delivered'
    && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['status','deliveredAt','deliveredAtMs'])
    && request.resource.data.deliveredAt == request.time
    && request.time >= resource.data.npcStartedAt + duration.value(resource.data.npcTrip.durationMs, 'ms')
    && after.balance == before.balance + npcPay(resource.data.product);
}
```

## Validação e ativação após autorização

1. Aplicar a proposta em `firestore.rules`.
2. Obter o Firebase CLI se necessário e compilar/testar as regras, incluindo rejeição de outro proprietário, chegada antecipada, mudança da rota após reserva e segunda liquidação.
3. Publicar somente as regras no projeto `loner-hq` com `firebase deploy --only firestore:rules --project loner-hq`.
4. Publicar o código do jogo pelo fluxo habitual de GitHub Pages.

A rota é obtida no serviço rodoviário OSRM e guardada no documento público da chamada. O mapa interpola a posição ao longo da rota persistida. Sem conexão, o relógio da viagem continua; o saldo é creditado uma única vez quando o proprietário reconectar e sincronizar. Os NPCs não usam combustível, pneus ou vagas do caminhão do jogador.

Limitação do modelo atual: assim como o restante deste jogo baseado no cliente, a autenticidade física da quilometragem não é verificada por um serviço de backend. O servidor poderá validar os estados, o proprietário e o tempo mínimo correspondente à distância gravada, mas não recalculará a rota OSRM.
