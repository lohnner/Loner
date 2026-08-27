import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, onAuthStateChanged, setPersistence, browserLocalPersistence, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCfHLrtPMnLtfU-PvsVf5QCOXKmuZya51I",
  authDomain: "loner-hq.firebaseapp.com",
  projectId: "loner-hq",
  storageBucket: "loner-hq.firebasestorage.app",
  messagingSenderId: "290842361996",
  appId: "1:290842361996:web:f1010f32a520a7148f7ba9",
  measurementId: "G-0X2Y1KQFEE"
};

const books = [
  {id:"origem-especies",title:"A origem das espécies",author:"Charles Darwin",year:1859,category:"Ciência",tone:"tone-green",coverAuthor:"CHARLES DARWIN",coverTitle:"A ORIGEM DAS ESPÉCIES",pages:502,language:"Português",description:"Obra fundamental da biologia moderna, na qual Darwin apresenta evidências para a evolução das espécies e explica o mecanismo da seleção natural."},
  {id:"meditacoes",title:"Meditações",author:"Marco Aurélio",year:180,category:"Filosofia",tone:"tone-charcoal",coverAuthor:"MARCO AURÉLIO",coverTitle:"MEDITAÇÕES",pages:224,language:"Português",description:"Reflexões pessoais de um imperador romano sobre ética, disciplina, dever e serenidade, hoje consideradas um dos principais textos do estoicismo."},
  {id:"o-principe",title:"O Príncipe",author:"Nicolau Maquiavel",year:1532,category:"Política",tone:"tone-red",coverAuthor:"NICOLAU MAQUIAVEL",coverTitle:"O PRÍNCIPE",pages:176,language:"Português",description:"Uma análise direta sobre poder, governo e liderança que marcou profundamente o pensamento político ocidental."},
  {id:"orgulho-preconceito",title:"Orgulho e preconceito",author:"Jane Austen",year:1813,category:"Literatura",tone:"tone-sand",coverAuthor:"JANE AUSTEN",coverTitle:"ORGULHO E PRECONCEITO",pages:424,language:"Português",description:"Romance sobre Elizabeth Bennet e Fitzwilliam Darcy que combina ironia, crítica social e uma das histórias de amor mais celebradas da literatura."},
  {id:"dom-casmurro",title:"Dom Casmurro",author:"Machado de Assis",year:1899,category:"Literatura",tone:"tone-navy",coverAuthor:"MACHADO DE ASSIS",coverTitle:"DOM CASMURRO",pages:256,language:"Português",description:"Bentinho revisita sua juventude e seu relacionamento com Capitu em uma narrativa magistral sobre memória, ciúme e dúvida."},
  {id:"republica",title:"A República",author:"Platão",year:-375,category:"Filosofia",tone:"tone-blue",coverAuthor:"PLATÃO",coverTitle:"A REPÚBLICA",pages:416,language:"Português",description:"Diálogo filosófico dedicado à justiça, à educação e à organização da sociedade ideal, incluindo a célebre alegoria da caverna."},
  {id:"discurso-metodo",title:"Discurso do método",author:"René Descartes",year:1637,category:"Filosofia",tone:"tone-purple",coverAuthor:"RENÉ DESCARTES",coverTitle:"DISCURSO DO MÉTODO",pages:128,language:"Português",description:"Descartes apresenta seu método de investigação racional e estabelece fundamentos que influenciariam toda a filosofia moderna."},
  {id:"viagem-centro-terra",title:"Viagem ao centro da Terra",author:"Júlio Verne",year:1864,category:"Literatura",tone:"tone-rust",coverAuthor:"JÚLIO VERNE",coverTitle:"VIAGEM AO CENTRO DA TERRA",pages:304,language:"Português",description:"Uma expedição fantástica atravessa uma passagem vulcânica rumo a um mundo subterrâneo repleto de descobertas e perigos."}
];

const categoryDescriptions = {
  "Ciência":"Natureza, vida, matéria e as ideias que explicam o universo.","História":"Civilizações, acontecimentos e pessoas que moldaram o mundo.","Filosofia":"Questões fundamentais sobre existência, ética e conhecimento.","Literatura":"Romances, poesia, contos e grandes narrativas humanas.","Política":"Poder, Estado, sociedade e pensamento político.","Arte":"Pintura, música, arquitetura e expressão cultural.","Tecnologia":"Invenções, computação e transformação digital.","Geografia":"Territórios, povos, paisagens e o planeta.","Culinária":"Técnicas, ingredientes, culturas alimentares e receitas.","Economia":"Produção, comércio, recursos e organização econômica.","Biografias":"Vidas que deixaram marcas na história.","Conhecimentos práticos":"Habilidades úteis para situações do cotidiano."
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
provider.setCustomParameters({prompt:"select_account"});

const landing = document.querySelector("#landing");
const library = document.querySelector("#library");
const loginButton = document.querySelector("#google-login");
const logoutButton = document.querySelector("#logout");
const authMessage = document.querySelector("#auth-message");
const libraryNav = document.querySelector("#library-nav");
const userMenu = document.querySelector("#user-menu");
const userName = document.querySelector("#header-user-name");
const userPhoto = document.querySelector("#header-user-photo");
const catalogGrid = document.querySelector("#catalog-grid");
const shelfGrid = document.querySelector("#shelf-grid");
const categoryGrid = document.querySelector("#category-grid");
const searchInput = document.querySelector("#book-search");
const sortSelect = document.querySelector("#sort-books");
const shelfCount = document.querySelector("#shelf-count");
const emptyShelf = document.querySelector("#empty-shelf");
const noResults = document.querySelector("#no-results");
const bookDialog = document.querySelector("#book-dialog");
const dialogContent = document.querySelector("#dialog-content");
let currentUser = null;
let savedBooks = new Set();

function fallbackAvatar(name){const initial=(name||"L").trim().charAt(0).toUpperCase();const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100%" height="100%" fill="#2a2722"/><text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" fill="#d09a54" font-family="serif" font-size="44">${initial}</text></svg>`;return `data:image/svg+xml,${encodeURIComponent(svg)}`}
function shelfKey(){return currentUser?`loner-shelf-${currentUser.uid}`:"loner-shelf-guest"}
function loadShelf(){try{savedBooks=new Set(JSON.parse(localStorage.getItem(shelfKey())||"[]"))}catch{savedBooks=new Set()}updateShelf()}
function saveShelf(){localStorage.setItem(shelfKey(),JSON.stringify([...savedBooks]));updateShelf();renderCatalog(getFilteredBooks())}
function formatYear(year){return year<0?`${Math.abs(year)} a.C.`:String(year)}
function coverMarkup(book){if(book.id==="origem-especies")return `<img class="book-cover book-cover-image" src="assets/A%20Origem%20das%20Espécies.png" alt="Capa de ${book.title}">`;return `<div class="book-cover ${book.tone}"><small>${book.coverAuthor}</small><strong>${book.coverTitle}</strong><em>${formatYear(book.year)}</em></div>`}
function bookCard(book){const saved=savedBooks.has(book.id);return `<article class="book-card" data-book-card="${book.id}">${coverMarkup(book)}<div class="book-meta"><span class="category">${book.category}</span><h3>${book.title}</h3><p>${book.author} · ${formatYear(book.year)}</p><div class="card-buttons"><button class="details-button" type="button" data-open-book="${book.id}">Ver detalhes</button><button class="heart-button ${saved?"saved":""}" type="button" data-save-book="${book.id}" aria-label="${saved?"Remover da":"Adicionar à"} estante">${saved?"♥":"♡"}</button></div></div></article>`}
function getFilteredBooks(){const query=searchInput.value.trim().toLocaleLowerCase("pt-BR");let list=books.filter(book=>`${book.title} ${book.author} ${book.category}`.toLocaleLowerCase("pt-BR").includes(query));const sort=sortSelect.value;if(sort==="title")list.sort((a,b)=>a.title.localeCompare(b.title,"pt-BR"));if(sort==="author")list.sort((a,b)=>a.author.localeCompare(b.author,"pt-BR"));if(sort==="year")list.sort((a,b)=>a.year-b.year);return list}
function renderCatalog(list=books){catalogGrid.innerHTML=list.map(bookCard).join("");noResults.classList.toggle("hidden",list.length>0)}
function updateShelf(){const list=books.filter(book=>savedBooks.has(book.id));shelfGrid.innerHTML=list.map(bookCard).join("");shelfCount.textContent=String(list.length);emptyShelf.classList.toggle("hidden",list.length>0)}
function renderCategories(){categoryGrid.innerHTML=Object.entries(categoryDescriptions).map(([name,description],index)=>{const count=books.filter(book=>book.category===name).length;return `<button class="category-card" type="button" data-category="${name}"><span>${String(index+1).padStart(2,"0")}</span><h3>${name}</h3><p>${description}${count?` · ${count} ${count===1?"obra":"obras"} no acervo inicial.`:" · Em expansão."}</p></button>`}).join("")}
function showView(name){document.querySelectorAll("[data-library-view]").forEach(view=>{const active=view.dataset.libraryView===name;view.classList.toggle("active",active);view.hidden=!active});document.querySelectorAll(".nav-link").forEach(link=>link.classList.toggle("active",link.dataset.view===name));window.scrollTo({top:0,behavior:"smooth"})}
function toggleSaved(id){if(savedBooks.has(id))savedBooks.delete(id);else savedBooks.add(id);saveShelf()}
function openBook(id){if(id==="origem-especies"){window.location.href="livros/origem-das-especies.html";return}const book=books.find(item=>item.id===id);if(!book)return;const saved=savedBooks.has(id);dialogContent.innerHTML=`<div class="dialog-layout">${coverMarkup(book)}<div class="dialog-info"><p class="eyebrow">${book.category.toUpperCase()}</p><h2>${book.title}</h2><p class="dialog-author">por ${book.author}</p><p class="dialog-description">${book.description}</p><div class="dialog-facts"><div><small>PUBLICAÇÃO</small><strong>${formatYear(book.year)}</strong></div><div><small>EDIÇÃO</small><strong>${book.pages} páginas</strong></div><div><small>IDIOMA</small><strong>${book.language}</strong></div></div><button class="primary-action" type="button" data-save-book="${book.id}">${saved?"Remover da estante":"Adicionar à estante"}</button></div></div>`;if(!bookDialog.open)bookDialog.showModal()}
function showLibrary(user){currentUser=user;userName.textContent=(user.displayName||"Leitor").split(" ")[0];userPhoto.src=user.photoURL||fallbackAvatar(user.displayName);landing.classList.add("hidden");library.classList.remove("hidden");libraryNav.classList.remove("hidden");userMenu.classList.remove("hidden");loadShelf();renderCatalog();renderCategories();document.title="Acervo — Loner"}
function showLanding(){currentUser=null;landing.classList.remove("hidden");library.classList.add("hidden");libraryNav.classList.add("hidden");userMenu.classList.add("hidden");document.title="Loner — Biblioteca de conhecimento"}
function friendlyError(error){const messages={"auth/popup-closed-by-user":"A janela de login foi fechada antes de concluir.","auth/popup-blocked":"O navegador bloqueou a janela. Libere pop-ups e tente novamente.","auth/unauthorized-domain":"Este endereço ainda não foi autorizado no Firebase.","auth/network-request-failed":"Sem conexão com o Google. Verifique sua internet."};return messages[error.code]||"Não foi possível entrar agora. Tente novamente."}

loginButton.addEventListener("click",async()=>{loginButton.disabled=true;authMessage.textContent="Abrindo acesso seguro...";try{await setPersistence(auth,browserLocalPersistence);await signInWithPopup(auth,provider);authMessage.textContent=""}catch(error){console.error("Falha no login:",error);authMessage.textContent=friendlyError(error)}finally{loginButton.disabled=false}});
logoutButton.addEventListener("click",async()=>{logoutButton.disabled=true;try{await signOut(auth)}finally{logoutButton.disabled=false}});
document.addEventListener("click",event=>{const open=event.target.closest("[data-open-book]");const save=event.target.closest("[data-save-book]");const nav=event.target.closest("[data-view]");const category=event.target.closest("[data-category]");if(open)openBook(open.dataset.openBook);if(save){toggleSaved(save.dataset.saveBook);if(bookDialog.open)openBook(save.dataset.saveBook)}if(nav)showView(nav.dataset.view);if(category){searchInput.value=category.dataset.category;renderCatalog(getFilteredBooks());showView("catalog")}if(event.target.closest("[data-go-catalog]"))showView("catalog")});
searchInput.addEventListener("input",()=>{renderCatalog(getFilteredBooks());if(!document.querySelector('[data-library-view="catalog"]').classList.contains("active"))showView("catalog")});
sortSelect.addEventListener("change",()=>renderCatalog(getFilteredBooks()));
document.querySelector(".dialog-close").addEventListener("click",()=>bookDialog.close());
bookDialog.addEventListener("click",event=>{if(event.target===bookDialog)bookDialog.close()});
onAuthStateChanged(auth,user=>user?showLibrary(user):showLanding());