# Produção e transporte de paletes

- Somente as propriedades compráveis de massas, agricultura, farmacêutico e vinícola possuem acesso próprio. O trajeto aparece durante a viagem até o pátio, como nas viagens entre cidades; não há linhas permanentes para todas as fábricas.
- As demais empresas continuam no mercado aleatório de fretes dentro das cidades, com o botão **VER EMPRESA** e sem novos pontos ou caminhos no mapa.
- Há unidades de massas em Campinas, Paraibuna e Mauá, cada uma com compra, estoque e produção independentes. A unidade antiga de Campinas é preservada.
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

## Truck-on-Train

- Use **IR ATÉ A ESTAÇÃO** para percorrer o acesso rodoviário. O embarque só é liberado após a chegada ao terminal.
- O acesso consome diesel e pneus; o trem custa R$ 50 por trecho e preserva os paletes no caminhão.
- A chegada acontece no terminal de destino. Use **IR ATÉ O CENTRO DA CIDADE** para continuar por estrada. A Visão Geral mostra a estação enquanto o caminhão está nela.
- Todas as linhas operam a 200 km/h. Trechos nos dois sentidos incluem São José dos Campos ↔ Guaratinguetá e Piracicaba ↔ Itapetininga (160 km aproximados no jogo).
- Verifique o fluxo com `node tests/truck-on-train.cjs`, incluindo bloqueio do embarque na cidade, consumo rodoviário, tarifa, carga e chegada.
