import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCGxOun_u06IDG8zQ4JeFlssuZr-WrLTVs",
  authDomain: "investiband.firebaseapp.com",
  projectId: "investiband",
  storageBucket: "investiband.firebasestorage.app",
  messagingSenderId: "1040009077384",
  appId: "1:1040009077384:web:df011e361b1f67ea12b53d",
  measurementId: "G-DCP4HSWMLY",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
