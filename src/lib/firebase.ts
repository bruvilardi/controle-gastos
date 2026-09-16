import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "gen-lang-client-0020790142",
  appId: "1:502777372192:web:4fc22c0387e7e3daf0a645",
  apiKey: "AIzaSyD3mGT2S7jW8AuCIysYfViRHxfM3zSN1lU",
  authDomain: "gen-lang-client-0020790142.firebaseapp.com",
  storageBucket: "gen-lang-client-0020790142.firebasestorage.app",
  messagingSenderId: "502777372192",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, "ai-studio-quantopossogasta-5848365f-03f8-4884-8196-9841783ac101");
