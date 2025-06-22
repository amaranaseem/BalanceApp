import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCr5MTrhx40kSRMy-g7fLoVZUWj3e5fWKk",
  authDomain: "balanceapp-22bdb.firebaseapp.com",
  projectId: "balanceapp-22bdb",
  storageBucket: "balanceapp-22bdb.firebasestorage.app",
  messagingSenderId: "590863140329",
  appId: "1:590863140329:web:e977c9e871581dcc4af778"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;