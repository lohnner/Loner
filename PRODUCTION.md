# Produção e transporte de paletes

- As empresas possuem caminhos no mapa. O atalho da cidade aponta para o acesso no mapa; as fábricas dos jogadores exigem chegar ao pátio para comprar ou retirar.
- A fábrica de massas inicia outro ciclo de seis horas ao colocar o palete no estoque. Um segundo palete pode terminar e aguardar espaço, sem acumular produção ilimitada.
- O estoque gera chamadas públicas com empresa, proprietário, destino e pagamento. Publicações são idempotentes e falhas de publicação não apagam paletes.
- Retirada reserva a chamada e carrega o caminhão na mesma transação. Paletes contratados permanecem no caminhão até a entrega.
- Chegar à cidade não entrega automaticamente: use **ENTREGAR PALETES**. A entrega, o pagamento e o repasse ao proprietário são registrados atomicamente. O proprietário recebe seu repasse uma única vez.

## Verificação

Execute `node tests/production.cjs` e `node --check script.js`.
Os testes usam transações simuladas e cobrem produção, estoque cheio, migração, acesso, retirada repetida, falha de conexão, entrega e repasse único. A interface também foi verificada em Edge headless nos tamanhos desktop e celular. As regras foram compiladas pelo Firebase.

## Publicação

Publique o frontend e as regras juntos: `firebase deploy --only hosting,firestore:rules --project loner-hq`.

Em 05/09/2026, a tentativa de validação da publicação compilou as regras, mas o Firebase Hosting respondeu HTTP 429 por cota de armazenamento esgotada. É necessário liberar armazenamento ou ampliar a cota antes de publicar esta versão. O envio ao GitHub não atualiza, por si só, o Firebase Hosting.
