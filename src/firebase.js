import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage"; 


const firebaseConfig = {
  apiKey: "AIzaSyCUieXTn29Dsci7y2GrHcepcX035glOJiQ",
  authDomain: "my-react-app-1969a.firebaseapp.com",
  projectId: "my-react-app-1969a",
  storageBucket: "my-react-app-1969a.firebasestorage.app",
  messagingSenderId: "711764793188",
  appId: "1:711764793188:web:fdc385654095896d404c71"
};


const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const auth = getAuth(app);

const storage = getStorage(app);

export { db, auth, storage };
