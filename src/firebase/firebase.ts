import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { FIREBASE_CONFIG } from "../config";

const app = initializeApp(FIREBASE_CONFIG);

// Firestore インスタンス
export const db = getFirestore(app);
