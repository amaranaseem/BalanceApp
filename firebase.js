import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCLRUrBSbk4N7Ey0p6dHZIXdjO0xHjNn50",
  authDomain: "balanceapp-3df44.firebaseapp.com",
  projectId: "balanceapp-3df44",
  storageBucket: "balanceapp-3df44.appspot.com",
  messagingSenderId: "944505135387",
  appId: "1:944505135387:web:bc5e258c1637b7120cf3be",
};


const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
export const auth = getAuth(app);