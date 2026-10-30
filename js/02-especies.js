// As 50 espécies e a Wikipédia do jogo.
// p = preço de referência em euros (estimativa, jovem e nota mediana); vida = expectativa em anos (1 ano = 1 dia real).
'use strict';

const ESPECIES = [
  // Básicas
  {id:'hamster', n:'Hamster-sírio', c:'Mesocricetus auratus', p:12, vida:3, hab:'Estepes da Síria e da Turquia', die:'Onívoro: sementes, grãos e insetos', ges:'16 dias', nota:'Guarda comida nas bochechas, que esticam até perto dos ombros.'},
  {id:'rato', n:'Rato-doméstico', c:'Rattus norvegicus domestica', p:10, vida:3, hab:'Casas, no mundo todo', die:'Onívoro', ges:'21 a 23 dias', nota:'Reconhece o dono e aprende truques com facilidade.'},
  {id:'peixe', n:'Peixe-dourado', c:'Carassius auratus', p:8, vida:15, hab:'Água doce; domesticado na China', die:'Onívoro: ração, algas e larvas', ges:'Ovos: 2 a 7 dias', nota:'É criado há mais de mil anos.'},
  {id:'galinha', n:'Galinha', c:'Gallus gallus domesticus', p:15, vida:8, hab:'Fazendas, no mundo todo', die:'Onívora: grãos e insetos', ges:'Ovos: 21 dias', nota:'Descende de aves selvagens do Sudeste Asiático.'},
  {id:'pato', n:'Pato-real', c:'Anas platyrhynchos', p:20, vida:10, hab:'Lagos do Hemisfério Norte', die:'Onívoro: plantas aquáticas e insetos', ges:'Ovos: 28 dias', nota:'É o ancestral de quase todos os patos domésticos.'},
  {id:'periquito', n:'Periquito-australiano', c:'Melopsittacus undulatus', p:25, vida:8, hab:'Campos secos da Austrália', die:'Sementes', ges:'Ovos: 18 dias', nota:'Os machos conseguem imitar a fala humana.'},
  {id:'tartaruga', n:'Tartaruga-de-orelha-vermelha', c:'Trachemys scripta elegans', p:25, vida:30, hab:'Rios da América do Norte', die:'Onívora', ges:'Ovos: 60 a 80 dias', nota:'O nome vem da mancha vermelha atrás do olho.'},
  {id:'porquinho', n:'Porquinho-da-índia', c:'Cavia porcellus', p:30, vida:6, hab:'Domesticado nos Andes', die:'Herbívoro: capim e verduras', ges:'59 a 72 dias', nota:'Não produz vitamina C: precisa dela na comida.'},
  {id:'coelho', n:'Coelho-doméstico', c:'Oryctolagus cuniculus', p:40, vida:9, hab:'Casas e fazendas', die:'Herbívoro: feno e verduras', ges:'31 dias', nota:'Os dentes crescem a vida inteira.'},
  {id:'canario', n:'Canário', c:'Serinus canaria domestica', p:40, vida:10, hab:'Originário das Ilhas Canárias', die:'Sementes', ges:'Ovos: 13 a 14 dias', nota:'Os machos são famosos pelo canto.'},
  {id:'iguana', n:'Iguana-verde', c:'Iguana iguana', p:80, vida:15, hab:'Florestas das Américas Central e do Sul', die:'Herbívora: folhas e frutas', ges:'Ovos: cerca de 90 dias', nota:'Tem um "terceiro olho" no alto da cabeça que percebe luz.'},
  {id:'calopsita', n:'Calopsita', c:'Nymphicus hollandicus', p:90, vida:18, hab:'Interior da Austrália', die:'Sementes e frutas', ges:'Ovos: 18 a 21 dias', nota:'A posição da crista mostra o humor dela.'},
  // Comuns
  {id:'piton', n:'Píton-real', c:'Python regius', p:100, vida:25, hab:'Savanas da África Ocidental', die:'Carnívora: roedores', ges:'Ovos: 55 a 60 dias', nota:'Quando se assusta, enrola-se em forma de bola.'},
  {id:'gato', n:'Gato', c:'Felis catus', p:150, vida:15, hab:'Casas, no mundo todo', die:'Carnívoro', ges:'63 a 65 dias', nota:'Passa boa parte do dia dormindo.'},
  {id:'furao', n:'Furão', c:'Mustela putorius furo', p:150, vida:8, hab:'Casas; domesticado na Europa', die:'Carnívoro', ges:'42 dias', nota:'Pode dormir até 18 horas por dia.'},
  {id:'ovelha', n:'Ovelha', c:'Ovis aries', p:150, vida:12, hab:'Pastos, no mundo todo', die:'Herbívora', ges:'147 dias', nota:'Consegue reconhecer rostos de outras ovelhas e de pessoas.'},
  {id:'cabra', n:'Cabra', c:'Capra hircus', p:150, vida:15, hab:'Pastos e montanhas', die:'Herbívora', ges:'150 dias', nota:'Foi um dos primeiros animais domesticados.'},
  {id:'chinchila', n:'Chinchila', c:'Chinchilla lanigera', p:180, vida:15, hab:'Andes do Chile', die:'Herbívora', ges:'111 dias', nota:'Toma banho de pó, não de água, por causa do pelo muito denso.'},
  {id:'porco', n:'Porco', c:'Sus scrofa domesticus', p:200, vida:15, hab:'Fazendas, no mundo todo', die:'Onívoro', ges:'114 dias', nota:'É muito inteligente e aprende comandos.'},
  {id:'pavao', n:'Pavão-indiano', c:'Pavo cristatus', p:200, vida:20, hab:'Índia e Sri Lanka', die:'Onívoro', ges:'Ovos: 28 dias', nota:'A cauda colorida é só do macho.'},
  {id:'jiboia', n:'Jiboia', c:'Boa constrictor', p:250, vida:25, hab:'Florestas das Américas', die:'Carnívora', ges:'100 a 120 dias', nota:'Não tem veneno: mata a presa apertando.'},
  {id:'naja', n:'Naja-indiana', c:'Naja naja', p:300, vida:20, hab:'Sul da Ásia', die:'Carnívora', ges:'Ovos: 48 a 69 dias', nota:'Abre o capuz quando se sente ameaçada e é muito venenosa.'},
  {id:'cao', n:'Cão', c:'Canis familiaris', p:400, vida:13, hab:'Casas, no mundo todo', die:'Onívoro', ges:'63 dias', nota:'O olfato é muito mais sensível que o humano.'},
  {id:'burro', n:'Burro', c:'Equus asinus', p:600, vida:35, hab:'Regiões secas, no mundo todo', die:'Herbívoro', ges:'12 meses', nota:'O zurro alto servia para falar com outros burros de longe.'},
  {id:'suricata', n:'Suricata', c:'Suricata suricatta', p:900, vida:12, hab:'Sul da África', die:'Insetos e pequenos animais', ges:'Cerca de 70 dias', nota:'Sempre há um vigia em pé cuidando do grupo.'},
  // Incomuns
  {id:'papagaio', n:'Papagaio-verdadeiro', c:'Amazona aestiva', p:1000, vida:50, hab:'Brasil, Bolívia, Paraguai e Argentina', die:'Frutas e sementes', ges:'Ovos: 27 dias', nota:'É um dos melhores imitadores da voz humana.'},
  {id:'lhama', n:'Lhama', c:'Lama glama', p:1000, vida:20, hab:'Andes', die:'Herbívora', ges:'11 meses', nota:'Cospe quando está irritada.'},
  {id:'avestruz', n:'Avestruz', c:'Struthio camelus', p:1000, vida:40, hab:'Savanas da África', die:'Onívora', ges:'Ovos: 42 dias', nota:'É a maior ave do mundo e corre até 70 km/h.'},
  {id:'capivara', n:'Capivara', c:'Hydrochoerus hydrochaeris', p:1000, vida:9, hab:'Rios e lagos da América do Sul', die:'Herbívora', ges:'150 dias', nota:'É o maior roedor do mundo.'},
  {id:'vaca', n:'Vaca', c:'Bos taurus', p:1500, vida:20, hab:'Fazendas, no mundo todo', die:'Herbívora', ges:'283 dias', nota:'O estômago tem quatro compartimentos.'},
  {id:'arara', n:'Arara-canindé', c:'Ara ararauna', p:1500, vida:50, hab:'Florestas da América do Sul', die:'Frutas e sementes', ges:'Ovos: 26 dias', nota:'Forma casais que duram a vida toda.'},
  {id:'alpaca', n:'Alpaca', c:'Vicugna pacos', p:2000, vida:20, hab:'Andes', die:'Herbívora', ges:'11 meses', nota:'É criada pela fibra macia.'},
  {id:'jacare', n:'Jacaré-americano', c:'Alligator mississippiensis', p:2000, vida:50, hab:'Pântanos do sudeste dos EUA', die:'Carnívoro', ges:'Ovos: cerca de 65 dias', nota:'A temperatura do ninho define o sexo dos filhotes.'},
  {id:'lemure', n:'Lêmure-de-cauda-anelada', c:'Lemur catta', p:3000, vida:20, hab:'Madagascar', die:'Frutas e folhas', ges:'Cerca de 135 dias', nota:'As fêmeas é que lideram o grupo.'},
  {id:'canguru', n:'Canguru-vermelho', c:'Osphranter rufus', p:3000, vida:20, hab:'Interior da Austrália', die:'Herbívoro', ges:'33 dias', nota:'O filhote nasce do tamanho de um feijão.'},
  {id:'tucano', n:'Tucano-toco', c:'Ramphastos toco', p:3500, vida:20, hab:'Cerrado e matas da América do Sul', die:'Frutas', ges:'Ovos: 17 a 18 dias', nota:'O bico ajuda a controlar a temperatura do corpo.'},
  {id:'cavalo', n:'Cavalo', c:'Equus ferus caballus', p:4500, vida:28, hab:'Fazendas, no mundo todo', die:'Herbívoro', ges:'11 meses', nota:'Consegue dormir em pé.'},
  // Raras
  {id:'zebra', n:'Zebra-da-planície', c:'Equus quagga', p:5000, vida:25, hab:'Savanas da África', die:'Herbívora', ges:'12 a 13 meses', nota:'As listras de cada uma são únicas, como impressões digitais.'},
  {id:'leopardo', n:'Leopardo', c:'Panthera pardus', p:5000, vida:17, hab:'África e Ásia', die:'Carnívoro', ges:'90 a 105 dias', nota:'Carrega as presas para cima das árvores.'},
  {id:'tigre', n:'Tigre', c:'Panthera tigris', p:6000, vida:20, hab:'Florestas da Ásia', die:'Carnívoro', ges:'100 a 105 dias', nota:'As listras também aparecem na pele, não só no pelo.'},
  {id:'leao', n:'Leão', c:'Panthera leo', p:6000, vida:15, hab:'Savanas da África', die:'Carnívoro', ges:'Cerca de 110 dias', nota:'É o único felino grande que vive em grupo.'},
  {id:'camelo', n:'Dromedário', c:'Camelus dromedarius', p:7000, vida:40, hab:'Desertos do Norte da África e do Oriente Médio', die:'Herbívoro', ges:'13 meses', nota:'A corcova guarda gordura, não água.'},
  {id:'urso', n:'Urso-pardo', c:'Ursus arctos', p:7000, vida:30, hab:'Florestas da América do Norte, Europa e Ásia', die:'Onívoro', ges:'6 a 8 meses', nota:'Passa o inverno em hibernação.'},
  {id:'macaco', n:'Macaco-prego', c:'Sapajus apella', p:9000, vida:40, hab:'Florestas da América do Sul', die:'Onívoro', ges:'Cerca de 5 meses', nota:'Usa pedras como ferramentas para abrir cocos.'},
  // Lendárias
  {id:'guepardo', n:'Guepardo', c:'Acinonyx jubatus', p:30000, vida:12, hab:'Savanas da África', die:'Carnívoro', ges:'90 a 95 dias', nota:'É o animal terrestre mais rápido, perto de 100 km/h.'},
  {id:'hipopotamo', n:'Hipopótamo', c:'Hippopotamus amphibius', p:30000, vida:45, hab:'Rios da África', die:'Herbívoro', ges:'8 meses', nota:'Mesmo pesado, corre mais que uma pessoa.'},
  {id:'girafa', n:'Girafa', c:'Giraffa camelopardalis', p:40000, vida:25, hab:'Savanas da África', die:'Herbívora: folhas altas', ges:'15 meses', nota:'O pescoço tem 7 vértebras, o mesmo número que o nosso.'},
  {id:'rinoceronte', n:'Rinoceronte-branco', c:'Ceratotherium simum', p:50000, vida:40, hab:'Savanas do sul da África', die:'Herbívoro', ges:'16 meses', nota:'O chifre é feito de queratina, como as nossas unhas.'},
  {id:'elefante', n:'Elefante-africano', c:'Loxodonta africana', p:60000, vida:65, hab:'Savanas da África', die:'Herbívoro', ges:'22 meses', nota:'Tem a gestação mais longa entre os mamíferos terrestres.'},
  {id:'gorila', n:'Gorila-ocidental', c:'Gorilla gorilla', p:150000, vida:40, hab:'Florestas da África Central', die:'Principalmente plantas', ges:'8,5 meses', nota:'Compartilha cerca de 98% do DNA com os humanos.'},
];
const ESP = Object.fromEntries(ESPECIES.map((e, i) => [e.id, Object.assign(e, {i})]));

const CATEGORIAS = [
  // nmin e nmax: a nota dos animais desta categoria vai de um ao outro, conforme a média dos 5 status
  // peso: chance (%) de cada espécie sorteada no mercado ser desta categoria
  {id:'basica', n:'Básica', ate:100, nmin:1, nmax:10, peso:42},
  {id:'comum', n:'Comum', ate:1000, nmin:15, nmax:27, peso:30},
  {id:'incomum', n:'Incomum', ate:5000, nmin:150, nmax:400, peso:18},
  {id:'rara', n:'Rara', ate:25000, nmin:2000, nmax:2800, peso:8},
  {id:'lendaria', n:'Lendária', ate:Infinity, nmin:9000, nmax:15000, peso:2},
];
const categoria = e => CATEGORIAS.find(c => e.p < c.ate);

// Cadeia alimentar: po = porte (1 a 6); caca = maior porte que o predador consegue pegar. Só caça quem é maior que a presa.
const PORTES = ['', 'Mini', 'Pequeno', 'Médio', 'Grande', 'Muito grande', 'Gigante'];
[
  'hamster rato peixe periquito canario calopsita',
  'galinha pato porquinho coelho chinchila furao suricata tartaruga iguana papagaio arara tucano lemure naja piton gato',
  'pavao cao ovelha cabra porco capivara jiboia macaco alpaca lhama canguru',
  'burro vaca cavalo zebra avestruz jacare leopardo guepardo camelo',
  'leao tigre urso',
  'girafa hipopotamo rinoceronte elefante gorila',
].forEach((l, i) => l.split(' ').forEach(id => { ESP[id].po = i + 1; ESP[id].caca = 0; }));
Object.entries({gato:1, furao:1, naja:1, piton:1, suricata:1, jiboia:2, cao:2, jacare:3, leopardo:3, guepardo:3, leao:4, tigre:4, urso:4}).forEach(([id, c]) => { ESP[id].caca = c; });
const come = (a, b) => a !== b && ESP[a].caca >= ESP[b].po && ESP[a].po > ESP[b].po;
const fotoEsp = id => `img/animais/${id}.jpg`;
