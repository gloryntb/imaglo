// 1. Firebase inladen via het internet
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 2. Jouw persoonlijke codes die je eerder in de screenshot liet zien
const firebaseConfig = {
  apiKey: "AIzaSyBxmmWATHbvmz800u56ZX_zaXU-AxIjAM4",
  authDomain: "loveline-cc923.firebaseapp.com",
  projectId: "loveline-cc923",
  storageBucket: "loveline-cc923.firebasestorage.app",
  messagingSenderId: "840718452710",
  appId: "1:840718452710:web:4f9cef08a4d060e803b827",
  measurementId: "G-VEEQWL7W3F"
};

// 3. Start Firebase op
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 4. Maak de database beschikbaar voor messages.js
window.db = db;
console.log("🔥 Firebase is succesvol gekoppeld!");