import { initializeApp, getApps, getApp } from 'firebase/app';
// Firestore "lite" (REST): o site só faz leituras/escritas pontuais, sem tempo real.
// Reduz ~110 kB gzip do bundle inicial. O Auth fica em firebaseAuth.ts, carregado só no painel.
import { getFirestore } from 'firebase/firestore/lite';
import firebaseConfig from '../firebase-applet-config.json';

export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
