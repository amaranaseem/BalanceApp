// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB7hOJ03V8ZjW9aLPoGmQPvEl3Ok1rdUhs",
  authDomain: "balanceapp-f31ec.firebaseapp.com",
  projectId: "balanceapp-f31ec",
  storageBucket: "balanceapp-f31ec.firebasestorage.app",
  messagingSenderId: "597088385440",
  appId: "1:597088385440:web:cf90443cc6719b62bd4cc5",
  measurementId: "G-SPWXB3Y50K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

