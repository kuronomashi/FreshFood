// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore  } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCcDCbQFqjgZ-gsTTJEXJaQiepCvkA04aY",
  authDomain: "kuronoma-851c5.firebaseapp.com",
  projectId: "kuronoma-851c5",
  storageBucket: "kuronoma-851c5.firebasestorage.app",
  messagingSenderId: "852327038982",
  appId: "1:852327038982:web:b477caf822287e305ec387",
  measurementId: "G-70BML5KTGW"
};

// Initialize Firebase

const app = initializeApp(firebaseConfig);
const Db = getFirestore(app);
const auth = getAuth(app);

export {Db,auth};
