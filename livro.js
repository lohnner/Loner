import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
const firebaseConfig={apiKey:"AIzaSyCfHLrtPMnLtfU-PvsVf5QCOXKmuZya51I",authDomain:"loner-hq.firebaseapp.com",projectId:"loner-hq",storageBucket:"loner-hq.firebasestorage.app",messagingSenderId:"290842361996",appId:"1:290842361996:web:f1010f32a520a7148f7ba9",measurementId:"G-0X2Y1KQFEE"};
const auth=getAuth(initializeApp(firebaseConfig));
const saveButton=document.querySelector("#save-book");
const readerName=document.querySelector("#reader-name");
const readerPhoto=document.querySelector("#reader-photo");
const bookId="origem-especies";
let user=null;
function fallbackAvatar(name){const initial=(name||"L").trim().charAt(0).toUpperCase();const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100%" height="100%" fill="#2a2722"/><text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" fill="#d09a54" font-family="serif" font-size="44">${initial}</text></svg>`;return `data:image/svg+xml,${encodeURIComponent(svg)}`}
function shelfKey(){return `loner-shelf-${user.uid}`}
function shelf(){try{return new Set(JSON.parse(localStorage.getItem(shelfKey())||"[]"))}catch{return new Set()}}
function updateButton(){const saved=shelf().has(bookId);saveButton.textContent=saved?"✓ Na minha estante":"＋ Adicionar à estante";saveButton.setAttribute("aria-pressed",String(saved))}
saveButton.addEventListener("click",()=>{if(!user)return;const books=shelf();if(books.has(bookId))books.delete(bookId);else books.add(bookId);localStorage.setItem(shelfKey(),JSON.stringify([...books]));updateButton()});
onAuthStateChanged(auth,currentUser=>{if(!currentUser){window.location.replace("../index.html");return}user=currentUser;readerName.textContent=(user.displayName||"Leitor").split(" ")[0];readerPhoto.src=user.photoURL||fallbackAvatar(user.displayName);updateButton();document.body.classList.remove("auth-pending")});