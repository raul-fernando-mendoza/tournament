
// Import the functions you need from the SDKs you need
import { FirebaseApp, initializeApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";
import { getFirestore, Firestore } from 'firebase/firestore/lite';
import { connectStorageEmulator, FirebaseStorage, getStorage } from "firebase/storage";
export const isDebug = true

const firebaseConfig = {
  apiKey: "AIzaSyDUc-FKXKaMmtu9f4m-mu27VxV01IwOC9Y",
  authDomain: "rax-tournament-dev.firebaseapp.com",
  projectId: "rax-tournament-dev",
  storageBucket: "rax-tournament-dev.appspot.com",
  messagingSenderId: "1037635511206",
  appId: "1:1037635511206:web:4802ddbe5a6a2a51fe2567"
};

// Initialize Firebase
export const app:FirebaseApp  = initializeApp(firebaseConfig);
export const db:Firestore  = getFirestore(app);
export const auth:Auth = getAuth(app)

export const storage:FirebaseStorage = getStorage(app)

connectStorageEmulator(storage,'localhost', 9199)

export var environment = { 
  production: false,
  recaptcha: {
    siteKey: '6Lep2dkpAAAAAHSgbegNP9Vg87VzHYSgrZ3NU6dY',
    secretKey:'6Lep2dkpAAAAAPjhhH8AN5wigYkfB-AGilBapRfu',
    url:'http://localhost:3000/your-page.html'
    //url:'https://us-central1-rax-tournament-dev.cloudfunctions.net/captchaserver'
  },  
}




