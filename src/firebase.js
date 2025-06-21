// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your firebaseConfig (paste it here!)
const firebaseConfig = {
  apiKey: "AIzaSyCUieXTn29Dsci7y2GrHcepcX035glOJiQ",
  authDomain: "Ymy-react-app-1969a.firebaseapp.com",
  projectId: "my-react-app-1969a",
  storageBucket: "my-react-app-1969a.firebasestorage.app",
  messagingSenderId: "711764793188",
  appId: "1:711764793188:web:fdc385654095896d404c71"
 // measurementId: "G-PDQ6N9ZBC8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

export { db };
